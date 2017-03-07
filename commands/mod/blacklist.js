/* REQUIRED DEPENDENCIES */
var reload = require('require-reload');

/* REQUIRED FILES */
var blacklist        = reload('../../db/blacklist.json');
var settingsManager  = reload('../../utils/settingsManager.js');
var utils            = reload('../../utils/utils.js');

function manageBlacklist(bot, msg, suffix, blacklist) {
	let args = suffix.match(/([^ ]+) +(.+)/);
	if (args === null || args.length !== 3) {
		return bot.createMessage(msg.channel.id, "Please format your message like this: `add/remove GUILD_NAME`");
	}
	let action = args[1];
	let guildName = args[2];

	if (action === 'add') {
		if (typeof guildName === 'string') {
			bot.guilds.forEach((guild) => {
				if (guild.name === guildName) {
					blacklist[guild.id] = true;
					guild.leave();
					utils.safeSave('db/blacklist', '.json', JSON.stringify(blacklist));
					return bot.createMessage(msg.channel.id, `**${guildName} has been successfully blacklisted.`);
				}
			});
		}
	}

	if (action === 'remove') {
		if (typeof guildName === 'string') {
			delete blacklist[guildName];
			utils.safeSave('db/blacklist', '.json', JSON.stringify(blacklist), 0);
			return bot.createMessage(msg.channel.id, `**${guildName} has been removed from the blacklist.`);
		}
	}
}

module.exports = {
	desc: "Add or remove servers from the blacklist.",
	usage: '<add/remove> <guildName>',
	hidden: true,
	ownerOnly: true,
	task(bot, msg, suffix) {
		if (!suffix) return 'wrong usage';
		manageBlacklist(bot, msg, suffix, blacklist);
	}
}