/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

/* REQUIRED DEPENDENCIES */
var reload     = require('require-reload');
var superagent = require('superagent');

/* REQUIRED FILES */
var config = reload('../../config.json');
var utils  = reload('../../utils/utils.js');

/* LOCAL VARIABLES */
var logger = new (reload('../../utils/Logger.js'))(config.logTimestamp);

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
					bot.createMessage(msg.channel.id, 'There was an error while grabbing the stats for \'' + suffix + '\'. Please try again later.');
				} else {
					let statData = response.text.split('\n');
					let result = [];
					for (let i = 0; i < 28; i++) {
						result[i] = statData[i].split(',');
					}

					let conXp = utils.getLampXp(result[23][1], 'large');
					let prayerXp = utils.getLampXp(result[6][1], 'medium');
					let slayerXp = utils.getLampXp(result[19][1], 'medium');

					process.on('unhandledRejection', (err) => {
						if (err.code == 50013) {
							bot.createMessage(msg.channel.id, "I don't have permission to embed things, please give me the `Embed Links` permission!");
						}
					});

					bot.createMessage(msg.channel.id, {
						embed: {
							title: 'God Statue Statistics for ' + suffix,
							description: "How much XP you'd gain from all 5 statues.\n",
							fields: [
								{ name: 'Construction XP', value: `${Nf.format(conXp)}`, inline: true },
								{ name: 'Prayer XP', value: `${Nf.format(prayerXp)}`, inline: true },
								{ name: 'Slayer XP', value: `${Nf.format(slayerXp)}`, inline: true },
								{ name: 'Total XP', value: `**${Nf.format(conXp * 5)}** Construction XP\n**${Nf.format(prayerXp * 5)}** Prayer XP OR **${Nf.format(slayerXp * 5)}** Slayer XP` }
							]
						}
					});
				}
			});
	}
}