var superagent = require('superagent');
var reload = require('require-reload');

var logger = new (reload('./Logger.js'))((reload('../config.json')).logTimestamp);

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