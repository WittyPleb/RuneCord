const ROTATIONS = [
	'Path 1 - Minions',
	'Path 2 - Acid',
	'Path 3 - Darkness'
];

module.exports = {
	desc: 'Tells you the current rotation for Araxxor/Araxxi.',
	cooldown: 5,
	aliases: ['rax', 'spooder', 'araxxor'],
	task(bot, msg) {
		let currentRotation = Math.floor((((Math.floor(Math.floor(Date.now() / 1000) / (24 * 60 * 60))) + 3) % (4 * ROTATIONS.length)) / 4);
		let daysUntilNext = 4 - ((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) + 3) % (4 * ROTATIONS.length) % 4;
		let nextRotation = currentRotation + 1;

		if (nextRotation === ROTATIONS.length) nextRotation = 0; // Resets it back to the beginning

		let topPath = 'OPEN';
		let midPath = 'OPEN';
		let botPath = 'OPEN';

		if (currentRotation == 0) { topPath = 'CLOSED'; }
		if (currentRotation == 1) { midPath = 'CLOSED'; }
		if (currentRotation == 2) { botPath = 'CLOSED'; }

		bot.createMessage(msg.channel.id, {
			embed: {
				title: 'Arraxor/Araxxi Rotation',
				color: 0x38fe4f,
				thumbnail: {
					url: 'http://i.imgur.com/9m39UaE.png'
				},
				fields: [
					{ name: 'Top Path', value: topPath },
					{ name: 'Middle Path', value: midPath },
					{ name: 'Bottom Path', value: botPath }
				]
			}
		});
	}
}