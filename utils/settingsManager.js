/* REQUIRED DEPENDENCIES */
var reload = require('require-reload')(require);

/* REQUIRED FILES */
var utils           = reload('./utils.js');
var commandSettings = reload('../db/commandSettings.json');

/* LOCAL VARIABLES */
var updateCommand = false;

const interval = setInterval(() => {
	if (updateCommand === true) {
		utils.safeSave('db/commandSettings', '.json', JSON.stringify(commandSettings));
		updateCommand = false;
	}
}, 20000);

function handleShutdown() {
	return Promise.all([utils.safeSave('db/commandSettings', '.json', JSON.stringify(commandSettings))]);
}

function destroy() {
	clearInterval(interval);
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

/**
 * Remove an ignore setting for a user or channel.
 * @arg {String} guildId The guild to apply the setting change for.
 * @arg {String} type Either "userIgnores" or "channelIgnores".
 * @arg {String} id The user or channel to apply the change for.
 * @arg {String} command The command to unignore including prefix. Use "all" as the command to unignore all.
 * @returns {Promise<Boolean>} Resolves when done containing a boolean indicating if a setting was changed.
 */
function removeIgnoreForUserOrChannel(guildId, type, id, command) {
	return new Promise((resolve, reject) => {
		if (!command || !guildId || !id || (type !== 'userIgnores' && type !== 'channelIgnores')) {
			return reject('Invalid arguments');
		}
		if (!commandSettingExistsFor(guildId, type) || !commandSettings[guildId][type].hasOwnProperty(id)) {
			return resolve(false);
		}

		let prefix = Object.keys(commandList).find(p => command.startsWith(p));
		command = command.replace(prefix, '');

		if (command === 'all') {
			if (prefix === undefined && commandSettings[guildId][type][id].length !== 0) {
				delete commandSettings[guildId][type][id];
				removeIfEmpty(commandSettings[guildId], type);
				removeIfEmpty(commandSettings, guildId);
			} else if (commandSettings[guildId][type][id].length !== 0) {
				if (commandSettings[guildId][type][id].includes('all')) {
					commandSettings[guildId][type][id] = [];
					for (let p in commandList) { // For all of the prefixes.
						if (p !== prefix && commandList.hasOwnProperty(p)) {
							commandSettings[guildId][type][id].push(p + 'all');
						}
					}
					if (commandSettings[guildId][type][id].length === 0) {
						delete commandSettings[guildId][type][id];
						removeIfEmpty(commandSettings[guildId], type);
						removeIfEmpty(commandSettings, guildId);
					}
				} else if (commandSettings[guildId][type][id].includes(prefix + 'all')) {
					commandSettings[guildId][type][id].splice(commandSettings[guildId][type][id].indexOf(prefix + 'all'), 1);
					if (commandSettings[guildId][type][id].length === 0) {
						delete commandSettings[guildId][type][id];
						removeIfEmpty(commandSettings[guildId], type);
						removeIfEmpty(commandSettings, guildId);
					}
				} else {
					for (let i = 0; i < commandSettings[guildId][type][id].length; i++) {
						if (commandSettings[guildId][type][id][i].startsWith(prefix)) {
							commandSettings[guildId][type][id].splice(i, 1);
						}
					}
					if (commandSettings[guildId][type][id].length === 0) {
						delete commandSettings[guildId][type][id];
						removeIfEmpty(commandSettings[guildId], type);
						removeIfEmpty(commandSettings, guildId);
					}
				}
			} else {
				return resolve(false);
			}
			updateCommand = true;
			return resolve(true);
		} else if (prefix !== undefined && commandList.hasOwnProperty(prefix) && commandList[prefix].includes(command)) {
			if (commandSettings[guildId][type][id].includes('all')) {
				commandSettings[guildId][type][id] = [];
				for (let p in commandList) { // For all of the prefixes.
					if (commandList.hasOwnProperty(p)) {
						if (p === prefix) {
							for (let c of commandList[p]) { // All of that prefix's commands.
								if (c !== command) {
									commandSettings[guildId][type][id].push(p + c);
								}
							}
						} else {
							commandSettings[guildId][type][id].push(p + 'all');
						}
					}
				}
			} else if (commandSettings[guildId][type][id].includes(prefix + 'all')) {
				commandSettings[guildId][type][id].splice(commandSettings[guildId][type][id].indexOf(prefix + 'all'), 1);
				for (let c of commandList[prefix]) {
					if (c !== command) {
						commandSettings[guildId][type][id].push(prefix + c);
					}
				}
			} else if (commandSettings[guildId][type][id].includes(prefix + command)) {
				commandSettings[guildId][type][id].splice(commandSettings[guildId][type][id].indexOf(prefix + command), 1);
				if (commandSettings[guildId][type][id].length === 0) {
					delete commandSettings[guildId][type][id];
					removeIfEmpty(commandSettings[guildId], type);
					removeIfEmpty(commandSettings, guildId);
				}
			} else {
				return resolve(false);
			}
			updateCommand = true;
			return resolve(true);
		}
		return resolve(false);
	});
}

/**
 * Add an ignore setting for a guild.
 * @arg {String} guildId The guild to apply the setting change for.
 * @arg {String} command The command to ignore including prefix. Use "all" as the command to ignore all.
 * @returns {Promise<Boolean>}
 */
function addIgnoreForGuild(guildId, command) {
	return new Promise((resolve, reject) => {
		if (!command || !guildId) {
			return reject('Invalid arguments');
		}
		if (!commandSettings.hasOwnProperty(guildId)) {
			commandSettings[guildId] = {};
		}
		if (!commandSettings[guildId].hasOwnProperty('guildIgnores')) {
			commandSettings[guildId].guildIgnores = [];
		}

		let prefix = Object.keys(commandList).find(p => command.startsWith(p));
		command = command.replace(prefix, '');

		if (command === 'all') {
			if (prefix === undefined) {
				commandSettings[guildId].guildIgnores = ['all'];
			} else if (commandSettings[guildId].guildIgnores.length == 0) {
				commandSettings[guildId].guildIgnores.push(prefix + 'all');
			} else if (commandSettings[guildId].guildIgnores.includes(prefix + 'all')) {
				for (let i = 0; i < commandSettings[guildId].guildIgnores.length; i++) {
					if (commandSettings[guildId].guildIgnores[i][0] === prefix) {
						commandSettings[guildId].guildIgnores.splice(i, 1);
					}
				}
				commandSettings[guildId].guildIgnores.push(prefix + 'all');
			} else {
				removeIfEmptyArray(commandSettings[guildId], 'guildIgnores', updateCommand);
				removeIfEmpty(commandSettings, guildId, updateCommand);
				return resolve(false);
			}
			updateCommand = true;
			return resolve(true);
		} else if (prefix !== undefined && commandList.hasOwnProperty(prefix) && commandList[prefix].includes(command) && !commandSettings[guildId].guildIgnores.includes('all') && !commandSettings[guildId].guildIgnores.includes(prefix + 'all') && !commandSettings[guildId].guildIgnores.includes(prefix + command)) {
			commandSettings[guildId].guildIgnores.push(prefix + command);
			updateCommand = true;
			return resolve(true);
		}
		removeIfEmptyArray(commandSettings[guildId], 'guildIgnores', updateCommand);
		removeIfEmpty(commandSettings, guildId, updateCommand);
		resolve(false);
	});
}

/**
 * Check if a command is ignored.
 * @arg {String} prefix The command's prefix.
 * @arg {String} command The name of the command including prefix.
 * @arg {String} guildId The guild to check for.
 * @arg {String} channelId The channel to check for.
 * @arg {String} userId The user to check for.
 * @returns {Boolean} If the command is ignored.
 */
function isCommandIgnored(prefix, command, guildId, channelId, userId) {
	if (!command || !guildId || !channelId || !userId) {
		return false;
	}
	if (!commandSettings.hasOwnProperty(guildId)) {
		return false;
	}
	if (commandSettings[guildId].hasOwnProperty('guildIgnores') && (commandSettings[guildId].guildIgnores[0] === 'all' || commandSettings[guildId].guildIgnores(prefix + 'all') || commandSettings[guildId].guildIgnores.includes(prefix + command))) {
		return true;
	}
	if (commandSettings[guildId].hasOwnProperty('channelIgnores') && commandSettings[guildId].channelIgnores.hasOwnProperty(channelId) && (commandSettings[guildId].channelIgnores[channelId][0] === 'all' || commandSettings[guildId].channelIgnores[channelId].includes(prefix + 'all') || commandSettings[guildId].channelIgnores[channelId].includes(prefix + command))) {
		return true;
	}
	if (commandSettings[guildId].hasOwnProperty('userIgnores') && commandSettings[guildId].userIgnores.hasOwnProperty(userId) && (commandSettings[guildId].userIgnores[userId][0] === 'all' || commandSettings[guildId].userIgnores[userId].includes(prefix + 'all') || commandSettings[guildId].userIgnores[userId].includes(prefix + command))) {
		return true;
	}
	return false;
}

/**
 * Check what commands are ignored for something
 * @arg {String} guildId The guild to check in.
 * @arg {String} type "guild", "channel", or "user".
 * @arg {String} [id] The id for the channel or user.
 * @returns {Array<String>} An array containing the ignored commands.
 */
function checkIgnoresFor(guildId, type, id) {
	if (commandSettings.hasOwnProperty(guildId)) {
		if (type === 'guild' && commandSettings[guildId].hasOwnProperty('guildIgnores')) {
			return commandSettings[guildId].guildIgnores;
		} else if (type === 'channel' && commandSettings[guildId].hasOwnProperty('channelIgnores') && commandSettings[guildId].channelIgnores.hasOwnProperty(id)) {
			return commandSettings[guildId].channelIgnores[id];
		} else if (type === 'user' && commandSettings[guildId].hasOwnProperty('userIgnores') && commandSettings[guildId].userIgnores.hasOwnProperty(id)) {
			return commandSettings[guildId].userIgnores[id];
		}
	}
	return [];
}

// Check if a guild has settings of a certain type
function commandSettingExistsFor(guildId, setting) {
	return commandSettings.hasOwnProperty(guildId) && commandSettings[guildId].hasOwnProperty(setting);
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
	addIgnoreForUserOrChannel,
	removeIgnoreForUserOrChannel,
	addIgnoreForGuild,
	isCommandIgnored,
	checkIgnoresFor
};