const ROTATIONS = [
	'Path 1 - Minions',
	'Path 2 - Acid',
	'Path 3 - Darkness'
];

module.exports = {
	desc: 'Tells you the current rotation for Araxxor/Araxxi.',
	aliases: ['rax', 'spooder', 'araxxor'],
	task(bot, msg) {
		let currentRotation = Math.floor((((Math.floor(Math.floor(Date.now() / 1000) / (24 * 60 * 60))) + 3) % (4 * ROTATIONS.length)) / 4);
		let daysUntilNext = 4 - ((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) + 3) % (4 * ROTATIONS.length) % 4;
		let nextRotation = currentRotation + 1;

		if (nextRotation === ROTATIONS.length) nextRotation = 0; // Resets it back to the beginning

		let toSend = [];

		toSend.push(`The current path that is closed for Araxxor/Araxxi is **${ROTATIONS[currentRotation]}**.`);
		toSend.push(`The next path to be closed will be **${ROTATIONS[nextRotation]}** in **${daysUntilNext}** day${(daysUntilNext > 1 ? 's' : '')}.`);

		toSend = toSend.join('\n');

		bot.createMessage(msg.channel.id, toSend);
	}
}