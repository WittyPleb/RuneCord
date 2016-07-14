/**
 * Required Dependencies
 */
var os = require("os");
var moment = require("moment");
var version = require("../package.json").version;
/**
 * Required Files
 */
var config = require("./config.json");
var db = require("./db.js");
// Create confirmCodes array, this is used for creating confirmation codes for the announce command
var confirmCodes = [];
// Create the announceMessages array, this is used in the announce command
var announceMessages = [];

function correctUsage(cmd, usage, msg, bot) {
  bot.sendMessage(msg, msg.author.username.replace(/@/g, "@\u200b") + ", the correct usage is *`" + config.mod_command_prefix + cmd + " " + usage + "`*", function(erro, wMessage) {
    bot.deleteMessage(wMessage, {
      "wait": 10000
    });
  });
  bot.deleteMessage(msg, {
    "wait": 10000
  });
}
// Aliases for every command
// eg. "alias": "command"
var aliases = {
  "h": "help",
  "commands": "help",
  "s": "stats",
  "stat": "stats",
  "status": "stats",
  "config": "settings",
  "set": "settings"
};
var commands = {
  "help": {
    desc: "Sends a DM containing all of the commands. If a command is specified gives info on that command.",
    usage: "[command]",
    deleteCommand: true, // delete the command afterwards (eg ")help" will be deleted)
    shouldDisplay: false, // does it display in the `)help` command?
    process: (bot, msg, suffix) => {
      var toSend = [];
      if (!suffix) {
        toSend.push("Use `" + config.mod_command_prefix + "help <command name>` to get more info on a command.\n");
        toSend.push("Normal commands can be found using `" + config.command_prefix + "help`.\n");
        toSend.push("You can find the list online at **https://unlucky4ever.github.io/RuneCord/**\n");
        toSend.push("**Commands:**```\n");
        Object.keys(commands).forEach((cmd) => {
          if (commands[cmd].hasOwnProperty("shouldDisplay")) {
            if (commands[cmd].shouldDisplay) {
              toSend.push("\n" + config.mod_command_prefix + cmd + " " + commands[cmd].usage + "\n\t#" + commands[cmd].desc);
            }
          } else {
            toSend.push("\n" + config.mod_command_prefix + cmd + " " + commands[cmd].usage + "\n\t#" + commands[cmd].desc);
          }
        });
        toSend = toSend.join("");
        if (toSend.length >= 1990) {
          bot.sendMessage(msg.author, toSend.substr(0, 1990).substr(0, toSend.substr(0, 1990).lastIndexOf("\n\t")) + "```");
          setTimeout(function() {
            bot.sendMessage(msg.author, "```" + toSend.substr(toSend.substr(0, 1990).lastIndexOf("\n\t")) + "```");
          }, 1000);
        } else {
          bot.sendMessage(msg.author, toSend + "```");
        }
      } else {
        suffix = suffix.trim().toLowerCase();
        if (commands.hasOwnProperty(suffix)) {
          toSend.push("`" + config.mod_command_prefix + suffix + " " + commands[suffix].usage + "`");
          if (commands[suffix].hasOwnProperty("info")) {
            toSend.push(commands[suffix].info);
          } else if (commands[suffix].hasOwnProperty("desc")) {
            toSend.push(commands[suffix].desc);
          }
          if (commands[suffix].hasOwnProperty("cooldown")) {
            toSend.push("__Cooldown:__ " + commands[suffix].cooldown + " seconds");
          }
          if (commands[suffix].hasOwnProperty("deleteCommand")) {
            toSend.push("*Can delete the activating message*");
          }
          bot.sendMessage(msg, toSend);
        } else {
          bot.sendMessage(msg, "Command `" + suffix + "` not found. Aliases aren't allowed.", (erro, wMessage) => {
            bot.deleteMessage(wMessage, {
              "wait": 10000
            });
          });
        }
      }
    }
  },
  "remove-inactive": {
    desc: "Bot owner only.",
    usage: "",
    cooldown: 99999999,
    shouldDisplay: false, // does it display in the `)help` command?
    deleteCommand: true, // delete the command afterwards (eg ")remove-inactive" will be deleted)
    process: (bot, msg, suffix) => {
      if (suffix && /^\d+$/.test(suffix) && msg.author.id == process.env.ADMIN_ID) {
        db.remInactive(bot, msg, parseInt(suffix));
      } else if (msg.author.id == process.env.ADMIN_ID) {
        db.remInactive(bot, msg);
      }
    }
  },
  "announce": {
    desc: "Send a PM to all users in a server. Admin only",
    deleteCommand: false,
    usage: "<message>",
    cooldown: 1,
    process: (bot, msg, suffix) => {
      if (!suffix) {
        bot.sendMessage(msg, "You must specify a message to announce", (erro, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 8000
          });
        });
        return;
      }
      if (msg.channel.isPrivate && msg.author.id != process.env.ADMIN_ID) {
        bot.sendMessage(msg, "You can't do this outside of a server", (erro, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
          return;
        });
      }
      if (!msg.channel.isPrivate) {
        if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != process.env.ADMIN_ID) {
          bot.sendMessage(msg, "Server admins only", (erro, wMessage) => {
            bot.deleteMessage(wMessage, {
              "wait": 8000
            });
          });
          return;
        }
      }
      if (!msg.channel.isPrivate) {
        if (/^\d+$/.test(suffix)) {
          var index = confirmCodes.indexOf(parseInt(suffix));
          if (index == -1) {
            bot.sendMessage(msg, "Code not found", (erro, wMessage) => {
              bot.deleteMessage(wMessage, {
                "wait": 8000
              });
            });
            return;
          }
          bot.sendMessage(msg, "Announcing to all users, this may take a while...");
          var loopIndex = 0;

          function annLoopS() {
            if (loopIndex >= msg.channel.server.members.length) {
              clearInterval(annTimerS);
              return;
            }
            bot.sendMessage(msg.channel.server.members[loopIndex], "📢 " + announceMessages[index] + " - from " + msg.author + " on " + msg.channel.server.name);
            loopIndex++;
          }
          var annTimerS = setInterval(() => {
            annLoopS();
          }, 1100);
          delete confirmCodes[index];
          if (debug) {
            console.log(cDebug(" DEBUG ") + " Announced \"" + announceMessages[index] + "\" to members of " + msg.channel.server.name);
          }
        } else {
          announceMessages.push(suffix);
          var code = Math.floor(Math.random() * 100000);
          confirmCodes.push(code);
          bot.sendMessage(msg, ":warning: This will send a message to **all** users in this server. If you're sure you want to do this say `" + config.mod_command_prefix + "announce " + code + "`");
        }
      } else if (msg.channel.isPrivate && msg.author.id == process.env.ADMIN_ID) {
        if (/^\d+$/.test(suffix)) {
          var index = confirmCodes.indexOf(parseInt(suffix));
          if (index == -1) {
            bot.sendMessage(msg, "Code not found", (erro, wMessage) => {
              bot.deleteMessage(wMessage, {
                "wait": 8000
              });
            });
            return;
          }
          bot.sendMessage(msg, "Announcing to all servers, this may take a while...");
          var loopIndex = 0;

          function annLoop() {
            if (loopIndex >= bot.servers.length) {
              clearInterval(annTimer);
              return;
            }
            if (bot.servers[loopIndex].name.indexOf("Discord API") == -1 && bot.servers[loopIndex].name.indexOf("Discord Bots") == -1 && bot.servers[loopIndex].name.indexOf("Discord Developers") == -1) {
              bot.sendMessage(bot.servers[loopIndex].defaultChannel, ":loudspeaker: " + announceMessages[index] + " - " + msg.author.username);
              loopIndex++;
            }
          }
          var annTimer = setInterval(() => {
            annLoop();
          }, 1100);
          delete confirmCodes[index];
          if (debug) {
            console.log(cDebug(" DEBUG ") + " Announced \"" + announceMessages[index] + "\" to all servers");
          }
        } else {
          announceMessages.push(suffix);
          var code = Math.floor(Math.random() * 100000);
          confirmCodes.push(code);
          bot.sendMessage(msg, ":warning: This will send a message to **all** servers where I can speak in general. If you're sure you want to do this say `" + config.mod_command_prefix + "announce " + code + "`");
        }
      }
    }
  },
  "settings": {
    desc: "Per-server settings. Docs: https://unlucky4ever.github.io/RuneCord/",
    usage: "<enable/disable> <setting> | notify here | welcome <welcome message> | check",
    deleteCommand: false,
    cooldown: 3,
    process: (bot, msg, suffix) => {
      if (msg.channel.isPrivate) {
        bot.sendMessage(msg, "Can't do this in a PM!", (erro, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
        return;
      }
      if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != process.env.ADMIN_ID) {
        bot.sendMessage(msg, "You must have permission to manage the server!", (erro, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
        return;
      }
      if (!suffix || !/(.+ .+|check|help)/.test(suffix)) {
        correctUsage("settings", this.usage, msg, bot);
        return;
      }
      if (!ServerSettings.hasOwnProperty(msg.channel.server.id)) {
        db.addServer(msg.channel.server);
      }
      if (/enable ban ?alerts?/i.test(suffix.trim())) {
        if (!ServerSettings[msg.channel.server.id].banAlerts) {
          db.changeSetting("banAlerts", true, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Enabled ban alerts");
          return;
        }
        bot.sendMessage(msg, "Ban alerts are already enabled!");
      }
      if (/disable ban ?alerts?/i.test(suffix.trim())) {
        if (ServerSettings[msg.channel.server.id].banAlerts) {
          db.changeSetting("banAlerts", false, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Disabled ban alerts");
          return;
        }
        bot.sendMessage(msg, "Ban alerts are already disabled!");
      }
      if (/enable name ?changes?/i.test(suffix.trim())) {
        if (!ServerSettings[msg.channel.server.id].nameChanges) {
          db.changeSetting("nameChanges", true, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Enabled name change alerts");
          return;
        }
        bot.sendMessage(msg, "Name change alerts are already enabled!");
      }
      if (/disable name ?changes?/i.test(suffix.trim())) {
        if (ServerSettings[msg.channel.server.id].nameChanges) {
          db.changeSetting("nameChanges", false, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Disabled name change alerts");
          return;
        }
        bot.sendMessage(msg, "Name change alerts are already disabled!");
      }
      if (/enable delete ?commands?/i.test(suffix.trim())) {
        if (!ServerSettings[msg.channel.server.id].deleteCommands) {
          db.changeSetting("deleteCommands", true, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Enabled command deletion");
          return;
        }
        bot.sendMessage(msg, "Command deletion is already enabled!");
      }
      if (/disable delete ?commands?/i.test(suffix.trim())) {
        if (ServerSettings[msg.channel.server.id].deleteCommands) {
          db.changeSetting("deleteCommands", false, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Disabled command deletion");
          return;
        }
        bot.sendMessage(msg, "Command deletion is already disabled!");
      }
      if (/enable cooldowns/i.test(suffix.trim())) {
        if (!ServerSettings[msg.channel.server.id].commandCooldowns) {
          db.changeSetting("commandCooldowns", true, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Enabled command cooldowns");
          return;
        }
        bot.sendMessage(msg, "Command cooldowns are already enabled!");
      }
      if (/disable cooldowns/i.test(suffix.trim())) {
        if (ServerSettings[msg.channel.server.id].commandCooldowns) {
          db.changeSetting("commandCooldowns", false, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Disabled command cooldowns");
          return;
        }
        bot.sendMessage(msg, "Command cooldowns are already disabled!");
      }
      if (/notify? ?here/i.test(suffix.trim())) {
        if (msg.channel.id == msg.channel.server.defaultChannel.id) {
          db.changeSetting("notifyChannel", "general", msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Ok! I'll send notifications here now.");
        } else {
          db.changeSetting("notifyChannel", msg.channel.id, msg.channel.server.id);
          bot.sendMessage(msg, ":gear: Ok! I'll send notifications here now.");
        }
      }
      if (/^welcome( ?msg| ?message)? .+/i.test(suffix.trim())) {
        db.changeSetting("welcome", suffix.replace(/^welcome( ?msg| ?message)? /i, ""), msg.channel.server.id);
        bot.sendMessage(msg, ":gear: Welcome message set to: " + suffix.replace(/^welcome( ?msg| ?message)? /i, ""));
      }
      if (/disable welcome( ?msg| ?message)?/i.test(suffix.trim())) {
        db.changeSetting("welcome", "none", msg.channel.server.id);
        bot.sendMessage(msg, ":gear: Disabled welcome message");
      }
      if (suffix.trim().toLowerCase() == "check") {
        var toSend = [];
        toSend.push(":gear: **Current Settings** :gear:");
        toSend.push("**Ban Alert:** " + ServerSettings[msg.channel.server.id].banAlerts);
        toSend.push("**Name Changes:** " + ServerSettings[msg.channel.server.id].nameChanges);
        toSend.push("**Delete Commands:** " + ServerSettings[msg.channel.server.id].deleteCommands);
        toSend.push("**Command Cooldowns:** " + ServerSettings[msg.channel.server.id].commandCooldowns);
        toSend.push((ServerSettings[msg.channel.server.id].notifyChannel == "general") ? "**Notification Channel:** Default" : "**Notification Channel:** <#" + ServerSettings[msg.channel.server.id].notifyChannel + ">");
        toSend.push((ServerSettings[msg.channel.server.id].welcome.length < 1600) ? "**Welcome Message:** " + ServerSettings[msg.channel.server.id].welcome : ServerSettings[msg.channel.server.id].welcome.substr(0, 1600) + "...");
        toSend.push((ServerSettings[msg.channel.server.id].ignore.length > 0) ? "**Ignored Channels:** <#" + ServerSettings[msg.channel.server.id].ignore.join("> <#") + ">" : "**Ignored Channels:** none");
        bot.sendMessage(msg, toSend);
      }
      if (suffix.trim().toLowerCase() == "help") {
        bot.sendMessage(msg, "Docs can be found here: **https://unlucky4ever.github.io/RuneCord/**");
      }
    }
  },
  "stats": {
    desc: "Get the stats of the bot",
    usage: "",
    cooldown: 30, // 30 second cooldown
    deleteCommand: true, // delete the command afterwards (eg ")stats" will be deleted)
    process: (bot, msg) => {
      var memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
      var totalMem = Math.round(os.totalmem() / 1024 / 1024);
      var percentUsed = Math.round((memUsed / totalMem) * 100);
      var toSend = [];
      toSend.push("```xl");
      toSend.push("Uptime: " + moment().fromNow(Math.round(bot.uptime / 1000)) + ".");
      toSend.push("Connected to " + bot.servers.length + " servers with " + bot.channels.length + " channels and " + bot.users.length + " users.");
      toSend.push("Memory Usage: " + memUsed + " MB (" + percentUsed + "%)");
      toSend.push("Running RuneCord v" + version);
      toSend.push("Commands this session: " + commandsProcessed + " (avg " + (commandsProcessed / (bot.uptime / (1000 * 60))).toFixed(2) + "/min)");
      toSend.push("```");
      bot.sendMessage(msg, toSend);
    }
  },
  "changelog": {
    desc: "See recent changes to the bot",
    deleteCommand: true, // delete the command afterwards (eg ")changelog" will be deleted)
    usage: "",
    cooldown: 30, // 30 second cooldown
    process: (bot, msg) => {
      var changelogChannel = bot.channels.get("id", "176439631108243457");
      if (!changelogChannel) {
        bot.sendMessage(msg, "The bot is not in the RuneCord Official Server", (err, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 8000
          });
        });
      } else {
        bot.getChannelLogs(changelogChannel, 2, (err, messages) => {
          if (err) {
            bot.sendMessage(msg, "Error getting changelogs: " + err);
            return;
          }
          var toSend = [];
          toSend.push("*Changelogs:*");
          toSend.push("━━━━━━━━━━━━━━━━━━━");
          toSend.push(messages[0]);
          toSend.push("━━━━━━━━━━━━━━━━━━━");
          toSend.push(messages[1]);
          bot.sendMessage(msg, toSend);
        });
      }
    }
  },
  "ignore": {
    desc: "Have the bot ignore that channel",
    usage: "",
    cooldown: 3, // 3 seconds cooldown
    deleteCommand: true, // delete the command afterwards (eg ")ignore" will be deleted)
    process: (bot, msg) => {
      if (msg.channel.isPrivate) {
        bot.sendMessage(msg, "Can't do this in a PM!", (err, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
        return;
      }
      if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != process.env.ADMIN_ID) {
        bot.sendMessage(msg, "You must have permission to manage the server!", (err, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
        return;
      }
      if (!ServerSettings.hasOwnProperty(msg.channel.server.id)) {
        db.addServer(msg.channel.server);
      }
      if (ServerSettings[msg.channel.server.id].ignore.indexOf(msg.channel.id) > -1) {
        bot.sendMessage(msg, "This channel is already ignored", (err, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
      } else {
        db.ignoreChannel(msg.channel.id, msg.channel.server.id);
        bot.sendMessage(msg, ":mute:  Ok, I'll ignore normal commands here now.");
      }
    }
  },
  "unignore": {
    desc: "Have the bot stop ignoring the channel",
    usage: "",
    cooldown: 3, // 3 second cooldown
    deleteCommand: true, // delete the command afterwards (eg ")unignore" will be deleted)
    process: (bot, msg) => {
      if (msg.channel.isPrivate) {
        bot.sendMessage(msg, "Can't do this in a PM!", (err, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
        return;
      }
      if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != process.env.ADMIN_ID) {
        bot.sendMessage(msg, "You must have permission to manage the server!", (err, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
        return;
      }
      if (!ServerSettings.hasOwnProperty(msg.channel.server.id)) {
        db.addServer(msg.channel.server);
      }
      if (ServerSettings[msg.channel.server.id].ignore.indexOf(msg.channel.id) == -1) {
        bot.sendMessage(msg, "This channel isn't ignored", (err, wMessage) => {
          bot.deleteMessage(wMessage, {
            "wait": 10000
          });
        });
      } else {
        db.unignoreChannel(msg.channel.id, msg.channel.server.id);
        bot.sendMessage(msg, ":loud_sound:  Ok, I'll stop ignoring this channel.");
      }
    }
  },
  "serverinfo": {
    desc: "Get the server's information",
    usage: "",
    cooldown: 30, // 30 second cooldown
    deleteCommand: true, // delete the command afterwards (eg ")serverinfo" will be deleted)
    process: (bot, msg) => {
      var voiceCount = 0;
      var textCount = 0;
      var toSend = [];
      var roleNames = [];
      var roles = msg.channel.server.roles;
      var channels = msg.channel.server.channels;

      for (var x = 0; x < channels.length; x++) {
        if (channels[x].type === 'voice') {
          voiceCount++;
        }
        if (channels[x].type === 'text') {
          textCount++;
        }
      }

      roles.remove('@everyone');

      for (var y = 0; y < roles.length; y++) {
        roleNames.push(roles[y].name);
      }

      toSend.push("```xl");
      toSend.push("Server: " + msg.channel.server.name);
      toSend.push("ID: " + msg.channel.server.id);
      toSend.push("Region: " + msg.channel.server.region);
      toSend.push("Members: " + msg.channel.server.members.length);
      toSend.push("Chats: " + textCount + " Text / " + voiceCount + " Voice");
      toSend.push("Owner: " + msg.channel.server.owner.username + "#" + msg.channel.server.owner.discriminator);
      toSend.push("Created: " + moment(msg.channel.server.createdAt).fromNow() + " (" + moment(msg.channel.server.createdAt).format("ddd, MMM Do YYYY, h:mm:ss A") + ")");
      toSend.push("Icon: " + msg.channel.server.iconURL);
      toSend.push("Roles: " + roleNames.join(", "));
      toSend.push("```");
      bot.sendMessage(msg, toSend);
    }
  },
  "userinfo": {
    desc: "Get all information about your account",
    usage: "@mention",
    cooldown: 30, // 30 second cooldown
    deleteCommand: true, // delete the command afterwards (eg ")userinfo" will be deleted)
    process: (bot, msg, suffix) => {
      if (!suffix) {
        var toSend = [];
        toSend.push("```xl");
        toSend.push("Username: " + msg.author.username + "#" + msg.author.discriminator);
        toSend.push("User ID: " + msg.author.id);
        toSend.push("Status: " + msg.author.status);
        if (msg.author.game) {
          toSend.push("Game: " + msg.author.game.name);
        }
        toSend.push("Created: " + moment(msg.author.createdAt).fromNow() + " (" + msg.author.createdAt + ")");
        toSend.push("Avatar ID: " + msg.author.avatar);
        toSend.push("```");
        bot.sendMessage(msg, toSend);
      }
      if (suffix) {
        if (msg.mentions.length === 1) {
          toSend = [];
          toSend.push("```xl");
          toSend.push("Username: " + msg.mentions[0].username + "#" + msg.mentions[0].discriminator);
          toSend.push("ID: " + msg.mentions[0].id);
          toSend.push("Status: " + msg.mentions[0].status);
          if (msg.mentions[0].game) {
            toSend.push("Game: " + msg.mentions[0].game.name);
          }
          toSend.push("Created: " + moment(msg.mentions[0].createdAt).fromNow() + " (" + msg.mentions[0].createdAt + ")");
          toSend.push("Avatar: " + msg.mentions[0].avatarURL);
          toSend.push("```");
          bot.sendMessage(msg, toSend);
        } else if (msg.mentions.length === 0) {
          bot.sendMessage(msg, "You must mention a user if you're going to use a suffix!", (erro, wMessage) => {
            bot.deleteMessage(wMessage, {
              "wait": 5000
            });
          });
        } else {
          bot.sendMessage(msg, "Only one mention at a time please!", (erro, wMessage) => {
            bot.deleteMessage(wMessage, {
              "wait": 5000
            });
          });
        }
      }
    }
  }
};
exports.commands = commands;
exports.aliases = aliases;
