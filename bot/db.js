/**
 * Module Dependencies
 */
var fs = require("fs");
/**
 * Required Files
 */
var config = require("../bot/config.json");
/**
 * Global variables
 */
ServerSettings = require("../db/servers.json");
Times = require("../db/times.json");
var inactive = [];
var updatedS = false;
var updatedT = false;
setInterval(() => {
  if (updatedS) {
    updatedS = false;
    updateServers();
  }
  if (updatedT) {
    updatedT = false;
    updateTimes();
  }
}, 60000);

function updateServers() {
  fs.writeFile(__dirname + "/../db/servers-temp.json", JSON.stringify(ServerSettings), (error) => {
    if (error) {
      console.log(error);
    } else {
      fs.stat(__dirname + "/../db/servers-temp.json", (err, stats) => {
        if (err) {
          console.log(err);
        } else if (stats["size"] < 5) {
          console.log("Prevented server settings database from being overwritten");
        } else {
          fs.rename(__dirname + "/../db/servers-temp.json", __dirname + "/../db/servers.json", (e) => {
            if (e) {
              console.log(e);
            }
          });
          if (debug) {
            console.log(cDebug(" DEBUG ") + " Updated servers.json");
          }
        }
      });
    }
  });
}

function updateTimes() {
  fs.writeFile(__dirname + "/../db/times-temp.json", JSON.stringify(Times), (error) => {
    if (error) {
      console.log(error);
    } else {
      fs.stat(__dirname + "/../db/times-temp.json", (err, stats) => {
        if (err) {
          console.log(err);
        } else if (stats["size"] < 5) {
          console.log("Prevented times database from being overwritten");
        } else {
          fs.rename(__dirname + "/../db/times-temp.json", __dirname + "/../db/times.json", (e) => {
            if (e) {
              console.log(e);
            }
          });
          if (debug) {
            console.log(cDebug(" DEBUG ") + " Updated times.json");
          }
        }
      });
    }
  });
}
exports.serverIsNew = (server) => {
  if (Times.hasOwnProperty(server.id)) {
    return false;
  }
  return true;
};
exports.addServer = (server) => {
  if (!server) {
    return;
  }
  if (!ServerSettings.hasOwnProperty(server.id)) {
    ServerSettings[server.id] = {
      "ignore": [],
      "banAlerts": false,
      "nameChanges": false,
      "welcome": "none",
      "deleteCommands": false,
      "commandCooldowns": true,
      "notifyChannel": "general"
    };
    updatedS = true;
  }
};
exports.changeSetting = (key, value, serverId) => {
  if (!key || value == undefined || value == null || !serverId) {
    return;
  }
  switch (key) {
    case "banAlerts":
      ServerSettings[serverId].banAlerts = value;
      break;
    case "nameChanges":
      ServerSettings[serverId].nameChanges = value;
      break;
    case "deleteCommands":
      ServerSettings[serverId].deleteCommands = value;
      break;
    case "commandCooldowns":
      ServerSettings[serverId].commandCooldowns = value;
      break;
    case "notifyChannel":
      ServerSettings[serverId].notifyChannel = value;
      break;
    case "welcome":
      ServerSettings[serverId].welcome = value;
      break;
  }
  updatedS = true;
};
exports.ignoreChannel = (channelId, serverId) => {
  if (!channelId || !serverId) {
    return;
  }
  if (ServerSettings[serverId].ignore.indexOf(channelId) == -1) {
    ServerSettings[serverId].ignore.push(channelId);
    updatedS = true;
  }
};
exports.unignoreChannel = (channelId, serverId) => {
  if (!channelId || !serverId) {
    return;
  }
  if (ServerSettings[serverId].ignore.indexOf(channelId) > -1) {
    ServerSettings[serverId].ignore.splice(ServerSettings[serverId].ignore.indexOf(channelId), 1);
    updatedS = true;
  }
};
exports.checkServers = (bot) => {
  inactive = [];
  var now = Date.now();
  Object.keys(Times).map((id) => {
    if (!bot.servers.find(s => s.id == id)) {
      delete Times[id];
    }
  });
  bot.servers.map((server) => {
    if (server == undefined) {
      return;
    }
    if (!Times.hasOwnProperty(server.id)) {
      console.log(cGreen("Joined server: ") + server.name);
      if (config.banned_server_ids && config.banned_server_ids.indexOf(server.id) > -1) {
        console.log(cRed("Joined server but it was on the ban list") + ": " + server.name);
        bot.sendMessage(server.defaultChannel, "This server is on the ban list");
        setTimeout(() => {
          bot.leaveServer(server);
        }, 1000);
      } else {
        if (config.whitelist.indexOf(server.id) == -1) {
          var toSend = [];
          toSend.push(":wave: Hi! I'm **" + bot.user.username.replace(/@/g, "@\u200b") + "**");
          toSend.push("You can use `" + config.command_prefix + "help` to see what I can do. Mods can use `" + config.mod_command_prefix + "help` for mod commands.");
          toSend.push("Mod/Admin commands *including bot settings* can be viewed with `" + config.mod_command_prefix + "help`");
          toSend.push("For help, feedback, bugs, info, changelogs, etc. go to **<https://discord.me/runecord>**");
          bot.sendMessage(server.defaultChannel, toSend);
        }
        Times[server.id] = now;
        addServer(server);
      }
    } else if (config.whitelist.indexOf(server.id) == -1 && now - Times[server.id] >= 604800000) {
      inactive.push(server.id);
      if (debug) {
        var days = ((now - Times[server.id]) / 1000 / 60 / 60 / 24).toFixed(1);
        console.log(cDebug(" DEBUG ") + " " + server.name + "(" + server.id + ")" + " hasn\"t used the bot for " + days + " days.");
      }
    }
  });
  updatedT = true;
  if (inactive.length > 0) {
    console.log("Can leave " + inactive.length + " servers that don't use the bot");
  }
  if (debug) {
    console.log(cDebug(" DEBUG ") + " Checked for inactive servers");
  }
};
exports.remInactive = (bot, msg, delay) => {
  if (!bot || !msg) {
    return;
  }
  if (inactive.length == 0) {
    bot.sendMessage(msg, "Nothing to leave :)");
    return;
  }
  var cnt = 0;
  var passedOver = 0;
  var toSend = "__Left servers for inactivity:__";
  var now1 = new Date();
  var remInterval = setInterval(() => {
    var server = bot.servers.get("id", inactive[passedOver]);
    if (server) {
      var days = ((now1 - Times[inactive[passedOver]]) / 1000 / 60 / 60 / 24).toFixed(1);
      toSend += "\n**" + (cnt + 1) + ":** " + server.name.replace(/@/g, "@\u200b") + " (" + days + " days)";
      server.leave();
      console.log(cUYellow("Left server") + " " + server.name);
      if (Times.hasOwnProperty(server.id)) {
        delete Times[server.id];
        updatedT = true;
        if (debug) {
          console.log(cDebug(" DEBUG ") + " Removed server from times.json");
        }
      }
      cnt++;
    }
    delete Times[inactive[passedOver]];
    passedOver++;
    if (cnt >= 10 || passedOver >= inactive.length) {
      for (var i = 0; i < passedOver; i++) {
        inactive.shift();
      }
      if (cnt == 0) {
        bot.sendMessage(msg, "Nothing to leave :)");
      } else {
        bot.sendMessage(msg, toSend);
      }
      clearInterval(remInterval);
      updatedT = true;
      return;
    }
  }, delay || 10000);
};
exports.handleLeave = (server) => {
  if (!server || !server.id) {
    return;
  }
  if (Times.hasOwnProperty(server.id)) {
    delete Times[server.id];
    updatedT = true;
    if (debug) {
      console.log(cDebug(" DEBUG ") + " Removed server from times.json");
    }
  }
};
exports.addServerToTimes = (server) => {
  if (!server || !server.id) {
    return;
  }
  if (!Times.hasOwnProperty(server.id)) {
    Times[server.id] = Date.now();
    updatedT = true;
  }
};

function addServer(server) {
  if (!server) {
    return;
  }
  if (!ServerSettings.hasOwnProperty(server.id)) {
    ServerSettings[server.id] = {
      "ignore": [],
      "banAlerts": false,
      "nameChanges": false,
      "welcome": "none",
      "deleteCommands": false,
      "commandCooldowns": true,
      "notifyChannel": "general"
    };
    updatedS = true;
  }
}
exports.updateTimestamp = (server) => {
  if (!server || !server.id) {
    return;
  }
  if (Times.hasOwnProperty(server.id)) {
    Times[server.id] = Date.now();
    updatedT = true;
  }
  if (inactive.indexOf(server.id) >= 0) {
    inactive.splice(inactive.indexOf(server.id), 1);
  }
};
