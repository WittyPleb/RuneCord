module.exports = {
	desc: 'Tells you when the next Sinkhole D&D will be.',
	cooldown: 5,
	task(bot, msg) {
		let d = new Date();
		let secondsUntil = 3600 - (d.getUTCMinutes() + 30) % 60 * 60 - d.getUTCSeconds();
		let minutesUntil = Math.floor(secondsUntil / 60);
		let timestr = '';

		if (minutesUntil === 0) {
			timestr += '1 hour';
		}

		if (minutesUntil > 0) {
			timestr += `${minutesUntil} minute${minutesUntil > 0 && minutesUntil < 1 ? '' : 's'}`;
		}

		bot.createMessage(msg.channel.id, `The next Sinkhole will start in **${timestr}**.`)
	}
}