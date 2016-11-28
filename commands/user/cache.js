module.exports = {
	desc: 'Tells you when the next Guthixian Cache will be.',
	cooldown: 5,
	task(bot, msg) {
		let d = new Date();

		/* CACHE BOOST */
		let hoursUntilBoost = 2 - d.getUTCHours() % 3;
		let minutesUntilBoost = 60 - d.getUTCMinutes();

		/* CACHE TIME */
		let secondsUntil = 3600 - (d.getUTCMinutes()) % 60 * 60 - d.getUTCSeconds();
		let minutesUntil = Math.floor(secondsUntil / 60);

		let boostTimeStr = '';
		let cacheTimeStr = '';

		/* BOOST TIME STR */
		if (minutesUntilBoost === 60) {
			hoursUntilBoost++;
			minutesUntilBoost = 0;
		}

		if (hoursUntilBoost > 0) {
			boostTimeStr += `${hoursUntilBoost} hour${hoursUntilBoost > 1 ? 's' : ''}`;
		}

		if (hoursUntilBoost >= 1 && minutesUntilBoost > 1) {
			boostTimeStr += ` and ${minutesUntilBoost} minute${minutesUntilBoost > 1 ? 's' : ''}`;
		}

		if (minutesUntilBoost > 1 && hoursUntilBoost < 1) {
			boostTimeStr += `${minutesUntilBoost} minute${minutesUntilBoost > 0 && minutesUntilBoost < 2 ? '' : 's'}`;
		}

		/* CACHE TIME STR */
		if (minutesUntil === 0) {
			cacheTimeStr += '1 hour';
		}

		if (minutesUntil > 0) {
			cacheTimeStr += `${minutesUntil} minute${minutesUntil > 0 && minutesUntil < 1 ? '' : 's'}`;
		}

		bot.createMessage(msg.channel.id, `The next Guthixian Cache begins in **${cacheTimeStr}**. You will be able to get a boost in **${boostTimeStr}**.`);
	}
}