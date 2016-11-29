/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

module.exports = {
	desc: "Tells you how much XP you'd get from Jack of Trades.",
	help: "Tells you how much XP you'd get from Jack of Trades based on what type of JoT you have.",
	cooldown: 5,
	usage: "<normal|master|supreme|legendary> <level>",
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';

		let type = suffix.split(' ')[0];
		let level = suffix.split(' ')[1];

		if (!type || !level || !parseInt(level)) return 'wrong usage';

		let xp = 0;

		if (type === 'normal') {
			type = 'Normal';
			xp = 1.5 * (Math.pow(level, 2) - (2 * level) + 100);
		} else if (type === 'master') {
			type = 'Master';
			xp = 2 * (Math.pow(level, 2) - (2 * level) + 100);
		} else if (type === 'supreme') {
			type = 'Supreme';
			xp = 2.5 * (Math.pow(level, 2) - (2 * level) + 100);
		} else if (type === 'legendary') {
			type = 'Legendary';
			xp = 3  * (Math.pow(level, 2) - (2 * level) + 100);
		} else {
			return 'wrong usage';
		}

		bot.createMessage(msg.channel.id, `From a **${type}** Jack of Trades aura, you'd gain **${Nf.format(xp)}** XP if you were level **${level}**.`);
	}
}