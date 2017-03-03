/* REQUIRE NODE 6+ TO EVEN START THE BOT */
if (parseFloat(process.versions.node) < 6) {
	throw new Error('Incompatible node version. Please use Node 6 or higher.');
}

/* REQUIRED DEPENDENCIES */
var reload          = require('require-reload')(require);
var fs              = require('fs');
var Eris            = require('eris');
var stringifyObject = require('stringify-object');

/* REQUIRED FILES */
var config          = reload('./config.json');
var validateConfig  = reload('./utils/validateConfig.js');
var CommandManager  = reload('./utils/CommandManager.js');
var settingsManager = reload('./utils/settingsManager.js');
var utils           = reload('./utils/utils.js');
var games           = reload('./special/games.json');

/* LOCAL VARIABLES */
var logger;
var CommandManagers = [];
var events = {};

commandsProcessed = 0;

validateConfig(config).catch(() => process.exit(0));
logger = new (reload('./utils/Logger.js'))(config.logTimestamp);

var bot = new Eris(config.token, {
	autoReconnect: true,
	disableEveryone: true,
	getAllUsers: true,
	messageLimit: 10,
	sequencerWait: 100,
	moreMentions: true,
	disableEvents: config.disableEvents,
	maxShards: config.shardCount,
	gatewayVersion: 6,
	cleanContent: true
});

function loadCommandSets() {
	return new Promise(resolve => {
		CommandManagers = [];
		for (let prefix in config.commandSets) {
			let color = config.commandSets[prefix].color;
			if (color && !logger.isValidColor(color)) {
				logger.warn(`Log color for ${prefix} invalid`);
				color = undefined;
			}
			CommandManagers.push(new CommandManager(config, prefix, config.commandSets[prefix].dir, color));
		}
		resolve();
	});
}

function initCommandManagers(index = 0) {
	return new Promise((resolve, reject) => {
		CommandManagers[index].initialize(bot, config, settingsManager)
			.then(() => {
				logger.debug(`Loaded CommandManager ${index}`, 'INIT');
				index++;
				if (CommandManagers.length > index) {
					initCommandManagers(index)
						.then(resolve)
						.catch(reject);
				} else {
					resolve();
				}
			}).catch(reject);
	});
}

function loadEvents() {
	return new Promise((resolve, reject) => {
		fs.readdir(__dirname + '/events/', (err, files) => {
			if (err) reject(`Error reading events directory: ${err}`);
			else if (!files) reject('No files in directory events/');
			else {
				for (let name of files) {
					if (name.endsWith('.js')) {
						name = name.replace(/\.js$/, '');
						try {
							events[name] = reload(`./events/${name}.js`);
							initEvent(name);
						} catch (e) {
							logger.error(`${e}\n${e.stack}`, 'Error loading ' + name.replace(/\.js$/, ''));
						}
					}
				}
				resolve();
			}
		});
	});
}

function initEvent(name) {
	if (name === 'messageCreate') {
		bot.on('messageCreate', msg => {
			if (msg.content.startsWith(config.reloadCommand) && config.adminIds.includes(msg.author.id)) {
				reloadModule(msg);
			} else if (msg.content.startsWith(config.evalCommand) && config.adminIds.includes(msg.author.id)) {
				evaluate(msg);
			} else {
				events.messageCreate.handler(bot, msg, CommandManagers, config, settingsManager);
			}
		});
	} else if (name === 'ready') {
		bot.on('ready', () => {
			events.ready(bot, config, games, utils);
		});
	} else {
		bot.on(name, function() {
			events[name](bot, settingsManager, config, ...arguments);
		});
	}
}

function miscEvents() {
	return new Promise(resolve => {
		if (bot.listeners('error').length === 0) {
			bot.on('error', (e, id) => {
				logger.error(`${e}\n${e.stack}`, `SHARD ${id} ERROR`);
			});
		}
		if (bot.listeners('shardReady').length === 0) {
			bot.on('shardReady', id => {
				logger.logBold(` SHARD ${id} CONNECTED`, 'green');
			});
		}
		if (bot.listeners('disconnected').length === 0) {
			bot.on('disconnected', () => {
				logger.logBold(' DISCONNECTED FROM DISCORD', 'red');
			});
		}
		if (bot.listeners('shardDisconnect').length === 0) {
			bot.on('shardDisconnect', (e, id) => {
				logger.error(e, `SHARD ${id} DISCONNECT`);
			});
		}
		if (bot.listeners('shardResume').length === 0) {
			bot.on('shardResume', id => {
				logger.logBold(` SHARD ${id} RESUMED`, 'green');
			});
		}
		if (bot.listeners('guildCreate').length === 0) {
			bot.on('guildCreate', guild => {
				logger.debug(guild.name, 'GUILD CREATE');
			});
		}
		if (bot.listeners('guildDelete').length === 0) {
			bot.on('guildDelete', (guild, unavailable) => {
				if (unavailable === false) {
					logger.debug(guild.name, 'GUILD REMOVE');
				}
			});
		}
		return resolve();
	});
}

function login() {
	logger.logBold(`Logging in...`, 'green');
	bot.connect().catch(error => {
		logger.error(error, 'LOGIN ERROR');
	});
}

/* INIT EVERYTHING */
loadCommandSets()
	.then(initCommandManagers)
	.then(loadEvents)
	.then(miscEvents)
	.then(login)
	.catch(error => {
		logger.error(error, 'ERROR IN INIT');
	});

function reloadModule(msg) {
	logger.debug(`${msg.author.username}: ${msg.content}`, 'RELOAD MODULE');
	let arg = msg.content.substr(config.reloadCommand.length).trim();

	for (let i = 0; i < CommandManagers.length; i++) { // If arg starts with a prefix for a CommandManager reload/load the file
		if (arg.startsWith(CommandManagers[i].prefix)) {
			return CommandManagers[i].reload(bot, msg, arg.substr(CommandManagers[i].prefix.length), config, settingsManager);
		}
	}

	if (arg === 'CommandManagers') {
		loadCommandSets()
			.then(initCommandManagers)
			.then(() => {
				msg.channel.createMessage(':white_check_mark: Reloaded all commands.').then(sentMsg => {
					setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
				});
			}).catch(error => {
				msg.channel.createMessage(':x: Error, check console.').then(sentMsg => {
					setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
				});
				logger.error(error, 'ERROR IN INIT');
			});
	} else if (arg.startsWith('utils/')) {
		fs.access(`${__dirname}/${arg}.js`, fs.R_OK | fs.F_OK, err => {
			if (err) {
				msg.channel.createMessage(':question: That file does not exist!').then(sentMsg => {
					setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
				});
			} else {
				switch(arg.replace(/(utils\/|\.js)/g, '')) {
				case 'CommandManager':
					CommandManager = reload('./utils/CommandManager.js');
					msg.channel.createMessage(':white_check_mark: Reloaded utils/CommandManager.js').then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
					break;
				case 'settingsManager': {
					let tempCommandList = settingsManager.commandList;
					settingsManager.destroy();
					settingsManager = reload('./utils/settingsManager.js');
					settingsManager.commandList = tempCommandList;
					msg.channel.createMessage(':white_check_mark: Reloaded utils/settingsManager.js').then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
					break;
				}
				case 'utils':
					utils = reload('./utils/utils.js');
					msg.channel.createMessage(':white_check_mark: Reloaded utils/utils.js').then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
					break;
				case 'validateConfig':
					validateConfig = reload('./utils/validateConfig.js');
					msg.channel.createMessage(':white_check_mark: Reloaded utils/validateConfig.js').then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
					break;
				case 'Logger':
					logger = new (reload('./utils/Logger.js'))(config.logTimestamp);
					msg.channel.createMessage(':white_check_mark: Reloaded utils/Logger.js').then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
					break;
				default:
					msg.channel.createMessage(":x: Can't reload that because it isn't even loaded!").then(sentMsg => {
						setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
					});
				}
			}
		});
	} else if (arg.startsWith('events/')) {
		arg = arg.substr(7);
		if (events.hasOwnProperty(arg)) {
			events[arg] = reload(`./events/${arg}.js`);
			msg.channel.createMessage(`:white_check_mark: Reloaded events/${arg}.js`).then(sentMsg => {
				setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
			});
		} else {
			msg.channel.createMessage(":x: That event isn't even loaded!").then(sentMsg => {
				setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
			});
		}
	} else if (arg.startsWith('special/')) {
		switch (arg.substr(8)) {
		case 'games':
			games = reload('./special/games.json');
			msg.channel.createMessage(':white_check_mark: Reloaded special/games.json').then(sentMsg => {
				setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
			});
			break;
		default:
			msg.channel.createMessage(":question: That file doesn't exist.").then(sentMsg => {
				setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
			});
			break;
		}
	} else if (arg === 'config') {
		validateConfig = reload('./utils/validateConfig.js');
		config = reload('./config.json');
		validateConfig(config).catch(() => msg.channel.createMessage(':x: Error reloading config, check console... **SHUTTING DOWN**').then(process.exit(0)));
		msg.channel.createMessage(':white_check_mark: Reloaded config.json').then(sentMsg => {
			setTimeout(() => { msg.delete(); sentMsg.delete(); }, 5000); // Delete messages after 5 seconds.
		});
	}
}

function evaluate(msg) {
	logger.debug(`${msg.author.username}: ${msg.content}`, 'EVAL');
	let toEval = msg.content.substr(config.evalCommand.length).trim();
	let result = ':x: Eval Failed :x:';

	try {
		result = eval(toEval);
	} catch (error) {
		logger.debug(error.message, 'EVAL FAILED');
		msg.channel.createMessage(`\`\`\`diff\n- ${error}\`\`\``); // Send error in chat as well
	}

	if (result !== ':x: Eval Failed :x:') {
		if (result instanceof Object) {
			result = stringifyObject(result);
			logger.debug(result, 'EVAL RESULT');
			if (result.length >= 1900) {
				msg.channel.createMessage(`__**Result:**__\n\`\`\`${result.substr(0, 1840)}\`\`\`\nData was over 1900 characters. Check console for full data.`);
			}
			return;
		}
		logger.debug(result, 'EVAL RESULT');
		msg.channel.createMessage(`__**Result:**__\n${result}`);
	}
}

if (config.carbonKey) {
	setInterval(() => {
		if (bot.uptime !== 0) {
			utils.updateCarbon(config.carbonKey, bot.guilds.size);
		}
	}, 1800000);
}

if (config.abalBotsKey) {
	setInterval(() => {
		if (bot.uptime !== 0) {
			utils.updateAbalBots(bot.user.id, config.abalBotsKey, bot.guilds.size);
		}
	}, 1800000);
}

setInterval(() => { // Update the bot's status for each shard every 10 minutes
	if (games.length !== 0 && bot.uptime !== 0 && config.cycleGames === true) {
		bot.shards.forEach(shard => {
			let name = games[~~(Math.random() * games.length)];
			shard.editStatus(null, {name});
		});
	}
}, 600000);

/* IF THE PROCESS EXPERIENCES SIGINT, DISCONNECT EVERYTHING */
process.on('SIGINT', () => {
	bot.disconnect({reconnect: false});
	settingsManager.handleShutdown().then(() => process.exit(0));
	setTimeout(() => { process.exit(0); }, 5000); // Exit procces after 5 seconds.
});