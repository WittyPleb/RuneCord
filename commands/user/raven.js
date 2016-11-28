module.exports = {
	desc: 'Tells you if there is a raven in Prifddinas.',
	cooldown: 5,
	task(bot, msg) {
		let spawned = false;
		let daysUntilNext = 0;
		let dateNow = Date.now() / 1000;
		let formula = (((Math.floor((dateNow) / (24 * 60 * 60))) + 7) % 13);

		if (formula < 1) {
			daysUntilNext = 1 - formula;
			spawned = true;
		} else {
			daysUntilNext = 13 - formula;
			spawned = false;
		}

		if (spawned) {
			bot.createMessage(msg.channel.id, 'A raven is currently spawned in Prifddinas!');
		} else {
			bot.createMessage(msg.channel.id, `There isn't a raven in Prifddinas at this time, the next one spawns in **${daysUntilNext}** day${daysUntilNext > 1 ? 's' : ''}.`);
		}
	}
}