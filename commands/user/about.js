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
		bot.createMessage(msg.channel.id, {
			embed: {
				title: 'Official Server Invite',
				url: 'https://discord.me/runecord',
				description: 'RuneCord is a bot made to allow you to get RuneScape information in your Discord server.\n\nIf you have any feedback or suggestions head over to my server.\nFor a list of commands do `~help` and `)help`.',
				author: {
					name: botAuthor.username + '#' + botAuthor.discriminator,
					icon_url: botAuthor.avatarURL
				},
				fields: [
					{ name: 'Website', value: 'https://runecord.xyz'},
					{ name: 'GitHub', value: 'https://github.com/unlucky4ever/RuneCord/'},
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