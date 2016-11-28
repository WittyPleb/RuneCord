var reload = require('require-reload')(require);
var utils = reload('./utils.js');
var genericSettings = reload('../db/genericSettings.json');
var commandSettings = reload('../db/commandSettings.json');
var updateGeneric = false;
var updateCommand = false;

const interval = setInterval(() => {
	if (updateGeneric === true) {
		utils.safeSave('db/genericSettings', '.json', JSON.stringify(genericSettings));
		updateGeneric = false;
	}
	if (updateCommand === true) {
		utils.safeSave('db/commandSettings', '.json', JSON.stringify(commandSettings));
		updateCommand = false;
	}
}, 20000);

function handleShutdown() {
	return Promise.all([utils.safeSave('db/genericSettings', '.json', JSON.stringify(genericSettings)), utils.safeSave('db/commandSettings', '.json', JSON.stringify(commandSettings))]);
}

function destroy() {
	clearInterval(interval);
	if (updateGeneric === true) {
		utils.safeSave('db/genericSettings', '.json', JSON.stringify(genericSettings));
	}
	if (updateCommand === true) {
		utils.safeSave('db/commandSettings', '.json'. JSON.stringify(commandSettings));
	}
}

/**
 * Manages settings for the bot.
 * @module settingsManager
 */

////////// COMMAND IGNORING //////////

/**
 * A list of commands loaded by the bot by prefix.
 * @type {Object}
 */
var commandList = {};

/**
 * Add an ignore setting for a user or channel.
 * @arg {String} guildId The guild to apply the setting change for.
 * @arg {String} type Either "userIgnores" or "channelIgnores".
 * @arg {String} id The user or channel to apply the setting change for.
 * @arg {String} command The command to ignore including prefix. Use "all" as the command to ignore all.
 * @returns {Promise<Boolean>} Resolves when done containing a boolean indicating if a setting was changed.
 */
function addIgnoreForUserOrChannel(guildId, type, id, command) {
	return new Promise((resolve, reject) => {
		if (!command || !guildId || !id || (type !== 'userIgnores' && type !== 'channelIgnores')) {
			return reject('Invalid arguments');
		}
		if (!commandSettings.hasOwnProperty(guildId)) {
			commandSettings[guildId] = {};
		}
		if (!commandSettings[guildId].hasOwnProperty(type)) {
			commandSettings[guildId][type] = {};
		}
		if (!commandSettings[guildId][type].hasOwnProperty(id)) {
			commandSettings[guildId][type][id] = [];
		}

		let prefix = Object.keys(commandList).find(p => command.startsWith(p));
		command = command.replace(prefix, '');

		if (command === 'all') {
			if (prefix === undefined) {
				commandSettings[guildId][type][id] = ['all'];
			} else if (commandSettings[guildId][type][id].length === 0) {
				commandSettings[guildId][type][id].push(prefix + 'all');
			} else if (!commandSettings[guildId][type][id].includes(prefix + 'all')) {
				for (let i = 0; i < commandSettings[guildId][type][id].length; i++) {
					if (commandSettings[guildId][type][id][0] === prefix) {
						commandSettings[guildId][type][id].splice(i, 1);
					}
				}
				commandSettings[guildId][type][id].push(prefix + 'all');
			} else {
				return resolve(false);
			}
			updateCommand = true;
			return resolve(true);
		} else if (prefix !== undefined && commandList.hasOwnProperty(prefix) && commandList[prefix].includes(command) && !commandSettings[guildId][type][id].includes('all') && !commandSettings[guildId][type][id].includes(prefix + 'all') && !commandSettings[guildId][type][id].includes(prefix + command)) {
			commandSettings[guildId][type][id].push(prefix + command);
			updateCommand = true;
			return resolve(true);
		}
		removeIfEmptyArray(commandSettings[guildId][type], id, updateCommand);
		removeIfEmpty(commandSettings[guildId], type, updateCommand);
		removeIfEmpty(commandSettings, guildId, updateCommand);
		return resolve(false);
	});
}

// Used to remove unneccesary keys.
function removeIfEmpty(obj, key, updater) {
	if (Object.keys(obj[key]).length === 0) {
		delete obj[key];
		if (updater !== undefined) {
			updater = true;
		}
	}
}

function removeIfEmptyArray(obj, key, updater) {
	if (obj[key].length === 0) {
		delete obj[key];
		if (updater !== undefined) {
			updater = true;
		}
	}
}

module.exports = {
	destroy,
	handleShutdown,
	commandList,
	addIgnoreForUserOrChannel
};