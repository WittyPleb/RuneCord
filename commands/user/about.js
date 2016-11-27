const libVersion = require('../../node_modules/eris/package.json').version;
const botVersion = require('../../package.json').version;

module.exports = {
	desc: 'Tells you about the bot.',
	cooldown: 5,
	aliases: ['info'],
	task(bot, msg) {
		bot.createMessage(msg.channel.id, `\`\`\`md
# RuneCord

[ CREATOR ](Witty)
[ LIBRARY ](Eris v${libVersion})
[ VERSION ](${botVersion})

RuneCord is a bot made to allow you to get RuneScape information in your Discord server.

If you have any feedback or suggestions head over to my server
For a list of commands do ~help or )help

[ WEBSITE ](https://unlucky4ever.github.io/RuneCord/)
[ GITHUB  ](https://github.com/unlucky4ever/RuneCord)
[ SERVER  ](https://discord.me/runecord)
[ PATREON ](https://www.patreon.com/witty)\`\`\``);
	}
};