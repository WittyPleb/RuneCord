/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

module.exports = {
	desc: 'Tells you how much XP you\'d gain from a fully completed Troll Invasion D&D',
	cooldown: 5,
	aliases: ['troll', 'trollinvasion'],
	usage: '<level>',
	task(bot, msg, suffix) {
		if (!parseInt(suffix)) return 'wrong usage';
		let formula = 8 * (20 / 20) * (Math.pow(parseInt(suffix), 2) - 2 * parseInt(suffix) + 100);
		bot.createMessage(msg.channel.id, `If were to **fully** complete Troll Invasion, you'd gain **${Nf.format(formula)}** XP if you were level **${parseInt(suffix)}**.`);
	}
}