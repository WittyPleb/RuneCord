var superagent = require('superagent');
var reload = require('require-reload');
var config = require('../../config.json');
var utils = require('../../utils/utils.js');
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);
var Nf = new Intl.NumberFormat('en-US');

module.exports = {
	desc: 'Tells you much XP you\'d gain in various skills from god statues.',
	cooldown: 10,
	usage: '<username>',
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

					let conXp = utils.getLampXp(result[23][1], 'large');
					let prayerXp = utils.getLampXp(result[6][1], 'medium');
					let slayerXp = utils.getLampXp(result[19][1], 'medium');

					bot.createMessage(msg.channel.id, `\`\`\`md
# Statue Statistics for ${suffix}

# Construction XP at level ${result[23][1]}
${Nf.format(conXp)}

# Prayer XP at level ${result[6][1]}
${Nf.format(prayerXp)}

# Slayer XP at level ${result[19][1]}
${Nf.format(slayerXp)}

# Total for all 5 statues
${Nf.format(conXp * 5)} Construction XP
${Nf.format(prayerXp * 5)} Prayer XP OR ${Nf.format(slayerXp * 5)} Slayer XP\`\`\``);
				}
			});
	}
}