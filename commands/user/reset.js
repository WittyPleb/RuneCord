module.exports = {
	desc: 'Tells you when the game will reset.',
	cooldown: 5,
	task(bot, msg) {
		let resetTime = new Date().setUTCHours(24, 0, 0, 0) - Date.now();
		let hours = Math.floor(resetTime / 1000 / 60 / 60);
		resetTime -= hours * 1000 * 60 * 60;

		let minutes = Math.floor(resetTime / 1000 / 60);
		resetTime -= minutes * 1000 * 60;

		let timestr = '';

		if (hours > 0) {
			timestr += `${hours} hour${hours > 1 ? 's' : ''}`;
		}

		if (minutes > 0) {
			timestr += ` ${minutes} minute${minutes > 1 ? 's' : ''}`;
		}

		bot.createMessage(msg.channel.id, `The game will reset in **${timestr}**.`);
	}
}