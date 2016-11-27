var superagent = require('superagent');
var reload = require('require-reload');

var logger = new (reload('./Logger.js'))((reload('../config.json')).logTimestamp);

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