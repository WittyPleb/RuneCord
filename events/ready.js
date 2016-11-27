/* SET THE NUMBER FORMAT FOR THE ENTIRE FILE */
var Nf = new Intl.NumberFormat('en-US');

/* REQUIRED FILES */
var _Logger = require('../utils/Logger.js');

/* LOCAL VARIALBES */
var logger;

module.exports = function(bot, config, games, utils) {
	if (logger === undefined) {
		logger = new _Logger(config.logTimestamp);
	}
	utils.checkForUpdates();
	bot.shards.forEach(shard => {
		let name = games[~~(Math.random() * games.length)];
		shard.editStatus(null, {name});
	});
	logger.logWithHeader('READY', 'bgGreen', 'black', `Guilds: ${Nf.format(bot.guilds.size)} Users: ${Nf.format(bot.users.size)} AVG: ${Nf.format((bot.users.size / bot.guilds.size).toFixed(2))}`);
}