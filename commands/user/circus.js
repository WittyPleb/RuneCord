const LOCATIONS = [
	'Tree Gnome Stronghold',
	'Seers\' Village',
	'Catherby',
	'Taverley',
	'Edgeville',
	'Falador',
	'Rimmington',
	'Draynor Village',
	'Al Kharid',
	'Lumbridge',
	'Lumber Yard',
	'Gertrude\'s House'
];

module.exports = {
	desc: 'Tells you where the Circus is located.',
	cooldown: 5,
	task(bot, msg) {
		let currentLocation = Math.floor((((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) + 1) % (7 * LOCATIONS.length)) / 7);
		let dateNow = Date.now() / 1000;
		let daysUntilNext = 7 - ((Math.floor(dateNow / (24 * 60 * 60))) + 1) % (7 * LOCATIONS.length) % 7;
		let nextLocation = currentLocation + 1;

		if (nextLocation === LOCATIONS.length) nextLocation = 0;

		let toSend = [];

		toSend.push(`The circus is currently located at **${LOCATIONS[currentLocation]}**.`);
		toSend.push(`The next location will be **${LOCATIONS[nextLocation]}** in **${daysUntilNext}** day${(daysUntilNext > 1 ? 's' : '')}.`);

		toSend = toSend.join('\n');

		bot.createMessage(msg.channel.id, toSend);
	}
}