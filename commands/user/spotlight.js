const MINIGAMES = [
	'Pest Control',
	'Soul Wars',
	'Fist of Guthix',
	'Barbarian Assault',
	'Conquest',
	'Fishing Trawler',
	'The Great Orb Project',
	'Flash Powder Factory',
	'Castle Wars',
	'Stealing Creation',
	'Cabbage Facepunch Bonanza',
	'Heist',
	'Mobilising Armies',
	'Barbarian Assault',
	'Conquest',
	'Fist of Guthix',
	'Castle Wars',
	'Pest Control',
	'Soul Wars',
	'Fishing Trawler',
	'The Great Orb Project',
	'Flash Powder Factory',
	'Stealing Creation',
	'Cabbage Facepunch Bonanza',
	'Heist',
	'Trouble Brewing',
	'Castle Wars'
];

module.exports = {
	desc: 'Tells you what minigame is currently on spotlight.',
	task(bot, msg) {
		let currentSpotlight = Math.floor((((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) - 49) % (3 * MINIGAMES.length)) / 3);
		let daysUntilNext = 3 - ((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) - 49) % (3 * MINIGAMES.length) % 3;
		let nextSpotlight = currentSpotlight + 1;

		if (nextSpotlight === MINIGAMES.length) nextSpotlight = 0;

		let toSend = [];

		toSend.push(`The current minigame that is on spotlight is **${MINIGAMES[currentSpotlight]}**.`);
		toSend.push(`The next minigame to be on spotlight will be **${MINIGAMES[nextSpotlight]}** in **${daysUntilNext}** day${(daysUntilNext > 1 ? `s` : ``)}.`);

		toSend = toSend.join('\n');

		bot.createMessage(msg.channel.id, toSend);
	}
}