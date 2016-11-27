var superagent = require('superagent');
var reload = require('require-reload');

var logger = new (reload('./Logger.js'))((reload('../config.json')).logTimestamp);

/**
 * Update the server count on Carbon.
 * @arg {String} key The bot's key.
 * @arg {Number} servercount Server count.
 */
exports.updateCarbon = function(key, servercount) {
	if (!key || !servercount) return;
	superagent.post('https://www.carbonitex.com/discord/data/botdata.php')
		.type('application/json')
		.send({key, servercount})
		.end(error => {
			logger.debug('Updated Carbon server count to ' + servercount, 'CARBON UPDATE');
			if (error) logger.error(error.status || error.response, 'CARBON UPDATE ERROR');
		});
}

/**
 * Update the server count on Abalabahaha's bot list.
 * @arg {String} key The bot's key.
 * @arg {Number} server_count Server count.
 */
exports.updateAbalBots = function(id, key, server_count) {
	if (!key || !server_count) return;
	superagent.post(`https://bots.discord.pw/api/bots/${id}/stats`)
		.set('Authorization', key)
		.type('application/json')
		.send({server_count})
		.end(error => {
			logger.debug('Updated bot server count to ' + server_count, 'ABAL BOT LIST UPDATE');
			if (error) logger.error(error.status || error.response, 'ABAL BOT LIST UPDATE ERROR');
		});
}

/**
 * Set the bot's avatar from /avatars/
 * @arg {Eris.Client} bot The client.
 * @arg {String} url The direct url to the image.
 * @returns {Promise}
 */
exports.setAvatar = function(bot, url) {
	return new Promise((resolve, reject) => {
		if (bot !== undefined && typeof url === 'string') {
			superagent.get(url).end((error, response) => {
				if (!error && response.status === 200) {
					bot.editSelf({avatar: `data:${response.header['content-type']};base64, ${response.body.toString('base64')}`}).then(resolve).catch(reject);
				} else {
					reject('Got status code ' + error.status || error.response);
				}
			});
		} else {
			reject('Invalid parameters');
		}
	});
}

/**
 * Converts to human readable form
 * @arg {Number} milliseconds Time to format in milliseconds.
 * @returns {String} The formatted time
 */
exports.formatTime = function(milliseconds) {
	let ms = milliseconds / 1000;
	let seconds = (ms % 60).toFixed(0);
	ms /= 60;
	let minutes = (ms % 60).toFixed(0);
	ms /= 60;
	let hours = (ms % 24).toFixed(0);
	ms /= 24;
	let days = ms.toFixed(0);

	return `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`;
}

/** Check for a newer version of RuneCord */
exports.checkForUpdates = function() {
	let version = ~~(require('../package.json').version.split('.').join('')); // This is used to convert the number that can be compared.
	superagent.get('https://raw.githubusercontent.com/unlucky4ever/RuneCord/master/package.json')
		.end((error, response) => {
			if (error) {
				logger.warn('Error checking for updated: ' + (error.status || error.response));
			} else {
				let latest = ~~(JSON.parse(response.text).version.split('.').join(''));
				if (latest > version) {
					logger.warn('A new version of RuneCord is available', 'OUT OF DATE');
				}
			}
		});
}