const RESPONSES = [
	'pong',
	'You know... maybe I wanted to say ping instead?',
	'pong!',
	'Ha! No.',
	'...',
	'ping'
];

var Nf = new Intl.NumberFormat('en-US');

module.exports = {
	desc: 'Responds with pong',
	help: 'Used to check if the bot is working.\nReplies with "pong" and the response delay.',
	aliases: ['p'],
	cooldown: 5,
	task(bot, msg) {
		let choice = ~~(Math.random() * RESPONSES.length);
		bot.createMessage(msg.channel.id, RESPONSES[choice]).then(sentMsg => {
			bot.editMessage(sentMsg.channel.id, sentMsg.id, `${RESPONSES[choice]}  |  Response delay: ${Nf.format(sentMsg.timestamp - msg.timestamp)}ms`);
		});
	}
};