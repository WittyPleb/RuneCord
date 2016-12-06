function addIgnores(bot, msg, suffix, settingsManager) {
	let args = suffix.match(/\((.+)\) *\((.+)\)/);
	if (args === null || args.length !== 3) {
		args = suffix.match(/([^ ]+) +(.+)/);
	}
	if (args === null || args.length !== 3) {
		return bot.createMessage(msg.channel.id, "Please format your message like this: `ignore (@user | server | #channel) (~command | >all | )command)`");
	}
	let commands = args[2].split(/([^ ]+) +(.+)/).filter(x => x !== '');
	let scopes  = args[1].split(/ *\| */).filter(x => x !== ''); // Remove empty entries from the array.
	if (commands.length === 0 || scopes.length === 0) {
		return bot.createMessage(msg.channel.id, "Please format your message like this: `ignore (@user | server | #channel) (~command | >all | )command)");
	}

	scopes.forEach(scope => {
		let task;
		let args;

		if (scope === 'server') {
			task = settingsManager.addIgnoreForGuild;
			args = [msg.channel.guild.id];
		} else if (/<@!?[0-9]+>/.test(scope)) {
			let id = scope.match(/[0-9]+/)[0];
			if (msg.channel.guild.members.has(id)) {
				task = settingsManager.addIgnoreForUserOrChannel;
				args = [msg.channel.guild.id, 'userIgnores', id];
			} else {
				return bot.createMessage(msg.channel.id, `Invalid user: ${scope}`);
			}
		} else if (/<#[0-9]+>/.test(scope)) {
			let id = scope.match(/[0-9]+/)[0];
			let channel = msg.channel.guild.channels.get(id);
			if (channel === null || channel.type === 'voice') {
				return bot.createMessage(msg.channel.id, `Invalid text channel: ${scope}`);
			}
			task = settingsManager.addIgnoreForUserOrChannel;
			args = [msg.channel.guild.id, 'channelIgnores', id];
		} else {
			return bot.createMessage(msg.channel.id, `Invalid scope: ${scope}`);
		}

		ignoreLoop(task, args, commands.slice()).then(modified => {
			if (modified.length !== 0) {
				bot.createMessage(msg.channel.id, `**Added the following ignores for ${scope}:**\n${modified.join(', ')}`);
			} else {
				bot.createMessage(msg.channel.id, `**No settings modified for ${scope}**`);
			}
		}).catch(error => {
			bot.createMessage(msg.channel.id, `**Error adding ignores for ${scope}:**\n\t${error}`);
		});
	});
}

function removeIgnores(bot, msg, suffix, settingsManager) {
	let args = suffix.match(/\((.+)\) *\((.+)\)/);

	if (args === null || args.length !== 3) {
		args = suffix.match(/([^ ]+) +(.+)/);
	}

	if (args === null || args.length !== 3) {
		return bot.createMessage(msg.channel.id, "Please format your message like this: `unignore (@user | server | #channel) (~command | ~all | )command)`");
	}

	let commands = args[2].split(/ *\| */).filter(x => x !== '')
	let scopes = args[1].split(/ *\| */).filter(x => x !== '');

	if (commands.length === 0 || scopes.length === 0) {
		return bot.createMessage(msg.channel.id, "Please format your message like this: `unignore (@user | server | #channel) (~command | ~all | )command)`");
	}

	scopes.forEach(scope => {
		let task;
		let args;

		if (scope === 'server') {
			task = settingsManager.removeIgnoreForGuild;
			args = [msg.channel.guild.id];
		} else if (/<@!?[0-9]+>/.test(scope)) {
			let id = scope.match(/[0-9]+/)[0];
			if (msg.channel.guild.members.has(id)) {
				task = settingsManager.removeIgnoreForUserOrChannel;
				args = [msg.channel.guild.id, 'userIgnores', id];
			} else {
				return bot.createMessage(msg.channel.id, `Invalid user: ${scope}`);
			}
		} else if (/<#[0-9]+>/.test(scope)) {
			let id = scope.match(/[0-9]+/)[0]
			let channel = msg.channel.guild.channels.get(id);
			if (channel === null || channel.type === 'voice') {
				return bot.createmessage(msg.channel.id, `Invalid text channel: ${scope}`);
			}
			task = settingsManager.removeIgnoreForUserOrChannel;
			args = [msg.channel.guild.id, 'channelIgnores', id];
		} else {
			return bot.createMessage(msg.channel.id, `Invalid scope "${scope}"`);
		}

		ignoreLoop(task, args, commands.slice()).then(modified => {
			if (modified.length !== 0) {
				bot.createMessage(msg.channel.id, `**Removed the following ignores for ${scope}:**\n${modified.join(', ')}`);
			} else {
				bot.createMessage(msg.channel.id, `**No settings modified for ${scope}`);
			}
		}).catch(error => {
			bot.createMessage(msg.channel.id, `**Error removing ignores for ${scope}:**\n\t${error}`);
		});
	});
}

function ignoreLoop(task, args, commands) {
	return new Promise((resolve, reject) => {
		let modified = [];
		task(...args, commands[0]).then(b => {
			if (b === true) {
				modified.push(commands[0]);
			}
			commands.shift();
			if (commands.length > 0) {
				ignoreLoop(task, args, commands).then(m => {
					modified.push(m);
					return resolve(modified);
				}).catch(reject);
			} else {
				return resolve(modified);
			}
		}).catch(reject);
	});
}

function checkIgnores(bot, msg, suffix, settingsManager) {
	if (suffix) {
		let ignored;
		if (suffix === 'server') {
			console.log(suffix);
			ignored = settingsManager.checkIgnoresFor(msg.channel.guild.id, 'guild');
		} else if (msg.channelMentions.length !== 0) {
			ignored = settingsManager.checkIgnoresFor(msg.channel.guild.id, 'channel', msg.channelMentions[0]);
		} else if (msg.mentions.length !== 0) {
			ignored = settingsManager.checkIgnoresFor(msg.channel.guild.id, 'user', msg.mentions[0].id);
		} else {
			return bot.createMessage(msg.channel.id, 'Please specify "server", a channel, or a user.');
		}

		if (ignored.length === 0) {
			bot.createMessage(msg.channel.id, "I'm not ignoring anything right now.");
		} else {
			bot.createMessage(msg.channel.id, "I'm current ignoring:\n" + ignored.join(', '));
		}
	} else {
		bot.createMessage(msg.channel.id, '');
	}
}

module.exports = {
	desc: "Adjust a server's settings.",
	help: `Modify how the bot works on a server.
	__ignore__: Block commands \`ignore #no-bot >all\`.
	__unignore__: Allow commands \`unignore @User >ping | >roll\`.`,
	usage: "Usage at <https://runecord.xyz/settings.html>",
	aliases: ['set', 'config'],
	cooldown: 3,
	requiredPermission: 'manageGuild',
	guildOnly: true,
	task(bot, msg, suffix, config, settingsManager) {
		if (suffix) {
			if (suffix.startsWith('ignored')) {
				checkIgnores(bot, msg, suffix.substr(8).trim().toLowerCase(), settingsManager);
			} else if (suffix.startsWith('ignore')) {
				addIgnores(bot, msg, suffix.substr(7).trim().toLowerCase(), settingsManager);
			} else if (suffix.startsWith('unignore')) {
				removeIgnores(bot, msg, suffix.substr(9).trim().toLowerCase(), settingsManager);
			} else {
				return 'wrong usage';
			}
		} else {
			return 'wrong usage';
		}
	}
};