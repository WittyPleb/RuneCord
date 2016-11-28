var Nf = new Intl.NumberFormat('en-US');

module.exports = {
	desc: 'Tells you how much XP you\'d get or GP you\'d get from penguins.',
	cooldown: 2,
	usage: '<points> [level]',
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';

		let points = suffix.split(' ')[0];
		let level = suffix.split(' ')[1];

		if (!points || !parseInt(points)) return 'wrong usage';

		if (points && !level) {
			let pengGp = 6500 * points;
			bot.createMessage(msg.channel.id, `You'd gain **${Nf.format(pengGp)}** coins, if you use **${points}** points.`);
			return;
		} else {
			if (level < 1 || level > 120) {
				bot.createMessage(msg.channel.id, 'Please use a number between 1-120 for the level.');
				return;
			}
			let pengXp = 25 * level * points;
			bot.createMessage(msg.channel.id, `You'd gain **${Nf.format(pengXp)}** XP at level **${level}** if you used **${points}** points.`);
			return;
		}
	}
}