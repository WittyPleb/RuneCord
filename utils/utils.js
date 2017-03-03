/* REQUIRED DEPENDENCIES */
var superagent = require('superagent');
var reload     = require('require-reload');
var fs         = require('fs');

/* LOCAL VARIABLES */
var logger = new (reload('./Logger.js'))((reload('../config.json')).logTimestamp);

/**
 * Contains various functions.
 * @module utils
 */

/**
 * Save a file safely, preventing it from being cleared.
 * @arg {String} dir Path from root folder including filename. (EX: db/servers)
 * @arg {String} ext File extension.
 * @arg {String} data Data to be written to the file.
 * @arg {Number} minSize=5 Will not save if less than this size in bytes.
 * @arg {Boolean} log=true If it should log to the console.
 * @returns {Promise<Boolean|Error>} Will resolve with true if saved successfully.
 */
exports.safeSave = function(file, ext, data, minSize = 5, log = true) {
	return new Promise((resolve, reject) => {
		if (!file || !ext || !data) {
			return reject(new Error('Invalid arguments'));
		}
		if (file.startsWith('/')) file = file.substr(1);
		if (!ext.startsWith('.')) ext = '.' + ext;

		fs.writeFile(`${__dirname}/../${file}-temp${ext}`, data, error => {
			if (error) {
				logger.error(error, 'SAFE SAVE WRITE');
				reject(error);
			} else {
				fs.stat(`${__dirname}/../${file}-temp${ext}`, (err, stats) => {
					if (err) {
						logger.error(err, 'SAFE SAVE STAT');
						reject(err);
					} else if (stats['size'] < minSize) {
						logger.debug('Prevented file from being overwritten', 'SAFE SAVE');
						resolve(false);
					} else {
						fs.rename(`${__dirname}/../${file}-temp${ext}`, `${__dirname}/../${file}${ext}`, e => {
							if (e) {
								logger.error(e, 'SAFE SAVE RENAME');
								reject(e);
							} else {
								resolve(true);
							}
						});
						if (log === true) {
							logger.debug(`Updated ${file}${ext}`, 'SAFE SAVE');
						}
					}
				});
			}
		});
	});
}

/**
 * Update the server count on Carbon.
 * @arg {String} key The bot's key.
 * @arg {Number} servercount Server count.
 */
exports.updateCarbon = function(key, servercount) {
	if (!key || !servercount) return;
	superagent.post('https://www.carbonitex.net/discord/data/botdata.php')
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
 * @arg {Client} bot The client.
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

/**
 * Converts to human readable form in a shorter form
 * @arg {Number} milliseconds Time to format in milliseconds.
 * @returns {String} The formatted time
 */
exports.formatTimeShort = function(milliseconds) {
	let ms = milliseconds / 1000;
	let seconds = (ms % 60).toFixed(0);
	ms /= 60;
	let minutes = (ms % 60).toFixed(0);
	ms /= 60;
	let hours = (ms % 24).toFixed(0);
	ms /= 24;
	let days = ms.toFixed(0);

	return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Gets the name of a skill based on an ID.
 * @arg {Number} id Skill ID.
 * @returns {String} The skill name.
 */
exports.getSkillName = function(id) {
	let skillNames = [
		'Overall',
		'Attack',
		'Defence',
		'Strength',
		'Constitution',
		'Ranged',
		'Prayer',
		'Magic',
		'Cooking',
		'Woodcutting',
		'Fletching',
		'Fishing',
		'Firemaking',
		'Crafting',
		'Smithing',
		'Mining',
		'Herblore',
		'Agility',
		'Thieving',
		'Slayer',
		'Farming',
		'Runecrafting',
		'Hunter',
		'Construction',
		'Summoning',
		'Dungeoneering',
		'Divination',
		'Invention'
	];

	return skillNames[id];
}

/**
 * Gets the value for a lamp that has a fixed XP.
 * @arg {Number} level The level in the skill. (Also the array ID for the lamp)
 * @arg {String} type What type of lamp to lookup.
 * @return {Number} The XP you get from the lamp.
 */
exports.getLampXp = function(level, type) {
	let lamps = {
		small: [62, 69, 77, 85, 93, 104, 123, 127, 194, 153, 170, 188, 205, 229, 252, 261, 274, 285, 298, 310, 324, 337, 352, 367, 384, 399, 405, 414, 453, 473, 493, 514, 536, 559, 583, 608, 635, 662, 691, 720, 752, 784, 818, 853, 889, 929, 970, 1012, 1055, 1101, 1148, 1200, 1249, 1304, 1362, 1422, 1485, 1546, 1616, 1684, 1757, 1835, 1911, 2004, 2108, 2171, 2269, 2379, 2470, 2592, 2693, 2809, 2946, 3082, 3213, 3339, 3495, 3646, 3792, 3980, 4166, 4347, 4521, 4762, 4918, 5033, 5375, 5592, 5922, 6121, 6451, 6614, 6928, 7236, 7532, 8064, 8347, 8602],
		medium: [125, 138, 154, 170, 186, 208, 246, 254, 388, 307, 340, 376, 411, 458, 504, 523, 548, 570, 596, 620, 649, 674, 704, 735, 768, 798, 810, 828, 906, 946, 986, 1028, 1072, 1118, 1166, 1217, 1270, 1324, 1383, 1441, 1504, 1569, 1636, 1707, 1779, 1858, 1941, 2025, 2110, 2202, 2296, 2400, 2499, 2609, 2724, 2844, 2970, 3092, 3233, 3368, 3515, 3671, 3822, 4009, 4216, 4343, 4538, 4758, 4940, 5185, 5386, 5618, 5893, 6164, 6427, 6679, 6990, 7293, 7584, 7960, 8332, 8695, 9043, 9524, 9837, 10066, 10751, 11185, 11845, 12243, 12903, 13229, 13857, 14472, 15065, 16129, 16695, 17204],
		large: [250, 276, 308, 340, 373, 416, 492, 508, 777, 614, 680, 752, 822, 916, 1008, 1046, 1096, 1140, 1192, 1240, 1298, 1348, 1408, 1470, 1536, 1596, 1621, 1656, 1812, 1892, 1973, 2056, 2144, 2237, 2332, 2434, 2540, 2648, 2766, 2882, 3008, 3138, 3272, 3414, 3558, 3716, 3882, 4050, 4220, 4404, 4593, 4800, 4998, 5218, 5448, 5688, 5940, 6184, 6466, 6737, 7030, 7342, 7645, 8018, 8432, 8686, 9076, 9516, 9880, 10371, 10772, 11237, 11786, 12328, 12855, 13358, 13980, 14587, 15169, 15920, 16664, 17390, 18087, 19048, 19674, 20132, 21502, 22370, 23690, 24486, 25806, 26458, 27714, 28944, 30130, 32258, 33390, 34408],
		huge: [499, 612, 616, 680, 746, 832, 984, 1016, 1142, 1228, 1360, 1504, 1645, 1832, 2016, 2093, 2192, 2280, 2384, 2480, 2596, 2696, 2816, 2940, 3071, 3192, 3331, 3312, 3624, 3784, 3946, 4112, 4288, 4129, 4664, 4872, 5080, 5296, 5532, 5764, 6016, 6276, 6544, 6828, 7116, 7432, 7764, 8100, 8440, 8808, 9185, 9600, 9996, 10436, 10896, 11376, 11880, 12368, 12932, 13474, 14060, 14684, 15290, 16036, 16864, 17371, 18152, 19032, 19760, 20741, 21543, 22474, 23572, 24657, 25709, 26716, 27960, 29173, 30338, 31840, 33328, 34780, 36174, 38097, 39347, 41196, 43003, 44739, 47380, 48972, 51612, 52916, 55428, 57887, 60260, 64516, 66780, 68815]
	}

	return lamps[type][Math.min(97, level - 1)];
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