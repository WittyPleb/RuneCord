var Nf = new Intl.NumberFormat('en-US');
const NAMES = {
	A: 'Ahrim',
	D: 'Dharok',
	G: 'Guthan',
	K: 'Karil',
	T: 'Torag',
	V: 'Verac'
};

const ROTATIONS = [
	[[NAMES.D, NAMES.T, NAMES.V], [NAMES.K, NAMES.A, NAMES.G]],
	[[NAMES.K, NAMES.T, NAMES.G], [NAMES.A, NAMES.D, NAMES.V]],
	[[NAMES.K, NAMES.G, NAMES.V], [NAMES.A, NAMES.T, NAMES.D]],
	[[NAMES.G, NAMES.T, NAMES.V], [NAMES.K, NAMES.A, NAMES.D]],
	[[NAMES.K, NAMES.T, NAMES.V], [NAMES.A, NAMES.G, NAMES.D]],
	[[NAMES.A, NAMES.G, NAMES.D], [NAMES.K, NAMES.T, NAMES.V]],
	[[NAMES.K, NAMES.A, NAMES.D], [NAMES.G, NAMES.T, NAMES.V]],
	[[NAMES.A, NAMES.T, NAMES.D], [NAMES.K, NAMES.G, NAMES.V]],
	[[NAMES.A, NAMES.D, NAMES.V], [NAMES.K, NAMES.T, NAMES.G]],
	[[NAMES.K, NAMES.A, NAMES.G], [NAMES.T, NAMES.D, NAMES.V]],
	[[NAMES.A, NAMES.T, NAMES.G], [NAMES.K, NAMES.D, NAMES.V]],
	[[NAMES.A, NAMES.G, NAMES.V], [NAMES.K, NAMES.T, NAMES.D]],
	[[NAMES.K, NAMES.A, NAMES.T], [NAMES.G, NAMES.D, NAMES.V]],
	[[NAMES.K, NAMES.A, NAMES.V], [NAMES.D, NAMES.T, NAMES.G]],
	[[NAMES.A, NAMES.T, NAMES.V], [NAMES.K, NAMES.D, NAMES.G]],
	[[NAMES.K, NAMES.D, NAMES.G], [NAMES.A, NAMES.T, NAMES.V]],
	[[NAMES.D, NAMES.T, NAMES.G], [NAMES.K, NAMES.A, NAMES.V]],
	[[NAMES.G, NAMES.D, NAMES.V], [NAMES.K, NAMES.A, NAMES.T]],
	[[NAMES.K, NAMES.T, NAMES.D], [NAMES.A, NAMES.G, NAMES.V]],
	[[NAMES.K, NAMES.D, NAMES.V], [NAMES.A, NAMES.T, NAMES.G]]
];

module.exports = {
	desc: 'Tells you what the current Rise of the Six rotation is.',
	cooldown: 5,
	task(bot, msg) {
		let currentRotation = (Math.floor((Date.now() / 1000) / (24 * 60 * 60)) % 20);

		if (currentRotation === -1 || currentRotation >= ROTATIONS.length) currentRotation = 0;

		let westSide = ROTATIONS[currentRotation][0];
		let eastSide = ROTATIONS[currentRotation][1];

		bot.createMessage(msg.channel.id, {
			embed: {
				title: 'Current Rise of the Six Rotation',
				color: 0x36073d,
				thumbnail: {
					url: 'http://i.imgur.com/xy8pXsM.png'
				},
				fields: [
					{ name: 'West Side', value: westSide.join("\n"), inline: true },
					{ name: 'East Side', value: eastSide.join("\n"), inline: true }
				]
			}
		});
	}
}