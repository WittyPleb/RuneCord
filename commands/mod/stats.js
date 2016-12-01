/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

/* REQUIRED DEPENDENCIES */
var reload = require('require-reload');
var moment = require('moment');

/* REQUIRED FILES */
var formatTime = reload('../../utils/utils.js').formatTimeShort;
var botVersion    = reload('../../package.json').version;
var libVersion = require('../../node_modules/eris/package.json').version;
var config     = reload('../../config.json');

module.exports = {
	desc: 'Displays statistics about the bot.',
	cooldown: 10,
	task(bot, msg) {
		let botAuthor = bot.users.get(config.adminIds[0]);
		bot.createMessage(msg.channel.id, {
			embed: {
				title: 'Official GitHub Page',
				url: 'https://github.com/unlucky4ever/RuneCord',
				description: 'A bot just for RuneScaoe.\n\tMore details at https://github.com/unlucky4ever/RuneCord',
				author: {
					name: botAuthor.username + '#' + botAuthor.discriminator,
					icon_url: botAuthor.avatarURL
				},
				fields: [
					{name: 'Members', value: `${Nf.format(bot.users.size)} Total Users`, inline: true},
					{name: 'Channels', value: `${Nf.format(Object.keys(bot.channelGuildMap).length)} Total Guild Channels\n${Nf.format(bot.privateChannels.size)} Private Channels`, inline: true},
					{name: 'Uptime', value: `${formatTime(bot.uptime)}`, inline: true},
					{name: 'Servers', value: `${Nf.format(bot.guilds.size)}`, inline: true},
					{name: 'Commands Run', value: `${Nf.format(commandsProcessed)} (AVG: ${(commandsProcessed / (bot.uptime / (1000 * 60))).toFixed(2)}/min)`, inline: true},
					{name: 'Memory Usage', value: `${Math.round(process.memoryUsage().rss / 1024 / 1000)}MB`, inline: true}
				],
				footer: {
					text: `Made with Eris v${libVersion} | Current Version: ${botVersion} | ${moment(msg.timestamp).format('ddd MMM do, YYYY [at] h:mm A')}`,
					icon_url: 'http://i.imgur.com/hiyc0GM.png'
				}
			}
		});
	}
};