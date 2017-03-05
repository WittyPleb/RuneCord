/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var superagent = require('superagent');

/* REQUIRED FILES */
var config = reload('../../config.json');

/* LOCAL VARIABLES */
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
	desc: 'Get the current Viswax combination.',
	cooldown: 10,
	aliases: ['vis', 'wax'],
	task(bot, msg) {
		superagent.get('http://services.runescape.com/m=forum/forums.ws?75,76,387,65763383')
			.end((error, response) => {
				if (error) {
					logger.warn('Error getting Viswax combination: ' + (error.status || error.response));
					bot.createMessage(msg.channel.id, 'There was an error while grabbing the Viswax combination. Please try again later.');
				} else {
					let dateMatch = new RegExp(/combination\s+?for.+?(\d+)(?:..)?;/i).exec(response.text)[1];
					let day = new Date().getUTCDate();

					// Checks if combination is updated
					if (day != dateMatch) {
						bot.createMessage(msg.channel.id, "The combination hasn't been updated yet. Please try again later.");
						return;
					}

					let match = new RegExp(/slot 1:.+?- (.+?)slot 2:.+?- (.+?)slot/i).exec(response.text);
					let slot1 = match[1].replace(/<.+?>/g, ``).trim().split(`-`).map(r => r.trim()).join(`, `);
					let slot2 = match[2].replace(/<.+?>/g, ``).trim().split(`-`).map(r => r.trim()).join(`, `);

					let toSend = [];

					toSend.push(`**First Slot**: ${slot1}`);
					toSend.push(`**Second Slot**: ${slot2}`);

					toSend = toSend.join('\n');

					bot.createMessage(msg.channel.id, toSend);
				}
			});
	}
}