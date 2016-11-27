/* REQUIRE NODE 6+ TO EVEN START THE BOT */
if (parseFloat(process.versions.node) < 6) {
	throw new Error('Incompatible node version. Please use Node 6 or higher.');
}

/* REQUIRED DEPENDENCIES */
var reload = require('require-reload')(require);
var fs = require('fs');
var Eris = require('eris');

/* REQUIRED FILES */
var config = require('./config.json');
var validateConfig = require('./utils/validateConfig.js');
var CommandManager = require('./utils/CommandManager.js');
var utils = require('./utils/utils.js');
var games = require('./special/games.json');

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
		CommandManagers[index].initialize(bot, config)
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
			events.messageCreate.handler(bot, msg, CommandManagers, config);
		});
	} else if (name === 'ready') {
		bot.on('ready', () => {
			events.ready(bot, config, games, utils);
		});
	} else {
		bot.on(name, function() {
			events[name](bot, config, ...arguments);
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

setInterval(() => { // Update the bot's status for each shard every 10 minutes
	if (games.length !== 0 && bot.uptime !== 0 && config.cycleGames === true) {
		bot.shards.forEach(shard => {
			let name = games[~~(Math.random() * games.length)];
			shard.editStatus(null, {name});
		});
	}
}, 600000);

/* IF THE PROCESS EXPERIENCES SIGINT, DISCONNECT EVERYTHING AND NEVER TRY TO RECONNECT */
process.on('SIGINT', () => {
	bot.disconnect({reconnect: false});
	setTimeout(() => {
		process.exit(0);
	}, 5000);
});