/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var superagent = require('superagent');

/* REQUIRED FILES */
var config = reload('../../config.json');
var logger = new(reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
	desc: 'Get the G.E. price of an item.',
	help: 'Get the current price for an item.',
	cooldown: 10,
	usage: '<item name>',
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';

		superagent.get(`http://rscript.org/lookup.php?type=ge&search=${suffix}`).end((error, response) => {
			if (error) {
				logger.warn('Error getting price for an item: ' + (error.status || error.response));
				bot.createMessage(msg.channel.id, 'There was an error while grabbing the price for \'' + suffix + '\'. Please try again later.');
			} else {
				let results = response.text.split('RESULTS: ');
				if (results[1] == null) { bot.createMessage(msg.channel.id, 'Unable to grab prices at this time, please try again later.'); return; }
				if (results[1].substr(0, 1) == 1 && suffix !== null) {
					let itemSplit = results[1].split('ITEM: ');
					let result = itemSplit[2].split(' ');

					let toSend = [];

					toSend.push(`**${result[1].replace(/_/g, ' ')}** -- \`${result[2]}\` GP`);
					toSend.push(`**Change in last 24 hours** -- \`${result[3].slice(0, -5)} GP \`${(result[3].substring(0, 1) === '0' ? ':arrow_right:' : result[3].substring(0, 1) === '-' ? ':arrow_down:' : ':arrow_up:')}`);

					toSend = toSend.join('\n');

					bot.createMessage(msg.channel.id, toSend);
				} else if (results[1].substring(0, 1) > 1) {
					bot.createMessage(msg.channel.id, 'Too many results, please refine your search term better.');
				} else {
					bot.createMessage(msg.channel.id, `Error finding item '${suffix}', please try again.`);
				}
			}
		});
	}
}