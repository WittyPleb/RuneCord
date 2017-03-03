/* REQUIRED DEPENDENCIES */
var reload = require('require-reload')(require);
var fs     = require('fs');

/* REQUIRED FILES */
var utils   = reload('./utils.js');
var Command = reload('./Command.js');
var _Logger = reload('./Logger.js');

/**
 * @class
 * @classdesc Handles a directory of .js files formatted as {@link Command}.
 * @prop {String} prefix Prefix for the commands handled by this CommandManager.
 * @prop {String} dir Path where the commands are located from the root directory.
 * @prop {Object<Command>} commands The loaded {@link Command}s.
 */
class CommandManager {

	/**
	 * @constructor
	 * @arg {Object} config The bot's config settings.
	 * @arg {String} prefix Prefix for the commands handled by this CommandManager.
	 * @arg {String} [dir="commands/user/"] Path to load command from, from the root directory of the bot.
	 * @arg {Sting} [color] The color to log commands with.
	 */
	constructor(config, prefix, dir = 'commands/user/', color) {
		this.prefix = prefix;
		this.directory = `${__dirname}/../${dir}`;
		this.commands = {};
		this.logger = new _Logger(config.logTimestamp, color);
	}

	/**
	 * Initialize the command manager, loading each command in the set directory.
	 * @arg {Client} bot
	 * @arg {Object} config The bot's config settings.
	 * @arg {settingsManager} settingsManager The bot's {@link settingsManager}
	 * @returns {Promise}
	 */
	initialize(bot, config, settingsManager) {
		return new Promise((resolve, reject) => {
			fs.readdir(this.directory, (err, files) => {
				if (err) reject(`Error reading commands directory: ${err}`);
				else if (!files) reject(`No files in directory ${this.directory}`);
				else {
					settingsManager.commandList[this.prefix] = [];
					for (let name of files) {
						if (name.endsWith('.js')) {
							try {
								name = name.replace(/\.js$/, '');
								let command = new Command(name, this.prefix, reload(this.directory + name + '.js'), bot, config);
								this.commands[name] = command;
								settingsManager.commandList[this.prefix].push(name);
							} catch (e) {
								this.logger.error(`${e}\n${e.stack}`, 'Error loading command ' + name);
							}
						}
					}
					resolve();
				}
			});
		});
	}

	/**
	 * Called when a message is detected with the prefix. Decides what to do.
	 * @arg {Client} bot The client.
	 * @arg {Message} msg The matching message.
	 * @arg {Object} config The JSON formatted config file.
	 * @arg {settingsManager} settingsManager The bot's {@link settingsManager}
	 */
	processCommand(bot, msg, config, settingsManager) {
		let name = msg.content.replace(this.prefix, '').split(/ |\n/)[0];
		let command = this.checkForMatch(name.toLowerCase());
		let suffix = msg.content.replace(this.prefix + name, '').trim();
		if (command !== null) {
			if (msg.channel.guild !== undefined && !msg.channel.permissionsOf(msg.author.id).has('manageChannels') && settingsManager.isCommandIgnored(this.prefix, command.name, msg.channel.guild.id, msg.channel.id, msg.author.id) === true) {
				return;
			}
			this.logger.logCommand(msg.channel.guild === undefined ? null : msg.channel.guild.name, msg.author.username, this.prefix + command.name, msg.cleanContent.replace(this.prefix + name, '').trim());
			return command.execute(bot, msg, suffix, config, settingsManager, this.logger);
		} else if (name.toLowerCase() === 'help') {
			return this.help(bot, msg, msg.content.replace(this.prefix + name, '').trim());
		}
	}

	/**
	 * Checks if there is a matching command in this CommandManager.
	 * @arg {String} name The command name to look for.
	 * @returns {?Command} Returns the matching {@link Command} or false.
	 */
	checkForMatch(name) {
		if (name.startsWith(this.prefix)) {
			name = name.substr(1);
		}
		for (let key in this.commands) {
			if (key === name || this.commands[key].aliases.includes(name)) {
				return this.commands[key];
			}
		}
		return null;
	}

	/**
	 * Built-in help command
	 * If no command is specified it will DM a list of commands.
	 * If a command is specified it will send info on that command.
	 * @arg {Eris} bot The client.
	 * @arg {Eris.Message} msg The message that triggered the command.
	 * @arg {String} [command] The command to get help for.
	 */
	help(bot, msg, command) {
		this.logger.logCommand(msg.channel.guild === undefined ? null : msg.channel.guild.name, msg.author.username, this.prefix + 'help', command);
		if (!command) {
			let messageQueue = [];
			let currentMessage = `\n// Here's a list of my commands. For more info do: ${this.prefix}help <command>`;
			for (let cmd in this.commands) {
				if (this.commands[cmd].hidden === true) continue;
				let toAdd = this.commands[cmd].helpShort;
				if (currentMessage.length + toAdd.length >= 1900) {
					messageQueue.push(currentMessage);
					currentMessage = '';
				}
				currentMessage += '\n' + toAdd;
			}
			messageQueue.push(currentMessage);
			bot.getDMChannel(msg.author.id).then(chan => {
				let sendInOrder = setInterval(() => {
					if (messageQueue.length > 0) {
						bot.createMessage(chan.id, '```glsl' + messageQueue.shift() + '```');
					} else {
						clearInterval(sendInOrder);
					}
				}, 300);
			}).then(bot.createMessage(msg.channel.id, ':thumbsup:').then(sentMsg => {
				setTimeout(() => { sentMsg.delete(); }, 5000);
			}));
		} else {
			let cmd = this.checkForMatch(command);
			if (cmd === null) {
				bot.createMessage(msg.channel.id, `Command \`${this.prefix}${command}\` not found`);
			} else {
				bot.createMessage(msg.channel.id, cmd.helpMessage);
			}
		}
	}

	/**
	 * Reload or load a command.
	 * @arg {Client} bot The client.
	 * @arg {Message} msg The message that was sent.
	 * @arg {String} command The command to reload or load.
	 * @arg {Object} config The bot's config.
	 * @arg {settingsManager} settingsManager The bot's {@link settingsManager}
	 */
	reload(bot, msg, command, config, settingsManager) {
		fs.access(`${this.directory}${command}.js`, fs.R_OK | fs.F_OK, error => {
			if (error) {
				bot.createMessage(msg.channel.id, ':question: Command does not exist!').then(sentMsg => {
					setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
				});
			} else {
				try {
					if (this.commands.hasOwnProperty(command)) {
						this.commands[command].destroy();
					}
					this.commands[command] = new Command(command, this.prefix, reload(`${this.directory}${command}.js`), config, bot);
					bot.createMessage(msg.channel.id, `:white_check_mark: Command **${this.prefix}${command}** loaded!`).then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
					if (!settingsManager.commandList[this.prefix].includes(command)) {
						settingsManager.commandList[this.prefix].push(command);
					}
				} catch (error) {
					this.logger.error(error, 'Error reloading command ' + command);
					bot.createMessage(msg.channel.id, `:x: Error loading command: ${error}`).then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
				}
			}
		});
	}
}

module.exports = CommandManager;