/* REQUIRE NODE 6+ TO EVEN START THE BOT */
if (parseFloat(process.versions.node) < 6) {
	throw new Error('Incompatible node version. Please use Node 6 or higher.');
}

/* REQUIRED DEPENDENCIES */
var reload = require('require-reload')(require);
//var fs = require('fs');
var Eris = require('eris');

/* REQUIRED FILES */
var config = require('./config.json');
var validateConfig = require('./utils/validateConfig.js');

/* LOCAL VARIABLES */
var logger;

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

function login() {
	logger.logBold(`Logging in...`, 'green');
	bot.connect().catch(error => {
		logger.error(error, 'LOGIN ERROR');
	});
}

login();

process.on('SIGINT', () => {
	bot.disconnect({reconnect: false});
	setTimeout(() => {
		process.exit(0);
	}, 5000);
});