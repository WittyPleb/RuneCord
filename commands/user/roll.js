var Nf = new Intl.NumberFormat('en-US');

module.exports = {
	desc: 'Roll a number between the given range.',
	usage: '[[min-]max]',
	cooldown: 2,
	aliases: ['random'],
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';
		let args = suffix.match(/(?:(\d+)-)?(\d+)/);
		if (!parseInt(args[1]) || !parseInt(args[2])) return 'wrong usage';
		if (args[1] >= Number.MAX_SAFE_INTEGER || args[2] >= Number.MAX_SAFE_INTEGER) {
			bot.createMessage(msg.channel.id, 'That number is too big for me to process, please use a smaller number.');
			return;
		}
		let roll = args === null ? [1, 10] : [parseInt(args[1]) || 1, parseInt(args[2])];
		bot.createMessage(msg.channel.id, `${msg.author.username} rolled **${Nf.format(roll[0])}-${Nf.format(roll[1])}** and got **${Nf.format(~~((Math.random() * (roll[1] - roll[0] + 1)) + roll[0]))}**.`);
	}
}