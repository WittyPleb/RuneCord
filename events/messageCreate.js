module.exports = {
	handler(bot, msg, CommandManagers, config, settingsManager) {
		if (msg.author.bot === true) return; // Do nothing if the message author is the bot.

		for (let i = 0; i < CommandManagers.length; i++) {
			if (msg.content.startsWith(CommandManagers[i].prefix)) {
				return CommandManagers[i].processCommand(bot, msg, config, settingsManager);
			}
		}
	}
}