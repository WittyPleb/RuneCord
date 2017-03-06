/* REQUIRED DEPENDENCIES */
var reload = require('require-reload');
var moment = require('moment');

/* REQUIRED FILES */
var libVersion = reload('../../node_modules/eris/package.json').version;
var botVersion = reload('../../package.json').version;
var config     = reload('../../config.json');

module.exports = {
	desc: 'Tells you about the bot.',
	cooldown: 5,
	aliases: ['info'],
	task(bot, msg) {
		let botAuthor = bot.users.get(config.adminIds[0]);

		process.on('unhandledRejection', (err) => {
			if (err.code == 50013) {
				bot.createMessage(msg.channel.id, "I don't have permission to embed things, please give me the `Embed Links` permission!");
			}
		});
		
		bot.createMessage(msg.channel.id, {
			embed: {
				title: 'Official Website',
				url: 'http://runecord.xyz',
				description: 'RuneCord is a bot made to allow you to get RuneScape information in your Discord server.\n\nIf you have any feedback or suggestions head over to my server.\nFor a list of commands do `~help` and `)help`.',
				fields: [
					{ name: 'Website', value: 'http://runecord.xyz'},
					{ name: 'GitHub', value: 'https://github.com/unlucky4ever/RuneCord/'},
					{ name: 'Support Server', value: 'http://discord.me/runecord' },
					{ name: 'Patreon', value: 'https://patreon.com/witty'}
				],
				footer: {
					text: `Made with Eris v${libVersion} | Current Version: ${botVersion} | ${moment(msg.timestamp).format('ddd MMM do, YYYY [at] h:mm A')}`,
					icon_url: 'http://i.imgur.com/hiyc0GM.png'
				}
			}
		});
	}
};