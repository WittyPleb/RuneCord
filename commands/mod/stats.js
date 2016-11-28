/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

/* REQUIRED DEPENDENCIES */
var reload = require('require-reload');

/* REQUIRED FILES */
var formatTime = reload('../../utils/utils.js').formatTime;
var version    = reload('../../package.json').version;

module.exports = {
	desc: 'Displays statistics about the bot.',
	cooldown: 10,
	task(bot, msg) {
		bot.createMessage(msg.channel.id, `\`\`\`md
[RuneCord Statistics]:
[ UPTIME       ](${formatTime(bot.uptime)})
[ MEMORY USAGE ](${Math.round(process.memoryUsage().rss / 1024 / 1000)}MB)
[ VERSION      ](RuneCord ${version})
[ SHARDS       ](${bot.shards.size})

# Available to:
[ GUILDS              ](${Nf.format(bot.guilds.size)})
[ CHANNELS            ](${Nf.format(Object.keys(bot.channelGuildMap).length)})
[ PRIVATE CHANNELS    ](${Nf.format(bot.privateChannels.size)})
[ USERS               ](${Nf.format(bot.users.size)})
[ AVERAGE USERS/GUILD ](${Nf.format((bot.users.size / bot.guilds.size).toFixed(2))})

# Command Usage:
[ COMMANDS USED ](${Nf.format(commandsProcessed)})
[ AVERAGE       ](${(commandsProcessed / (bot.uptime / (1000 * 60))).toFixed(2)}/min)\`\`\``);
	}
};