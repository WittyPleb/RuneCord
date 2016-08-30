/**
 * Module Dependencies
 */
require("dotenv").config();
var discord = require("discord.js");
var request = require("request");
var chalk = require("chalk");
var fs = require("fs");
checkDb();
/**
 * Required Files
 */
var commands = require("./bot/commands.js");
var mod = require("./bot/mod.js");
var config = require("./bot/config.json");
var versionCheck = require("./bot/versioncheck.js");
var logger = require('./bot/logger.js');
var db = require("./bot/db.js");
checkConfig();

var lastExecTime = {};
var pmCoolDown = {};

setInterval(() => {
  lastExecTime = {};
  pmCoolDown = {};
}, 3600000);

commandsProcessed = 0;
show_warn = config.show_warn;
debug = config.debug;

var bot = new discord.Client({
  maxCachedMessages: 10,
  forceFetchUsers: true
});

function connect() {
  if (!process.env.TOKEN || !process.env.APP_ID) {
    console.log(cRed('Please setup TOKEN and APP_ID in .env to use RuneCord!'));
    process.exit(1);
  }

  bot.loginWithToken(process.env.TOKEN);
}

function carbon() {
  if (process.env.CARBON_KEY) {
    request({
      url: 'https://www.carbonitex.net/discord/data/botdata.php',
      headers: {'content-type': 'application/json'},
      json: {
        key: process.env.CARBON_KEY,
        servercount: bot.servers.length
      }
    }).catch(console.log);
  }
}

setInterval(carbon, 360000);

bot.on("error", (m) => {
  logger.error(m);
});

bot.on("warn", (m) => {
  if (show_warn) {
    logger.warn(m);
  }
});

bot.on("debug", (m) => {
  if (debug) {
    logger.debug(m);
  }
});

bot.on("ready", () => {
  logger.info('RuneCord is ready! Listening to ' + bot.channels.length + ' channels on ' + bot.servers.length + ' servers.');
  versionCheck.checkForUpdate();
  setTimeout(() => {
    db.checkServers(bot);
  }, 10000);
});

bot.on("disconnected", () => {
  console.log(cRed("Disconnected") + " from Discord");
  commandsProcessed = 0;
  lastExecTime = {};
  setTimeout(connect, 2000);
});

bot.on("message", (msg) => {
  if (msg.author.id == bot.user.id) {
    return;
  }
  if (msg.channel.isPrivate) {
    if (/(^https?:\/\/discord\.gg\/[A-Za-z0-9]+$|^https?:\/\/discordapp\.com\/invite\/[A-Za-z0-9]+$)/.test(msg.content)) {
      bot.sendMessage(msg.author, "Use this to bring me to your server: <https://discordapp.com/oauth2/authorize?&client_id=" + process.env.APP_ID + "&scope=bot&permissions=12659727>");
    } else if (msg.content[0] !== config.command_prefix && msg.content[0] !== config.mod_command_prefix && !msg.content.startsWith("(eval) ")) {
      if (pmCoolDown.hasOwnProperty(msg.author.id)) {
        if (Date.now() - pmCoolDown[msg.author.id] > 3000) {
          if (/^(help|how do I use this\??)$/i.test(msg.content)) {
            commands.commands.help.process(bot, msg);
            return;
          }
          pmCoolDown[msg.author.id] = Date.now();
          return;
        }
      } else {
        pmCoolDown[msg.author.id] = Date.now();
        if (/^(help|how do I use this\??)$/i.test(msg.content)) {
          commands.commands.help.process(bot, msg);
          return;
        }
        return;
      }
    }
  }
  if (msg.content.startsWith("(eval) ")) {
    if (msg.author.id == process.env.ADMIN_ID) {
      evaluateString(msg);
      return;
    } else {
      bot.sendMessage(msg, "```diff\n- You do not have permission to use that command!```");
      return;
    }
  }
  if (!msg.content.startsWith(config.command_prefix) && !msg.content.startsWith(config.mod_command_prefix) && !msg.content.startsWith(bot.user.mention())) {
    return;
  }
  if (msg.content.indexOf(" ") == 1 && msg.content.length > 2) {
    msg.content = msg.content.replace(" ", "");
  }
  if (!msg.channel.isPrivate && !msg.content.startsWith(config.mod_command_prefix) && ServerSettings.hasOwnProperty(msg.channel.server.id)) {
    if (ServerSettings[msg.channel.server.id].ignore.indexOf(msg.channel.id) > -1) {
      return;
    }
  }
  var cmd = msg.content.split(" ")[0].replace(/\n/g, " ").substring(1).toLowerCase();
  var suffix = msg.content.replace(/\n/g, " ").substring(cmd.length + 2).trim();
  if (msg.content.startsWith(config.command_prefix)) {
    if (commands.commands.hasOwnProperty(cmd)) {
      execCommand(msg, cmd, suffix, "normal");
    } else if (commands.aliases.hasOwnProperty(cmd)) {
      if (!msg.channel.isPrivate) {
        db.updateTimestamp(msg.channel.server);
      }
      msg.content = msg.content.replace(/[^ ]+ /, config.command_prefix + commands.aliases[cmd] + " ");
      execCommand(msg, commands.aliases[cmd], suffix, "normal");
    }
  } else if (msg.content.startsWith(bot.user.mention())) {
    var cmdMention = msg.content.split(" ")[1].replace(/\n/g, " ").substring(0).toLowerCase();
    var mentionSuffix = msg.content.replace(/\n/g, " ").substring(cmdMention.length + 23).trim();
    if (commands.commands.hasOwnProperty(cmdMention)) {
      execCommand(msg, cmdMention, mentionSuffix, "normal");
    } else if (commands.aliases.hasOwnProperty(cmdMention)) {
      if (!msg.channel.isPrivate) {
        db.updateTimestamp(msg.channel.server);
      }
      msg.content = msg.content.replace(/[^ ]+ /, config.command_prefix + commands.aliases[cmdMention] + " ");
      execCommand(msg, commands.aliases[cmdMention], mentionSuffix, "normal");
    }
    if (cmdMention == "reload" && msg.author.id == process.env.ADMIN_ID) {
      reload();
      bot.sendMessage(msg, "```diff\n+ Bot successfully reloaded!```");
      return;
    }
  } else if (msg.content.startsWith(config.mod_command_prefix)) {
    if (cmd == "reload" && msg.author.id == process.env.ADMIN_ID) {
      reload();
      bot.sendMessage(msg, "```diff\n+ Bot successfully reloaded!```");
      return;
    }
    if (mod.commands.hasOwnProperty(cmd)) {
      execCommand(msg, cmd, suffix, "mod");
    } else if (mod.aliases.hasOwnProperty(cmd)) {
      if (!msg.channel.isPrivate) {
        db.updateTimestamp(msg.channel.server);
        msg.content = msg.content.replace(/[^ ]+ /, config.mod_command_prefix + mod.aliases[cmd] + " ");
        execCommand(msg, mod.aliases[cmd], suffix, "mod");
      }
    }
  }
});

function execCommand(msg, cmd, suffix, type) {
  try {
    commandsProcessed += 1;
    if (type == "normal") {
      logger.cmd(cmd, suffix);
      if (msg.author.id != process.env.ADMIN_ID && commands.commands[cmd].hasOwnProperty("cooldown") && ServerSettings.hasOwnProperty(msg.channel.server.id) && ServerSettings[msg.channel.server.id].commandCooldowns === false) {
        if (!lastExecTime.hasOwnProperty(cmd)) {
          lastExecTime[cmd] = {};
        }
        if (!lastExecTime[cmd].hasOwnProperty(msg.author.id)) {
          lastExecTime[cmd][msg.author.id] = new Date().valueOf();
        } else {
          var now = Date.now();
          if (now < lastExecTime[cmd][msg.author.id] + (commands.commands[cmd].cooldown * 1000)) {
            bot.sendMessage(msg, msg.author.username.replace(/@/g, "@\u200b") + ", you need to *cooldown* (" + Math.round(((lastExecTime[cmd][msg.author.id] + commands.commands[cmd].cooldown * 1000) - now) / 1000) + " seconds)", (e, m) => {
              bot.deleteMessage(m, {
                "wait": 6000
              });
            });
            if (!msg.channel.isPrivate) {
              bot.deleteMessage(msg, {
                "wait": 10000
              });
              return;
            }
            lastExecTime[cmd][msg.author.id] = now;
          }
        }
      }
      commands.commands[cmd].process(bot, msg, suffix);
      if (!msg.channel.isPrivate && commands.commands[cmd].hasOwnProperty("deleteCommand")) {
        if (commands.commands[cmd].deleteCommand === true && ServerSettings.hasOwnProperty(msg.channel.server.id) && ServerSettings[msg.channel.server.id].deleteCommands === true) {
          bot.deleteMessage(msg, {
            "wait": 10000
          });
        }
      }
    } else if (type == "mod") {
      logger.modCmd(cmd, suffix);
      if (msg.author.id != process.env.ADMIN_ID && mod.commands[cmd].hasOwnProperty("cooldown") && ServerSettings.hasOwnProperty(msg.channel.server.id) && ServerSettings[msg.channel.server.id].commandCooldowns === false) {
        if (!lastExecTime.hasOwnProperty(cmd)) {
          lastExecTime[cmd] = {};
        }
        if (!lastExecTime[cmd].hasOwnProperty(msg.author.id)) {
          lastExecTime[cmd][msg.author.id] = new Date().valueOf();
        } else {
          var now = Date.now();
          if (now < lastExecTime[cmd][msg.author.id] + (mod.commands[cmd].cooldown * 1000)) {
            bot.sendMessage(msg, msg.author.username.replace(/@/g, "@\u200b") + ", you need to *cooldown* (" + Math.round(((lastExecTime[cmd][msg.author.id] + mod.commands[cmd].cooldown * 1000) - now) / 1000) + " seconds)", (e, m) => {
              bot.deleteMessage(m, {
                "wait": 6000
              });
            });
            if (!msg.channel.isPrivate) {
              bot.deleteMessage(msg, {
                "wait": 10000
              });
              return;
            }
            lastExecTime[cmd][msg.author.id] = now;
          }
        }
      }
      mod.commands[cmd].process(bot, msg, suffix);
      if (!msg.channel.isPrivate && mod.commands[cmd].hasOwnProperty("deleteCommand")) {
        if (mod.commands[cmd].deleteCommand === true && ServerSettings.hasOwnProperty(msg.channel.server.id) && ServerSettings[msg.channel.server.id].deleteCommands === true) {
          bot.deleteMessage(msg, {
            "wait": 10000
          });
        }
      }
    } else {
      return;
    }
  } catch (err) {
    logger.error(err.stack);
  }
}
bot.on("serverNewMember", (objServer, objUser) => {
  if (config.non_essential_event_listeners && ServerSettings.hasOwnProperty(objServer.id) && ServerSettings[objServer.id].welcome != "none") {
    if (!objUser.username || !ServerSettings[objServer.id].welcome || !objServer.name) {
      return;
    }
    if (debug) {
      logger.debug('New member on ' + objServer.name + ': ' + objUser.username);
    }
    bot.sendMessage(objServer.defaultChannel, ServerSettings[objServer.id].welcome.replace(/\$USER\$/gi, objUser.username.replace(/@/g, "@\u200b")).replace(/\$SERVER\$/gi, objServer.name.replace(/@/g, "@\u200b")));
  }
});
bot.on("channelDeleted", (channel) => {
  if (channel.isPrivate) {
    return;
  }
  if (ServerSettings.hasOwnProperty(channel.server.id)) {
    if (ServerSettings[channel.server.id].ignore.indexOf(channel.id) > -1) {
      db.unignoreChannel(channel.id, channel.server.id);
      if (debug) {
        logger.debug('Ignored channel was deleted and removed from the DB');
      }
    }
  }
});
bot.on("userBanned", (objUser, objServer) => {
  if (config.non_essential_event_listeners && ServerSettings.hasOwnProperty(objServer.id) && ServerSettings[objServer.id].banAlerts === true) {
    logger.info(objUser.username + chalk.red(' banned on ') + objServer.name);
    if (ServerSettings[objServer.id].notifyChannel != "general") {
      bot.sendMessage(ServerSettings[objServer.id].notifyChannel, ":warning: " + objUser.username.replace(/@/g, "@\u200b") + " was banned");
    } else {
      bot.sendMessage(objServer.defaultChannel, ":banana::hammer: " + objUser.username.replace(/@/g, "@\u200b") + " was banned");
    }
    bot.sendMessage(objUser, ":banana::hammer: You were banned from " + objServer.name);
  }
});
bot.on("userUnbanned", (objUser, objServer) => {
  if (objServer.members.length <= 500 && config.non_essential_event_listeners) {
    logger.info(objUser.username + ' unbanned on ' + objServer.name);
  }
});
bot.on("serverDeleted", (objServer) => {
  logger.info(chalk.bold.yellow('Left server: ') + objServer.name);
  db.handleLeave(objServer);
});
bot.on("serverCreated", (server) => {
  if (db.serverIsNew(server)) {
    logger.info(chalk.bold.green('Joined server: ') + server.name);
    if (config.banned_server_ids && config.banned_server_ids.indexOf(server.id) > -1) {
      logger.error('Joined server but it was on the ban list: ' + server.name);
      bot.sendMessage(server.defaultChannel, "This server is on the ban list");
      setTimeout(() => {
        bot.leaveServer(server);
      }, 1000);
    } else {
      var toSend = [];
      toSend.push(":wave: Hi! I'm **" + bot.user.username.replace(/@/g, "@\u200b") + "**");
      toSend.push("You can use **`" + config.command_prefix + "help`** to see what I can do.");
      toSend.push("Mod/Admin commands *including bot settings* can be viewed with **`" + config.mod_command_prefix + "help`**");
      toSend.push("For help, feedback. bugs, info, changelogs, etc. go to **<https://discord.me/runecord>**");
      bot.sendMessage(server.defaultChannel, toSend);
      db.addServer(server);
      db.addServerToTimes(server);
    }
  }
});

function evaluateString(msg) {
  if (msg.author.id != process.env.ADMIN_ID) {
    logger.warn('Somehow an unauthorized user got into eval!');
    return;
  }
  var timeTaken = new Date();
  var result;
  logger.info('Running eval...');
  try {
    result = eval(msg.content.substring(7).replace(/\n/g, ""));
  } catch (e) {
    logger.error(e);
    var toSend = [];
    toSend.push(":x: Error evaluating");
    toSend.push("```diff");
    toSend.push("- " + e);
    toSend.push("```");
    bot.sendMessage(msg, toSend);
  }
  if (result) {
    var toSend = [];
    toSend.push(":white_check_mark: Evaluated successfully:");
    toSend.push("```");
    toSend.push(result);
    toSend.push("```");
    toSend.push("Time taken: " + (timeTaken - msg.timestamp) + " ms");
    bot.sendMessage(msg, toSend);
    logger.info('Result: ' + result);
  }
}

function reload() {
  delete require.cache[require.resolve(__dirname + "/bot/config.json")];
  delete require.cache[require.resolve(__dirname + "/bot/commands.js")];
  delete require.cache[require.resolve(__dirname + "/bot/mod.js")];
  delete require.cache[require.resolve(__dirname + "/bot/versioncheck.js")];
  delete require.cache[require.resolve(__dirname + "/bot/db.js")];
  config = require(__dirname + "/bot/config.json");
  versionCheck = require(__dirname + "/bot/versioncheck.js");
  db = require(__dirname + "/bot/db.js");
  try {
    commands = require(__dirname + "/bot/commands.js");
  } catch (err) {
    logger.error('Problem loading commands.js: ' + err);
  }
  try {
    mod = require(__dirname + "/bot/mod.js");
  } catch (err) {
    logger.error('Problem loading mod.js: ' + err);
  }
  logger.info(chalk.bgGreen.black('Modules Successfully Reloaded!'));
}

function checkConfig() {
  if (!config.command_prefix || config.command_prefix.length !== 1) {
    logger.warn('Prefix either not defined or more than one character.');
  }
  if (!config.mod_command_prefix || config.mod_command_prefix.length !== 1) {
    logger.warn('Mod prefix either not defined or more than one character.');
  }
}

function checkDb() {
  try {
    fs.statSync("./db/");
  } catch (e) {
    logger.warn('\'db\' folder doesn\'t exist... Creating!');
    fs.mkdirSync("./db/");
  }
  try {
    fs.statSync("./db/servers.json");
  } catch (e) {
    logger.warn('\'db/servers.json\' doesn\'t exist... Creating!');
    fs.writeFileSync("./db/servers.json", "{}");
  }
  try {
    fs.statSync("./db/times.json");
  } catch (e) {
    logger.warn('\'db/times.json\' doesn\'t exist... Creating!');
    fs.writeFileSync("./db/times.json", "{}");
  }
}

connect();
