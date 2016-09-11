/* REQUIRED DEPENDENCIES */
const fs    = require('fs');
const chalk = require('chalk');

/* REQUIRED FILES */
const logger = require('../logger.js');
const config = require('../config.json');

/* GLOBAL VARIABLES */
ServerSettings = require('./guilds.json');

var updatedG = false;

setInterval(() => {
  if (updatedG) {
    updatedG = false;
    updateGuilds();
  }
}, 60000);

function updateGuilds() {
  fs.writeFile(__dirname + '/guilds-temp.json', JSON.stringify(ServerSettings), (error) => {
    if (error) {
      logger.error(error);
    } else {
      fs.stat(__dirname + '/guilds-temp.json', (err, stats) => {
        if (err) {
          logger.error(err);
        } else if (stats['size'] < 5) {
          logger.warn('Prevented guild settings database from being overwritten.');
        } else {
          fs.rename(__dirname + '/guilds-temp.json', __dirname + '/guilds.json', (e) => {
            if (e) {
              logger.error(e);
            }
          });
        }
      });
    }
  });
}

function addGuild(guild) {
  if (!guild) return;
  if (!ServerSettings.hasOwnProperty(guild.id)) {
    ServerSettings[guild.id] = {
      'ignore': [],
      'welcome': 'none',
      'deleteCommands': false,
      'notifyChannel': 'general'
    };
    updateGuilds();
  }
}

exports.guildIsNew = (guild) => {
  if (ServerSettings.hasOwnProperty(guild.id)) {
    return false;
  }
  return true;
};

exports.addGuild = (guild) => {
  if (!guild) return;
  if (!ServerSettings.hasOwnProperty(guild.id)) {
    ServerSettings[guild.id] = {
      'ignore': [],
      'welcome': 'none',
      'deleteCommands': false,
      'notifyChannel': 'general'
    };
    updateGuilds();
  }
};

exports.changeSetting = (key, value, guildId) => {
  if (!key || value == undefined || value == null || !guildId) return;
  switch(key) {
    case 'welcome':
    ServerSettings[guildId].welcome = value;
    break;
    case 'deleteCommands':
    ServerSettings[guildId].deleteCommands = value;
    break;
    case 'notifyChannel':
    ServerSettings[guildId].notifyChannel = value;
    break;
  }
  updatedG = true;
};

exports.ignoreChannel = (channelId, guildId) => {
  if (!channelId || !guildId) return;
  if (ServerSettings[guildId].ignore.indexOf(channelId) == -1) {
    ServerSettings[guildId].ignore.push(channelId);
    updatedG = true;
  }
};

exports.unignoreChannel = (channelId, guildId) => {
  if (!channelId || !guildId) return;
  if (ServerSettings[guildId].ignore.indexOf(channelId) > -1) {
    ServerSettings[guildId].ignore.splice(ServerSettings[guildId].ignore.indexOf(channelId), 1);
    updatedG = true;
  }
};

exports.handleLeave = (guild) => {
  if (!guild || !guild.id) return;
  if (ServerSettings.hasOwnProperty(guild.id)) {
    delete ServerSettings[guild.id];
    updatedG = true;
  }
};

exports.checkGuilds = (client) => {
  client.guilds.map((guild) => {
    if (guild == undefined) return;
    if (!ServerSettings.hasOwnProperty(guild.id)) {
      logger.info(chalk.bold.green('[JOINED] ') + guild.name);
      if (config.banned_server_ids && config.banned_server_ids.indexOf(guild.id) > -1) {
        logger.error('Joined server but it was on the ban list: ' + guild.name);
        setTimeout(() => {
          client.guild.leave();
        }, 1000);
      } else {
        addGuild(guild);
      }
    }
  });
}
