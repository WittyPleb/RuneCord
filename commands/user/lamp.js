/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

/* REQUIRED DEPENDENCIES */
var reload = require('require-reload');

/* REQUIRED FILES */
var utils = reload('../../utils/utils.js');

module.exports = {
	desc: 'Tells you how much XP you\'d gain from a specific sized lamp.',
	usage: '<small|med|large|huge> <level>',
	cooldown: 5,
	aliases: ['xplamp'],
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';

		let size = suffix.split(' ')[0];
		let level = suffix.split(' ')[1];
		let xp = 0;

		if (!size || !level || !parseInt(level)) return 'wrong usage';

		if (size === 'small') {
			size = 'Small';
			xp = utils.getLampXp(level, 'small');
		}

		if (size === 'med' || size === 'medium') {
			size = 'Medium';
			xp = utils.getLampXp(level, 'medium');
		}

		if (size === 'large') {
			size = 'Large';
			xp = utils.getLampXp(level, 'large');
		}

		if (size === 'huge') {
			size = 'Huge',
			xp = utils.getLampXp(level, 'huge');
		}

		bot.createMessage(msg.channel.id, `If you were level **${level}**, you'd gain **${Nf.format(xp)}** XP from a **${size}** lamp.`);
	}
}