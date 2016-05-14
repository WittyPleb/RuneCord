var config = require("./config.json");
var version = require("../package.json").version;
var db = require("./db.js");
var os = require("os");

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

function unMute(bot, msg, users, time, role) {
    setTimeout(function() {
        users.map(function(user) {
            if (msg.channel.server.members.get("name", user.username) && msg.channel.server.roles.get("name", role.name) && bot.memberHasRole(user, role)) {
                bot.removeMemberFromRole(user, role);
            }
        });
    }, time * 60000);
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
        process: function(bot, msg, suffix) {
            var toSend = [];
            if (!suffix) {
                toSend.push("Use `" + config.mod_command_prefix + "help <command name>` to get more info on a command.\n");
                toSend.push("Normal commands can be found using `" + config.command_prefix + "help`.\n");
                toSend.push("You can find the list online at **https://unlucky4ever.github.io/RuneCord/**\n");
                toSend.push("**Commands:**```\n");
                Object.keys(commands).forEach(function(cmd) {
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
                    bot.sendMessage(msg, "Command `" + suffix + "` not found. Aliases aren't allowed.", function(erro, wMessage) {
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
        process: function(bot, msg, suffix) {
            if (suffix && /^\d+$/.test(suffix) && msg.author.id == config.admin_id) {
                db.remInactive(bot, msg, parseInt(suffix));
            } else if (msg.author.id == config.admin_id) {
                db.remInactive(bot, msg);
            }
        }
    },
    "announce": {
        desc: "Send a PM to all users in a server. Admin only",
        deleteCommand: false,
        usage: "<message>",
        cooldown: 1,
        process: function(bot, msg, suffix) {
            if (!suffix) {
                bot.sendMessage(msg, "You must specify a message to announce", function(erro, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 8000
                    });
                });
                return;
            }
            if (msg.channel.isPrivate && msg.author.id != config.admin_id) {
                bot.sendMessage(msg, "You can't do this outside of a server", function(erro, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                    return;
                });
            }
            if (!msg.channel.isPrivate) {
                if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != config.admin_id) {
                    bot.sendMessage(msg, "Server admins only", function(erro, wMessage) {
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
                        bot.sendMessage(msg, "Code not found", function(erro, wMessage) {
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
                    var annTimerS = setInterval(function() {
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
            } else if (msg.channel.isPrivate && msg.author.id == config.admin_id) {
                if (/^\d+$/.test(suffix)) {
                    var index = confirmCodes.indexOf(parseInt(suffix));
                    if (index == -1) {
                        bot.sendMessage(msg, "Code not found", function(erro, wMessage) {
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
                            bot.sendMessage(bot.servers[loopIndex].defaultChannel, "📢 " + announceMessages[index] + " - " + msg.author.username);
                            loopIndex++;
                        }
                    }
                    var annTimer = setInterval(function() {
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
        desc: "Per-server settings. Docs: **https://unlucky4ever.github.io/RuneCord/**",
        usage: "<enable/disable> <setting> | notify here | welcome <welcome message> | check",
        deleteCommand: false,
        cooldown: 3,
        process: function(bot, msg, suffix) {
            if (msg.channel.isPrivate) {
                bot.sendMessage(msg, "Can't do this in a PM!", function(erro, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
                return;
            }

            if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != config.admin_id) {
                bot.sendMessage(msg, "You must have permission to manage the server!", function(erro, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
                return;
            }

            if (!suffix || !/(.+ .+|check)/.test(suffix)) {
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
                }
                bot.sendMessage(msg, "Ban alerts are already enabled!");
            }
            if (/disable ban ?alerts?/i.test(suffix.trim())) {
                if (ServerSettings[msg.channel.server.id].banAlerts) {
                    db.changeSetting("banAlerts", false, msg.channel.server.id);
                    bot.sendMessage(msg, ":gear: Disabled ban alerts");
                }
                bot.sendMessage(msg, "Ban alerts are already disabled!");
            }
            if (/enable name ?changes?/i.test(suffix.trim())) {
                if (!ServerSettings[msg.channel.server.id].nameChanges) {
                    db.changeSetting("nameChanges", true, msg.channel.server.id);
                    bot.sendMessage(msg, ":gear: Enabled name change alerts");
                }
                bot.sendMessage(msg, "Name change alerts are already enabled!");
            }
            if (/disable name ?changes?/i.test(suffix.trim())) {
                if (ServerSettings[msg.channel.server.id].nameChanges) {
                    db.changeSetting("nameChanges", false, msg.channel.server.id);
                    bot.sendMessage(msg, ":gear: Disabled name change alerts");
                }
                bot.sendMessage(msg, "Name change alerts are already disabled!");
            }
            if (/enable delete ?commands?/i.test(suffix.trim())) {
                if (!ServerSettings[msg.channel.server.id].deleteCommands) {
                    db.changeSetting("deleteCommands", true, msg.channel.server.id);
                    bot.sendMessage(msg, ":gear: Enabled command deletion");
                }
                bot.sendMessage(msg, "Command deletion is already enabled!");
            }
            if (/disable delete ?commands?/i.test(suffix.trim())) {
                if (ServerSettings[msg.channel.server.id].deleteCommands) {
                    db.changeSetting("deleteCommands", false, msg.channel.server.id);
                    bot.sendMessage(msg, ":gear: Disabled command deletion");
                }
                bot.sendMessage(msg, "Command deletion is already disabled!");
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
                var toSend = ":gear: **Current Settings** :gear:\n**Ban Alerts:** " + ServerSettings[msg.channel.server.id].banAlerts + "\n**Name Changes:** " + ServerSettings[msg.channel.server.id].nameChanges + "\n**Delete Commands:** " + ServerSettings[msg.channel.server.id].deleteCommands + "\n**Notification Channel:** ";
                toSend += (ServerSettings[msg.channel.server.id].notifyChannel == "general") ? "Default" : "<#" + ServerSettings[msg.channel.server.id].notifyChannel + ">";
                toSend += (ServerSettings[msg.channel.server.id].welcome.length < 1600) ? "\n**Welcome Message:** " + ServerSettings[msg.channel.server.id].welcome : ServerSettings[msg.channel.server.id].welcome.substr(0, 1600) + "...";
                toSend += (ServerSettings[msg.channel.server.id].ignore.length > 0) ? "\n**Ignored Channels:** <#" + ServerSettings[msg.channel.server.id].ignore.join("> <#") + ">" : "\n**Ignored Channels:** none";
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
        process: function(bot, msg) {

            // Convert uptime to days
            var days = Math.round(bot.uptime / (1000 * 60 * 60 * 24));
            // Convert uptime to hours
            var hours = Math.round(bot.uptime / (1000 * 60 * 60)) % 24;
            // Convert uptime to minutes
            var minutes = Math.round(bot.uptime / (1000 * 60) % 60);

            // Initialize timestr so we can build it
            var timestr = "";

            // If days > 0 add the days to the timestr
            if (days > 0) {
                timestr += days + " day" + (days > 1 ? "s " : " ");
            }

            // If hours > 0 add the hours to the timestr
            if (hours > 0) {
                timestr += hours + " hour" + (hours > 1 ? "s " : " ");
            }

            // If hours are >= 1 add an and to the minutes so it shows "x hour(s) and y minute(s)"
            if (hours >= 1) {
                timestr += "and " + minutes + " minute" + (minutes > 0 && minutes < 2 ? "" : "s");
            } else { // Just show the minutes
                timestr += minutes + " minute" + (minutes > 0 && minutes < 2 ? "" : "s");
            }

            // Get the memory used for the current process, convert it from bytes to megabytes
            var memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);

            // Get the total memory in the system, convert it from bytes to megabytes
            var totalMem = Math.round(os.totalmem() / 1024 / 1024);

            // Calculate the total memory used, and convert it to a percentage
            var percentUsed = Math.round((memUsed / totalMem) * 100);

            // Create the toSend array to build it later
            var toSend = [];

            // Start building the toSend array
            toSend.push("```xl");
            toSend.push("Uptime: " + timestr + ".");
            toSend.push("Connected to " + bot.servers.length + " servers with " + bot.channels.length + " channels and " + bot.users.length + " users.");
            toSend.push("Memory Usage: " + memUsed + " MB (" + percentUsed + "%)");
            toSend.push("Running RuneCord v" + version);
            toSend.push("Commands this session: " + commandsProcessed + " (avg " + (commandsProcessed / (bot.uptime / (1000 * 60))).toFixed(2) + "/min)");
            toSend.push("```");

            // Send the array
            bot.sendMessage(msg, toSend);
        }
    },
    "changelog": {
        desc: "See recent changes to the bot",
        deleteCommand: true, // delete the command afterwards (eg ")changelog" will be deleted)
        usage: "",
        cooldown: 30, // 30 second cooldown
        process: function(bot, msg) {
            // Get the messages in the official changelog channel (on the official RuneCord server)
            var changelogChannel = bot.channels.get("id", "176439631108243457");

            // If it can"t find it, let the user know, then delete the message 8 seconds later
            if (!changelogChannel) {
                bot.sendMessage(msg, "The bot is not in the RuneCord Official Server", function(err, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 8000
                    });
                });
            } else { // It found the changelog channel
                bot.getChannelLogs(changelogChannel, 2, function(err, messages) {
                    if (err) { // Something went wrong while reading the messages, print the error out
                        bot.sendMessage(msg, "Error getting changelogs: " + err);
                        return;
                    }

                    // Create the toSend array with an initial value of "*Changeslogs:*"
                    var toSend = ["*Changelogs:*"];

                    // Build onto the toSend array
                    toSend.push("━━━━━━━━━━━━━━━━━━━");
                    toSend.push(messages[0]); // The latest message in the channel (aka latest version)
                    toSend.push("━━━━━━━━━━━━━━━━━━━");
                    toSend.push(messages[1]); // The previous message in the channel (aka the previous version)

                    // Send the array
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
        process: function(bot, msg) {

            // If someone tried to send this command to the bot in a private message, let them know, and delete the message 10 seconds later
            if (msg.channel.isPrivate) {
                bot.sendMessage(msg, "Can't do this in a PM!", function(err, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
                return;
            }

            // If the user does not have the "manageServer" permission, let them know, and delete the message 10 seconds later
            if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != config.admin_id) {
                bot.sendMessage(msg, "You must have permission to manage the server!", function(err, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
                return;
            }

            // If the server is not in the server database, add it
            if (!ServerSettings.hasOwnProperty(msg.channel.server.id)) {
                db.addServer(msg.channel.server);
            }

            // If the server channel is already ignored, let user know, and delete message 10 seconds later
            if (ServerSettings[msg.channel.server.id].ignore.indexOf(msg.channel.id) > -1) {
                bot.sendMessage(msg, "This channel is already ignored", function(err, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
            } else { // Add current channel to the ignore list
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
        process: function(bot, msg) {

            // If someone tried to send this command to the bot in a private message, let them know, and delete the message 10 seconds later
            if (msg.channel.isPrivate) {
                bot.sendMessage(msg, "Can't do this in a PM!", function(err, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
                return;
            }

            // If the user does not have the "manageServer" permission, let them know, and delete the message 10 seconds later
            if (!msg.channel.permissionsOf(msg.author).hasPermission("manageServer") && msg.author.id != config.admin_id) {
                bot.sendMessage(msg, "You must have permission to manage the server!", function(err, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
                return;
            }

            // If the server is not in the server database, add it
            if (!ServerSettings.hasOwnProperty(msg.channel.server.id)) {
                db.addServer(msg.channel.server);
            }

            // If the server channel isn"t ignored, let user know, and delete message 10 seconds later
            if (ServerSettings[msg.channel.server.id].ignore.indexOf(msg.channel.id) == -1) {
                bot.sendMessage(msg, "This channel isn't ignored", function(err, wMessage) {
                    bot.deleteMessage(wMessage, {
                        "wait": 10000
                    });
                });
            } else { // Remove current channel from the ignore list
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
        process: function(bot, msg) {

            // Create toSend array to build later
            var toSend = [];

            // Start building toSend array
            toSend.push("```xl");
            toSend.push("Server Name: " + msg.channel.server.name);
            toSend.push("Server Owner: " + msg.channel.server.owner.username);
            toSend.push("Server ID: " + msg.channel.server.id);
            toSend.push("User Count: " + msg.channel.server.members.length);
            toSend.push("Channel Count: " + msg.channel.server.channels.length);
            toSend.push("Default Channel: #" + msg.channel.server.defaultChannel.name);
            toSend.push("Region: " + msg.channel.server.region);
            toSend.push("Server Icon: " + msg.channel.server.iconURL);
            toSend.push("```");

            // Send toSend array
            bot.sendMessage(msg, toSend);
        }
    }
};

// Export commands variable for use in main file
exports.commands = commands;

// Export aliases variable for use in main file
exports.aliases = aliases;
