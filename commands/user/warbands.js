module.exports = {
	desc: 'Tells you when the next Warbands will be.',
	cooldown: 2,
	aliases: ['wbs'],
	task(bot, msg) {
		let d = new Date();
		let day = d.getUTCDate() - d.getUTCDay();
		let diff = new Date();
		let seconds;

		if (d.getUTCDate() === 0 && d.getUTCHours() < 12) {
			day = day - 7;
		}

		diff.setUTCDate(day);
		diff.setUTCHours(12, 0, 0, 0);
		seconds = d.valueOf() - diff.valueOf();

		if (seconds !== Math.abs(seconds)) {
			return;
		}

		seconds = Math.floor(seconds / 1000);
		seconds = 25200 - (seconds % 25200);

		let hours = Math.floor(seconds / 3600);
		let minutes = Math.floor((seconds % 3600) / 60);
		seconds = (seconds % 3600) % 60;

		let timestr = '';

		if (hours > 0) {
			timestr += `${hours} hour${hours > 1 ? 's' : ''}`;
		}

		if (hours >= 1 && minutes < 1) {
			timestr += `${minutes} minute${minutes > 0 && minutes < 2 ? '' : 's'}`;
		}

		if (minutes < 1 && hours < 1) {
			timestr += 'less than a minute';
		}

		bot.createMessage(msg.channel.id, `Next Warbands will begin in **${timestr}**.`);
	}
}