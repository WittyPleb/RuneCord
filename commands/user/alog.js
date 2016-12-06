/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var entities   = require('html-entities').AllHtmlEntities;
var truncate   = require('truncate');
var superagent = require('superagent');
var asciiTable = require('ascii-table');

/* REQUIRED FILES */
var config = reload('../../config.json');
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
	desc: 'Gets the last 5 entries of a user\'s adventurer\'s log.',
	cooldown: 10,
	aliases: ['log'],
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';

		superagent.get(`http://services.runescape.com/m=adventurers-log/a=13/rssfeed?searchName=${suffix}`).end((error, response) => {
			if (error) {
				logger.warn('Error getting stats for a user: ' + (error.status || error.response));
				bot.createMessage(msg.channel.id, 'There was an error while grabbing the adventurer\'s log for \'' + suffix + '\'. Please try again later.');
			} else {
				let alogBody = response.text;
				let alogText = alogBody.slice(alogBody.indexOf('<item>'), alogBody.indexOf('</channel>'));
				let alogData = alogText.split('</item>');
				let table = new asciiTable();

				table.setTitle(`VIEWING ADVENTURER'S LOG FOR ${suffix.toUpperCase()}`).setHeading('Achievement', 'Date');

				for (let i = 0; i < 15; i++) {
					if (alogData[i] == null) break; // Break out of loop if it doesn't have 15 entires.
					table.addRow(truncate(entities.decode(alogData[i].slice(alogData[i].indexOf('<title>') + 7, alogData[i].indexOf('</title>'))), 40), alogData[i].slice(alogData[i].indexOf('<pubDate>') + 9, alogData[i].indexOf('00:00:00') - 1));
				}

				bot.createMessage(msg.channel.id, '```' + table.toString() + '```');
			}
		});
	}
}