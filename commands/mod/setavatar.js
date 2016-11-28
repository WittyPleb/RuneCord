/* REQUIRED DEPENDENCIES */
var reload = require('require-reload');

/* REQUIRED FILES */
var setAvatar = reload('../../utils/utils.js').setAvatar;

module.exports = {
	desc: "Set the bot's avatar from a URL.",
	usage: '<URL>',
	hidden: true,
	ownerOnly: true,
	task(bot, msg, suffix) {
		setAvatar(bot, suffix).then(() => {
			bot.createMessage(msg.channel.id, 'Avatar Updated').then(sentMsg => {
				setTimeout(() => { sentMsg.delete() }, 5000); // Delete the message after 5 seconds
			});
		});
	}
}