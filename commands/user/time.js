module.exports = {
	desc: 'Tells you the current in-game time.',
	aliases: ['gametime'],
	task(bot, msg) {
		function addZero(i) {
			if (i < 10) i = '0' + i;
			return i;
		}
		let d = new Date();

		bot.createMessage(msg.channel.id, `The current in-game time is **${addZero(d.getUTCHours())}:${addZero(d.getUTCMinutes())}**`);
	}
}