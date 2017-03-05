<img src="https://i.imgur.com/TkiKjWM.png" alt="RuneCord Icon" align="right" />

# A bot just for RuneScape.

#### [Website](http://runecord.xyz) | [Support on Patreon](http://patreon.com/witty) | [Eris Documentation](https://abal.moe/Eris/docs/index.html) | [Discord Server](https://discord.me/runecord)

## Installing:
1. Install `NodeJS` `Git` and `Python 2.7` (and add them to your PATH).
2. Download RuneCord and configure it using the reference below.
3. Run `npm i --no-optional --production` and then, optionally, `npm i eventemitter3 bluebird --no-optional --production`.
4. Make any modifications.
5. Add your bot using `https://discordapp.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot`.
6. Run the bot with `node index.js`.

---

## Example of a command
```js
// Runecord/commands/examples/example.js
// Only 'task' is required. Everything else is optional.

module.exports {
	desc: "A short description",
	help: "A longer description of what the command does and how to use it",
	usage: "<hello> [world]",
	aliases: ['ex', 'e'], // Aliases 'ex' and 'e'
	cooldown: 5, // 5 seconds
	hidden: true, // Hidden from help command
	ownerOnly: true, // Only a user in config.adminIds can use this command
	guildOnly: true, // This command can't be used in a DM, only in guilds
	requiredPermission: 'manageMessages', // You need the 'manageMessages' permission to use this command
	task(bot, msg, suffix, config, settingsManager) { // Available args (only bot & msg are required)
		if (suffix.startsWith('hello')) {
			return bot.createMessage(msg.channel.id, suffix);
		}
		return 'wrong usage'; // If the suffix doesn't say 'hello', it sends the correct usage to the user.
	}
}
```

## Example of an event
```js
// RuneCord/events/guildCreate.js

module.exports = function(bot, settingsManager, config, guild) {
	if (config.logNewGuilds) {
		console.log(`New Guild: ${guild.name}`);
	}
}
```

---

## Config Reference
- **token:** The bot's token
- **shardCount:** The number of shards to run.
- **disableEvents:** An object containing events to disable. This saves resources. A full list of events can be found here: [Eris Reference](https://abal.moe/Eris/reference.html).
- **commandSets:** An object defining what commands to load. The key is the prefix, `dir` is the path to the files from the root of the bot. If you want to make the commands a certain color in the console, add a `color` property with a valid [chalk color](https://github.com/chalk/chalk#colors).
- **reloadCommand:** The command to use for reloading modules/commands.
- **evalCommand:** The command to use for running arbitrary code.
- **adminIds:** An array of user ids that have full control over the bot.
- **logTimestamp:** If the console should include timestamps.
- **inviteLink:** A link to add the bot to a server.
- **errorMessage:** An optional error message to post in chat.
- **carbonKey:** Your key for updating carbon information.
- **abalBotsKey:** Your https://bot.discord.pw/ API key.
- **cycleGames:** Randomly changes the bot's status.
- **bannedGuildIds:** Servers that can not add the bot.
- **whitelistedGuildIds:** For future use.

## Naming commands and invalid prefixes
Command names must not contain a `space` or a `|`. Prefixed must not contain a `|`. Avoid using `@` as it may resolve into a user.

---

Disclaimer: I may or may not keep up-to-date with this documentation.