var reload = require('require-reload');
var superagent = reload('superagent');
var config = require('../../config.json');
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);
var asciiTable = reload('ascii-table');
var entities = require('html-entities').AllHtmlEntities;
var truncate = require('truncate');

module.exports = {
	desc: 'Gets the last 5 entries of a user\'s adventurer\'s log.',
	cooldown: 10,
	aliases: ['log'],
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';

		superagent.get(`http://services.runescape.com/m=adventurers-log/a=13/rssfeed?searchName=${suffix}`).end((error, response) => {
			if (error) {
				logger.warn('Error getting stats for a user: ' + (error.status || error.response));
				bot.createMessage(msg.channel.id, 'There was an error while grabbing the adventurer\'s log for \'' + suffix + '\'. Please try again later.').then(sentMsg => {
					setTimeout(() => { msg.delete(); sentMsg.delete(); }, 10000); // Delete messages after 10 seconds.
				});
			} else {
				let alogBody = response.text;
				let alogText = alogBody.slice(alogBody.indexOf('<item>'), alogBody.indexOf('</channel>'));
				let alogData = alogText.split('</item>');
				let table = new asciiTable();

				table.setTitle(`VIEWING ADVENTURER'S LOG FOR ${suffix.toUpperCase()}`).setHeading('Achievement', 'Date');

				for (let i = 0; i < 5; i++) {
					if (alogData[i] == null) break; // Break out of loop if it doesn't have 5 entires.
					table.addRow(truncate(entities.decode(alogData[i].slice(alogData[i].indexOf('<title>') + 7, alogData[i].indexOf('</title>'))), 40), alogData[0].slice(alogData[0].indexOf('<pubDate>') + 9, alogData[0].indexOf('00:00:00') - 1));
				}

				bot.createMessage(msg.channel.id, '```' + table.toString() + '```');
			}
		});
	}
}