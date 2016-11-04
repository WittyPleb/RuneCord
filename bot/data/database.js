/* REQUIRED DEPENDENCIES */
const fs    = require(`fs`);

/* REQUIRED FILES */
const logger = require(`../logger.js`);
const config = require(`../config.json`);

/* GLOBAL VARIABLES */
ServerSettings = require(`./guilds.json`);
Times          = require(`./times.json`);

var updatedG = false;
let updatedT = false;
let inactive = [];

setInterval(() => {
  if (updatedG) {
    updatedG = false;
    updateGuilds();
  }
  if (updatedT) {
    updatedT = false;
    updateTimes();
  }
}, 60000);

function updateGuilds() {
  fs.writeFile(__dirname + `/guilds-temp.json`, JSON.stringify(ServerSettings), (error) => {
    if (error) {
      logger.error(error);
    } else {
      fs.stat(__dirname + `/guilds-temp.json`, (err, stats) => {
        if (err) {
          logger.error(err);
        } else if (stats[`size`] < 5) {
          logger.warn(`Prevented guild settings database from being overwritten.`);
        } else {
          fs.rename(__dirname + `/guilds-temp.json`, __dirname + `/guilds.json`, (e) => {
            if (e) {
              logger.error(e);
            }
          });
        }
      });
    }
  });
}

function updateTimes() {
  fs.writeFile(__dirname + `/times-temp.json`, JSON.stringify(Times), (error) => {
    if (error) {
      logger.error(error);
    } else {
      fs.stat(__dirname + `/times-temp.json`, (err, stats) => {
        if (err) {
          logger.error(err);
        } else if (stats[`size`] < 5) {
          logger.warn(`Prevented times database from being overwritten.`);
        } else {
          fs.rename(__dirname + `/times-temp.json`, __dirname + `/times.json`, (e) => {
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
      'welcome': `none`,
      'deleteCommands': false,
      'notifyChannel': `general`
    };
    updateGuilds();
  }
}

exports.guildIsNew = (guild) => {
  if (Times.hasOwnProperty(guild.id)) {
    return false;
  }
  return true;
};

exports.addGuild = (guild) => {
  if (!guild) return;
  if (!ServerSettings.hasOwnProperty(guild.id)) {
    ServerSettings[guild.id] = {
      'ignore': [],
      'welcome': `none`,
      'deleteCommands': false,
      'notifyChannel': `general`
    };
    updateGuilds();
  }
  if (!Times.hasOwnProperty(guild.id)) {
    Times[guild.id] = Date.now();
    updatedT = true;
  }
};

exports.changeSetting = (key, value, guildId) => {
  if (!key || value == undefined || value == null || !guildId) return;
  switch(key) {
    case `welcome`:
    ServerSettings[guildId].welcome = value;
    break;
    case `deleteCommands`:
    ServerSettings[guildId].deleteCommands = value;
    break;
    case `notifyChannel`:
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
  if (Times.hasOwnProperty(guild.id)) {
    delete Times[guild.id];
    updatedT = true;
  }
};

exports.checkGuilds = (client) => {
  inactive = [];
  let now = Date.now();
  Object.keys(Times).map((id) => {
    if (!client.guilds.find(s => s.id == id)) {
      delete Times[id];
    }
  });

  client.guilds.map((guild) => {
    if (guild == undefined) return;
    if (!Times.hasOwnProperty(guild.id)) {
      logger.join(guild);
      if (config.banned_server_ids && config.banned_server_ids.indexOf(guild.id) > -1) {
        logger.error(`Joined server but it was on the ban list: ${guild.name} (${guild.id})`);
        client.channels.get(guild.defaultChannel.id).sendMessage(`This server is on the ban list, please contact the bot creator to find out why.`);
        setTimeout(() => {
          client.guild.leave();
        }, 1000);
      } else {
        Times[guild.id] = now;
        addGuild(guild);
      }
    } else if (config.whitelist.indexOf(guild.id) == -1 && now - Times[guild.id] >= 604800000) {
      inactive.push(guild.id);
    }
  });
  updatedT = true;

  if (inactive.length > 0) {
    logger.info(`Can leave ${inactive.length} servers that don't use the bot.`);
  }
};

exports.removeInactive = (client, msg, delay) => {
  if (!client || !msg) return;
  if (inactive.length == 0) {
    msg.channel.sendMessage(`No servers to leave :)`);
    return;
  }

  let count = 0;
  let passedOver = 0;
  let toSend = `__Left server for inactivity__`;
  let now1 = new Date();
  let removeInterval = setInterval(() => {
    let guild = client.guilds.get(`id`, inactive[passedOver]);
    if (guild) {
      let days = ((now1 - Times[inactive[passedOver]]) / 1000 / 60 / 60 / 24).toFixed(1);
      toSend += `\n**${parseInt(count) + 1}:${guild.name.replace(/@/g, `@\u200b`)}(${days} days)`;
      guild.leave();
      if (Times.hasOwnProperty(guild.id)) {
        delete Times[guild.id];
        updatedT = true;
      }
      count++;
    }
    delete Times[inactive[passedOver]];
    passedOver++;
    if (count >= 10 || passedOver >= inactive.length) {
      for (let i = 0; i < passedOver; i++) {
        inactive.shift();
      }
      if (count == 0) {
        msg.channel.sendMessage(`No servers to leave :)`);
      } else {
        msg.channel.sendMessage(toSend);
      }
      clearInterval(removeInterval);
      updatedT = true;
      return;
    }
  }, delay || 10000);
};

exports.updateTimestamp = (guild) => {
  if (!guild || !guild.id) return;

  if (Times.hasOwnProperty(guild.id)) {
    Times[guild.id] = Date.now();
    updatedT = true;
  }

  if (inactive.indexOf(guild.id) >= 0) {
    inactive.splice(inactive.indexOf(guild.id), 1);
  }
};

exports.inactive = inactive;
