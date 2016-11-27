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

/* LOCAL VARIABLES */
var logger;
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
	if (name === 'ready') {
		bot.on('ready', () => {
			events.ready(bot, config);
		});
	} else {
		bot.on(name, function() {
			events[name](bot, config, ...arguments);
		});
	}
}

function login() {
	logger.logBold(`Logging in...`, 'green');
	bot.connect().catch(error => {
		logger.error(error, 'LOGIN ERROR');
	});
}

loadEvents()
	.then(login)
	.catch(error => {
		logger.error(error, 'ERROR IN INIT');
	});

process.on('SIGINT', () => {
	bot.disconnect({reconnect: false});
	setTimeout(() => {
		process.exit(0);
	}, 5000);
});