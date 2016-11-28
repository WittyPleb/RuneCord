const ROTATIONS = [
	'Ceiling Collapse',
	'Scopulus',
	'Vitalis',
	'Green Bomb',
	'Team Split',
	'The End'
];

module.exports = {
	desc: 'Tells you the current rotation for Vorago.',
	aliases: ['rago'],
	task(bot, msg) {
		let dateNow = Date.now() / 1000;
		let currentRotation = Math.floor((((Math.floor(Math.floor(dateNow) / (24 * 60 * 60))) - 6) % (7 * ROTATIONS.length)) / 7);
		let daysUntilNext = 7 - ((Math.floor(dateNow / (24 * 60 * 60))) - 6) % (7 * ROTATIONS.length) % 7;
		let nextRotation = currentRotation + 1;

		if (nextRotation === ROTATIONS.length) nextRotation = 0;

		let toSend = [];


		toSend.push(`The current rotation for Vorago is **${ROTATIONS[currentRotation]}**.`);
		toSend.push(`The next rotation for Vorago will be **${ROTATIONS[nextRotation]}** in **${daysUntilNext}** day${(daysUntilNext > 1 ? 's' : '')}.`);

		toSend = toSend.join('\n');

		bot.createMessage(msg.channel.id, toSend);
	}
}