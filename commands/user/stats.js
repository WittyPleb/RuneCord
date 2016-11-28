/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

/* REQUIRED DEPENDENCIES */
var reload = require('require-reload');
var superagent = require('superagent');
var asciiTable = require('ascii-table');

/* REQUIRED FILES */
var config = reload('../../config.json');
var utils = reload('../../utils/utils.js');

/* LOCAL VARIABLES */
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
	desc: 'Displays the stats for the username supplied.',
	usage: '<username>',
	cooldown: 10,
	aliases: ['hs'],
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';
		superagent.get(`http://services.runescape.com/m=hiscore/index_lite.ws?player=${suffix}`)
			.end((error, response) => {
				if (error) {
					logger.warn('Error getting stats for a user: ' + (error.status || error.response));
					bot.createMessage(msg.channel.id, 'There was an error while grabbing the stats for \'' + suffix + '\'. Please try again later.').then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 10000); // Delete messages after 10 seconds.
					});
				} else {
					let statData = response.text.split('\n');
					let result = [];
					for (let i = 0; i < 28; i++) {
						result[i] = statData[i].split(',');
					}
					let table = new asciiTable();

					table.setTitle(`VIEWING STATS FOR ${suffix.toUpperCase()}`);
					table.setHeading('Skill', 'Level', 'Experience', 'Rank');

					for (let i = 0; i < 28; i++) {
						table.addRow(utils.getSkillName(i), result[i][1], Nf.format(result[i][2]), Nf.format(result[i][0]));
					}

					bot.createMessage(msg.channel.id, '```' + table.toString() + '```');
				}
			});
	}
}