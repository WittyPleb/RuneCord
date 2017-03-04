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
	cooldown: 5,
	aliases: ['rago'],
	task(bot, msg) {
		let dateNow = Date.now() / 1000;
		let currentRotation = Math.floor((((Math.floor(Math.floor(dateNow) / (24 * 60 * 60))) - 6) % (7 * ROTATIONS.length)) / 7);
		let daysUntilNext = 7 - ((Math.floor(dateNow / (24 * 60 * 60))) - 6) % (7 * ROTATIONS.length) % 7;
		let nextRotation = currentRotation + 1;

		if (nextRotation === ROTATIONS.length) nextRotation = 0;

		bot.createMessage(msg.channel.id, {
			embed: {
				name: 'Vorago Rotation',
				color: 0xb89946,
				thumbnail: {
					url: 'http://i.imgur.com/e4WOs8J.png'
				},
				fields: [
					{ name: 'Vorago Rotation', value: ROTATIONS[currentRotation] }
				],
				footer: {
					text: `The next rotation will be ${ROTATIONS[nextRotation]} in ${daysUntilNext} day${(daysUntilNext > 1 ? 's' : '')}.`,
					icon_url: 'http://i.imgur.com/e4WOs8J.png'
				}
			}
		});
	}
}