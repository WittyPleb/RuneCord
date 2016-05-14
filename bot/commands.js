var config = require("./config.json");
var version = require("../package.json").version;
var request = require("request");
var AsciiTable = require("ascii-table");
var numeral = require("numeral");

function correctUsage(cmd, usage, msg, bot, delay) {
    bot.sendMessage(msg, msg.author.username.replace(/@/g, "@\u200b") + ", the correct usage is *`" + config.command_prefix + cmd + " " + usage + "`*", function(erro, wMessage) {
        bot.deleteMessage(wMessage, {
            "wait": delay || 10000
        });
    });
    bot.deleteMessage(msg, {
        "wait": 10000
    });
}

var aliases = {
    "h": "help",
    "commands": "help",
    "myid": "id",
    "join": "invite",
    "gametime": "time",
    "hs": "stats",
    "rs3stats": "stats",
    "osrsstats": "osstats",
    "adventurelog": "alog",
    "advlog": "alog",
    "wbs": "warbands",
    "trollinvasion": "invasion",
    "xplamp": "lamp"
};

var commands = {
    "help": {
        desc: "Sends a DM containing all of the commands. If a command is specified, gives info on that command.",
        usage: "[command]",
        deleteCommand: true,
        shouldDisplay: false,
        cooldown: 1,
        process: function(bot, msg, suffix) {
            var toSend = [];

            if (!suffix) {
                toSend.push("Use `" + config.command_prefix + "help <command name>` to get more info on a command.\n");
                toSend.push("Mod commands can be found using `" + config.mod_command_prefix + "help`.\n");
                toSend.push("You can find the list online at **https://unlucky4ever.github.io/RuneCord/**\n");
                toSend.push("**Commands:**```gls1\n");
                Object.keys(commands).forEach(function(cmd) {
                    if (commands[cmd].hasOwnProperty("shouldDisplay")) {
                        if (commands[cmd].shouldDisplay) {
                            toSend.push("\n" + config.command_prefix + cmd + " " + commands[cmd].usage + "\n\t#" + commands[cmd].desc);
                        }
                    } else {
                        toSend.push("\n" + config.command_prefix + cmd + " " + commands[cmd].usage + "\n\t#" + commands[cmd].desc);
                    }
                });

                toSend = toSend.join("");

                if (toSend.length >= 1990) {
                    bot.sendMessage(msg.author, toSend.substr(0, 1990).substr(0, toSend.substr(0, 1990).lastIndexOf("\n\t")) + "```");
                    setTimeout(function() {
                        bot.sendMessage(msg.author, "```gls1" + toSend.substr(toSend.substr(0, 1990).lastIndexOf("\n\t")) + "```");
                    }, 1000);
                } else {
                    bot.sendMessage(msg, toSend + "```");
                }
            } else {
                suffix = suffix.trim().toLowerCase();
                if (commands.hasOwnProperty(suffix)) {
                    toSend.push("`" + config.command_prefix + suffix + " " + commands[suffix].usage + "`");

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
                    bot.sendMessage(msg, "Command `" + suffix + "` not found. Aliases aren't allowed.", function(err, msg) {
                        bot.deleteMessage(wMessage, {
                            "wait": 10000
                        });
                    });
                }
            }
        }
    },
    "invite": {
        desc: "Get my invite link",
        usage: "",
        deleteCommand: true,
        process: function(bot, msg) {
            bot.sendMessage(msg, "Use this to bring me to your server: <https://discordapp.com/oauth2/authorize?&client_id=" + config.app_id + "&scope=bot&permissions=12659727>");
        }
    },
    "id": {
        desc: "Returns your ID (or the channel's)",
        usage: "[\"channel\"]",
        deleteCommand: true,
        cooldown: 2,
        shouldDisplay: false,
        process: function(bot, msg, suffix) {
            if (suffix && suffix.trim().replace("\"", "") === "channel") {
                bot.sendMessage(msg, "This channel's ID is: " + msg.channel.id);
            } else {
                bot.sendMessage(msg, "Your ID is: " + msg.author.id);
            }
        }
    },
    "about": {
        desc: "About me",
        deleteCommand: true,
        cooldown: 10,
        usage: "",
        process: function(bot, msg) {
            var toSend = [];

            toSend.push("__Author:__ Witty (unlucky4ever) <obruza@gmail.com>");
            toSend.push("__Library:__ Discord.js");
            toSend.push("__Version:__" + version);
            toSend.push("__GitHub Page:__ <https://github.com/unlucky4ever/RuneCord>");
            toSend.push("__Donate:__ <https://paypal.me/unlucky4ever>");
            toSend.push("__Official Server:__ <https://discord.me/runecord>");

            bot.sendMessage(msg, toSend);
        }
    },
    "time": {
        desc: "Displays the current game-time",
        usage: "",
        cooldown: 30,
        process: function(bot, msg) {
            function addZero(i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }

            var d = new Date();
            var h = addZero(d.getUTCHours());
            var m = addZero(d.getUTCMinutes());

            bot.sendMessage(msg, "The current time in-game is: **" + h + ":" + m + "**.");
        }
    },
    "reset": {
        desc: "Displays how long till reset time.",
        usage: "",
        cooldown: 30,
        process: function(bot, msg) {
            // Get the time right now
            var now = Date.now();

            // Create a fake date, set it to tomorrow's 00:00:00 (UTC MIDNIGHT)
            var then = new Date();
            then.setUTCHours(24, 0, 0, 0);

            // Get the time remaining
            var resetTime = then - now;

            // Convert it to hours
            var hours = Math.floor(resetTime / 1000 / 60 / 60);
            resetTime -= hours * 1000 * 60 * 60;

            // Convert it to minutes
            var minutes = Math.floor(resetTime / 1000 / 60);
            resetTime -= minutes * 1000 * 60;

            // Put it all together
            var timestr = "";

            if (hours > 0) {
                timestr += hours + " hour" + (hours > 1 ? "s " : " ");
            }

            if (minutes > 0) {
                timestr += minutes + " minute" + (minutes > 1 ? "s." : ".");
            }

            bot.sendMessage(msg, "The game will reset in " + timestr);
        }
    },
    "bigchin": {
        desc: "Displays when the next Big Chinchompa is.",
        usage: "",
        cooldown: 30,
        process: function(bot, msg) {
            var d = new Date();
            var secondsUntil = 3600 - (d.getUTCMinutes() + 30) % 60 * 60 - d.getUTCSeconds();
            var minutesUntil = Math.floor(secondsUntil / 60);

            var timestr = "";

            if (minutesUntil === 0) {
                timestr += "1 hour";
            }

            if (minutesUntil > 0) {
                timestr += minutesUntil + " minute" + (minutesUntil > 0 && minutesUntil < 2 ? "" : "s");
            }

            bot.sendMessage(msg, "Next Big Chinchompa will be in " + timestr + ".");
        }
    },
    "cache": {
        desc: "Displays when the next Guthixian Cache is.",
        usage: "",
        cooldown: 30,
        process: function(bot, msg) {
            var d = new Date();
            var hoursUntil = 2 - d.getUTCHours() % 3;
            var minutesUntil = 60 - d.getUTCMinutes();

            var timestr = "";

            if (minutesUntil === 60) {
                hoursUntil++;
                minutesUntil = 0;
            }

            if (hoursUntil > 0) {
                timestr += hoursUntil + " hour" + (hoursUntil > 1 ? "s" : "");
            }

            if (hoursUntil >= 1 && minutesUntil > 1) {
                timestr += " and " + minutesUntil + " minute" + (minutesUntil > 1 ? "s" : "");
            }

            if (minutesUntil > 1 && hoursUntil < 1) {
                timestr += minutesUntil + " minute" + (minutesUntil > 0 && minutesUntil < 2 ? "" : "s");
            }

            bot.sendMessage(msg, "Next Guthixian Cache will be in " + timestr + ".");
        }
    },
    "warbands": {
        desc: "Displays when the next Warbands will be.",
        usage: "",
        cooldown: 30,
        process: function(bot, msg) {
            var d = new Date();
            var hoursUntil = 6 - d.getUTCHours() % 7;
            var minutesUntil = 60 - d.getUTCMinutes();

            var timestr = "";

            if (minutesUntil === 60) {
                hoursUntil++;
                minutesUntil = 0;
            }

            if (hoursUntil > 0) {
                timestr += hoursUntil + " hour" + (hoursUntil > 1 ? "s" : "");
            }

            if (hoursUntil >= 1 && minutesUntil > 1) {
                timestr += " and " + minutesUntil + " minute" + (minutesUntil > 1 ? "s" : "");
            }

            if (minutesUntil > 1 && hoursUntil < 1) {
                timestr += minutesUntil + " minute" + (minutesUntil > 0 && minutesUntil < 2 ? "" : "s");
            }

            bot.sendMessage(msg, "Next Warbands will be in " + timestr + ".");
        }
    },
    "vos": {
        desc: "Display the current Voice of Seren districts.",
        usage: "",
        cooldown: 15,
        process: function(bot, msg) {

            // Get the data from Twitter
            request("https://cdn.syndication.twimg.com/widgets/timelines/" + config.twitter_api + "?&lang=en&supress_response_codes=true&rnd=" + Math.random(), function(err, res, body) {

                if (res.statusCode == 404 || err) {
                    bot.sendMessage(msg, "Unable to grab the VoS, please try again.");

                    if (debug) {
                        console.log(cDebug(" DEBUG ") + " Unable to grab the VoS: " + err);
                    }
                    return;
                }

                if (!err && res.statusCode == 200) {
                    var vosBody = body; // The entire data
                    var vosStart = vosBody.indexOf("The Voice of Seren is now active in the "); // Let's only grab where it says this
                    var vosText = vosBody.slice(vosStart, vosBody.length); // Now get rid of all the other text

                    // Bold the district name
                    vosText = vosText.replace(/Amlodd|Cadarn|Crwys|Hefin|Iorwerth|Ithell|Meilyr|Trahaearn/gi, function(x) {
                        return "**" + x + "**";
                    });

                    // Append districts to the end of the names
                    vosText = vosText.slice(0, vosText.indexOf("districts") + 10);

                    // Send the information to the channel
                    bot.sendMessage(msg, vosText + ".");
                }
            });
        }
    },
    "lamp": {
        usage: "small|med|large|huge <skill level>",
        desc: "Displays how much XP you'd get from a lamp based on <skill level>.",
        process: function(bot, msg, suffix) {
            var xp = 0;
            var suffixes = msg.content.split(" ");

            var size = suffixes[1];
            var level = suffixes[2];

            if (size === "small") {
                size = "Small";
                xp = getLampXp(level, "small");
            } else if (size === "med" || size === "medium") {
                size = "Medium";
                xp = getLampXp(level, "medium");
            } else if (size === "large") {
                size = "Large";
                xp = getLampXp(level, "large");
            } else if (size === "huge") {
                size = "Huge";
                xp = getLampXp(level, "huge");
            } else {
                bot.sendMessage(msg, "You have entered a lamp size I do not recognize, please use \"small\", \"med\", \"large\", or \"huge\".");
                return;
            }


            if (isNaN(level)) {
                bot.sendMessage(msg, "Please enter a real number for your skill level.");
                return;
            } else if (!isInteger(level)) {
                bot.sendMessage(msg, "According to my calculations... that isn't even a real number to me.");
                return;
            } else if (level < 1) {
                bot.sendMessage(msg, "You can't have a skill level of 0, please use a real level...");
                return;
            } else if (level > 120) {
                bot.sendMessage(msg, "The highest skill level is 120, please don't go higher...");
                return;
            } else {
                bot.sendMessage(msg, "If you were level **" + level + "**, you'd gain **" + numeral(xp).format() + "** XP from a **" + size + "** lamp.");
            }
        }
    },
    "stats": {
        usage: "<username>",
        desc: "Display stats of the username given.",
        cooldown: 30,
        process: function(bot, msg, suffix) {
            // If username was provided
            if (!suffix) {
                bot.sendMessage(msg, "You must supply a username!");
                return;
            } else {
                if (debug) {
                    console.log(cDebug(" DEBUG ") + " Grabbing stats for " + suffix);
                }
                request("http://services.runescape.com/m=hiscore/index_lite.ws?player=" + suffix, function(err, res, body) {

                    // Unable to find the player name supplied
                    if (res.statusCode == 404 || err) {
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + " Unable to retrieve stats for " + suffix);
                        }
                        bot.sendMessage(msg, "Unable to retrieve stats for '" + suffix + "'.");
                        return;
                    }

                    // It was a success
                    if (!err && res.statusCode == 200) {
                        // Let's start parsing this data
                        var stat_data = body.split("\n");
                        var result = [];

                        // Loop through all the skills
                        for (var i = 0; i < 28; i++) {
                            result[i] = stat_data[i].split(",");
                        }

                        // Create a fancy table for all this data
                        var table = new AsciiTable();

                        table.setTitle("VIEWING RS3 STATS FOR " + suffix.toUpperCase());
                        table.setHeading("Skill", "Level", "Experience", "Rank");

                        for (var i = 0; i < 28; i++) {
                            table.addRow(getSkillName(i), result[i][1], numeral(result[i][2]), numeral(result[i][0]));
                        }

                        // We got the data!
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + " Stats successfully grabbed for " + suffix);
                        }

                        // Let everyone see that pretty table
                        bot.sendMessage(msg, "```" + table + "```");
                    }
                });
            }
        }
    },
    "price": {
        usage: "<item name>",
        desc: "Displays the current grand exchange info for <item name>",
        cooldown: 30,
        process: function(bot, msg, suffix) {
            // Search term was empty
            if (!suffix) {
                bot.sendMessage(msg, "You must supply a search term after the command.");
                return;
            } else { // Wasn't empty, now search for it

                // Log it
                if (debug) {
                    console.log(cDebug(" DEBUG ") + " Attempting to retrieve grand exchange data for '" + suffix + "'...");
                }

                // Request the information
                request("http://rscript.org/lookup.php?type=ge&search=" + suffix + "&exact=1", function(err, res, body) {

                    // It was a success
                    if (!err && res.statusCode == 200) {
                        // Grab how many results returned
                        var results = body.split("RESULTS: ");

                        // If only 1 result returned, grab all the data
                        if (results[1].substring(0, 1) == 1 && suffix !== null) {

                            if (debug) {
                                console.log(cDebug(" DEBUG ") + " Successfully got data for '" + suffix + "'");
                            }

                            var test = results[1].split("ITEM: ");

                            var result = test[2].split(" ");

                            var toSend = [];

                            // result[1] = ITEM NAME
                            // result[2] = ITEM PRICE
                            // result[3] = CHANGE IN 24 HOURS
                            toSend.push("**" + result[1].replace(/_/g, " ") + "** -- `" + result[2] + " GP`");
                            toSend.push("**Change in last 24 hours** -- `" + result[3].slice(0, -5) + " GP`" + (result[3].substring(0, 1) === 0 ? ":arrow_right:" : result[3].substring(0, 1) === "-" ? ":arrow_down:" : ":arrow_up:"));

                            bot.sendMessage(msg, toSend);
                        } else if (results[1].substring(0, 1) > 1) { // More than 1 result was obtained, user must refine their search term more
                            if (debug) {
                                console.log(cDebug(" DEBUG ") + " Too many results returned for " + suffix);
                            }
                            bot.sendMessage(msg, "Too many results, please refine your search term better.");
                        } else { // The user supplied an invalid name, no results returned at all
                            if (debug) {
                                console.log(cDebug(" DEBUG ") + " Error finding item '" + suffix);
                            }
                            bot.sendMessage(msg, "Error finding item '" + suffix + "', please try typing the exact item name.");
                        }
                    }
                });
            }
        }
    },
    "viswax": {
        desc: "Display the current Vis Wax combinations.",
        usage: "",
        cooldown: 15,
        process: function(bot, msg) {
            if (debug) {
                console.log(cDebug(" DEBUG ") + " Attempting to grab viswax combination...");
            }
            request("http://warbandtracker.com/goldberg/index.php", function(err, res, body) {

                // Something went wrong
                if (res.statusCode == 404 || err) {
                    if (debug) {
                        console.log(cDebug(" DEBUG ") + " Unable to grab viswax combination: " + err);
                    }
                    bot.sendMessage(msg, "Unable to grab viswax combination, please try again.");
                    return;
                }

                if (!err && res.statusCode == 200) {
                    if (debug) {
                        console.log(cDebug(" DEBUG ") + " Successfully grabbed viswax combination");
                    }
                    var visBody = body;

                    // Get the first rune
                    var firstRuneStart = visBody.indexOf("First Rune");
                    var firstRuneText = visBody.slice(firstRuneStart, visBody.length); // Name of the rune
                    var firstRunePct = firstRuneText.slice(firstRuneText.indexOf("Reported by ") + 12, firstRuneText.indexOf("%.</td>")); // Percentage for rune
                    firstRuneText = firstRuneText.slice(firstRuneText.indexOf("<b>") + 3, firstRuneText.indexOf("</b>"));

                    // Get the second runes
                    var secondRuneStart = visBody.indexOf("Second Rune");
                    var secondRuneText = visBody.slice(secondRuneStart, visBody.length);

                    // Second rune #1
                    var secondRuneText1 = secondRuneText.slice(secondRuneText.indexOf("<b>") + 3, secondRuneText.indexOf("</b>")); // Name of the rune
                    var secondRunePct1 = secondRuneText.slice(secondRuneText.indexOf("Reported by ") + 12, secondRuneText.indexOf("%.</td>")); // Percentage for rune
                    secondRuneText = secondRuneText.slice(secondRuneText.indexOf("%.</td>") + 7, secondRuneText.length);

                    var secondRuneText2 = secondRuneText.slice(secondRuneText.indexOf("<b>") + 3, secondRuneText.indexOf("</b>")); // Name of the rune
                    var secondRunePct2 = secondRuneText.slice(secondRuneText.indexOf("Reported by ") + 12, secondRuneText.indexOf("%.</td>")); // Percentage for rune
                    secondRuneText = secondRuneText.slice(secondRuneText.indexOf("%.</td>") + 7, secondRuneText.length);

                    var secondRunePct3 = secondRuneText.slice(secondRuneText.indexOf("Reported by ") + 12, secondRuneText.indexOf("%.</td>")); // Percentage for rune
                    var secondRuneText3 = secondRuneText.slice(secondRuneText.indexOf("<b>") + 3, secondRuneText.indexOf("</b>")); // Name of the rune

                    var toSend = [];

                    toSend.push("**First Rune**: *" + firstRuneText + "* `" + firstRunePct + "%`");
                    toSend.push("**Second Rune**: *" + secondRuneText1 + "* `" + secondRunePct1 + "%`, *" + secondRuneText2 + "* `" + secondRunePct2 + "%`" + ", *" + secondRuneText3 + "* `" + secondRunePct3 + "%`");

                    // Get the time now
                    var now = Date.now();

                    // Create a fake date and set it to tomorrow's 00:00:00 (UTC Time)
                    var then = new Date();
                    then.setUTCHours(24, 0, 0, 0);

                    // Get the time remaining
                    var resetTime = then - now;

                    // Get the hours
                    var hours = Math.floor(resetTime / 1000 / 60 / 60);

                    // If the game just reset, let people know.
                    if (hours >= 22) {
                        toSend.push("Please Note: `Since reset was so recent, these runes may be inaccurate...`");
                    }

                    bot.sendMessage(msg, toSend);
                }
            });

        }
    },
    "invasion": {
        usage: "<skill level>",
        desc: "Determine how much XP you get for completing troll invasion based on <skill level>.",
        process: function(bot, msg, suffix) {
            if (isNaN(suffix)) {
                bot.sendMessage(msg, "Please enter a real number for your skill level.");
                return;
            } else if (!isInteger(suffix)) {
                bot.sendMessage(msg, "According to my calculations... that isn't even a real number to me.");
                return;
            } else if (suffix < 1) {
                bot.sendMessage(msg, "You can't have a skill level of 0, please use a real level...");
                return;
            } else if (suffix > 120) {
                bot.sendMessage(msg, "The highest skill level is 120, please don't go higher...");
                return;
            } else {
                var formula = 8 * (20 / 20) * (Math.pow(suffix, 2) - 2 * suffix + 100);
                bot.sendMessage(msg, "If you were to **fully** complete Troll Invasion, you'd gain **" + numeral(formula).format() + "** XP if you were level **" + suffix + "**.");
            }
        }
    },
    "alog": {
        usage: "<username>",
        desc: "Display the adventure log of <username>.",
        process: function(bot, msg, suffix) {

            if (!suffix) { // No username was supplied
                bot.sendMessage(msg, "You must supply a username after the command.");
                return;
            } else {
                if (debug) {
                    console.log(cDebug(" DEBUG ") + " Attempting to grab adventure log for '" + suffix + "'...");
                }
                request("http://services.runescape.com/m=adventurers-log/a=13/rssfeed?searchName=" + suffix, function(err, res, body) {

                    // No adventure log was found
                    if (res.statusCode == 404 || err) {
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + " Unable to retrieve adventure log for '" + suffix + "': " + err);
                        }
                        bot.sendMessage(msg, "Unable to retrieve adventure log for '" + suffix + "'.");
                        return;
                    }

                    // It was a success
                    if (!err && res.statusCode == 200) {
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + " Adventure log successfully grabbed for " + suffix);
                        }

                        var AlogText = body.slice(body.indexOf("<item>"), body.indexOf("</channel>"));
                        var alog_data = AlogText.split("</item>");

                        var table = new AsciiTable();

                        table
                            .setTitle("VIEWING ADVENTURE LOG FOR " + suffix.toUpperCase())
                            .setHeading("Achievement", "Date");
                        for (var i = 0; i < 10; i++) {
                            table.addRow(alog_data[i].slice(alog_data[i].indexOf("<title>") + 7, alog_data[i].indexOf("</title>")), alog_data[i].slice(alog_data[i].indexOf("<pubDate>") + 9, alog_data[i].indexOf("00:00:00") - 1));
                        }


                        bot.sendMessage(msg, "```" + table + "```");
                    }
                });
            }
        }
    },
    "osstats": {
        usage: "<username>",
        desc: "Display old school stats of the username given.",
        cooldown: 30,
        process: function(bot, msg, suffix) {
            // If username was provided
            if (!suffix) {
                bot.sendMessage(msg, "You must supply a username!");
                return;
            } else {
                if (debug) {
                    console.log(cDebug(" DEBUG ") + " Grabbing stats for " + suffix);
                }
                request("http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=" + suffix, function(err, res, body) {

                    // Unable to find the player name supplied
                    if (res.statusCode == 404 || err) {
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + " Unable to retrieve stats for " + suffix);
                        }
                        bot.sendMessage(msg, " Unable to retrieve stats for '" + suffix + "'.");
                        return;
                    }

                    // It was a success
                    if (!err && res.statusCode == 200) {
                        // We got the data!
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + " Stats successfully grabbed for " + suffix);
                        }

                        // Let's start parsing this data
                        var stat_data = body.split("\n");
                        var result = [];

                        // Loop through all the skills
                        for (var i = 0; i < 24; i++) {
                            result[i] = stat_data[i].split(",");
                        }

                        // Create a fancy table for all this data
                        var table = new AsciiTable();

                        table.setTitle("VIEWING OLDSCHOOL STATS FOR " + suffix.toUpperCase());
                        table.setHeading("Skill", "Level", "Experience", "Rank");

                        for (var i = 0; i < 24; i++) {
                            table.addRow(getSkillName(i, "oldschool"), result[i][1], numeral(result[i][2]).format("0,0"), numeral(result[i][0]).format("0,0"));
                        }

                        // Let everyone see that pretty table
                        bot.sendMessage(msg, "```" + table + "```");
                    }
                });
            }
        }
    },
    "roll": {
        desc: "Roll a random number between 1 and <number>.",
        usage: "<number>",
        cooldown: 5,
        process: function(bot, msg, suffix) {
            if (isNaN(suffix)) {
                bot.sendMessage(msg, "That's not even a number...");
                return;
            } else if (suffix == 3.14) {
                bot.sendMessage(msg, "Come to the nerd side, we have Pi.");
                return;
            } else if (!isInteger(suffix)) {
                bot.sendMessage(msg, "Please use a whole number...");
                return;
            } else if (suffix <= 1) {
                bot.sendMessage(msg, "You must supply a number greater than 1!");
                return;
            } else {
                var roll = Math.floor(Math.random() * suffix) + 1;
                msg.reply(":game_die: Rolled a **" + roll + "** out of **" + suffix + "**.");
            }
        }
    },
    "twitch": {
        usage: "<username>",
        desc: "Displays twitch information based on <username>.",
        cooldown: 30,
        process: function(bot, msg, suffix) {

            // No username given
            if (!suffix) {
                bot.sendMessage(msg, "You must enter a username!");
                return;
            } else {
                if (debug) {
                    console.log(cDebug(" DEBUG ") + "Attempting to retrieve twitch status for '" + suffix + "'...");
                }
                request("https://api.twitch.tv/kraken/streams/" + suffix, function(err, res, body) {

                    // Unable to find the username
                    if (res.statusCode == 404 || err) {
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + "Unable to retrieve twitch status for '" + suffix + "'");
                        }
                        bot.sendMessage(msg, "Unable to find information on '" + suffix + "'.");
                        return;
                    }

                    // It was a success
                    if (!err && res.statusCode == 200) {
                        if (debug) {
                            console.log(cDebug(" DEBUG ") + "Successfully grabbed twitch status for '" + suffix + "'");
                        }
                        var stream = JSON.parse(body);
                        if (stream.stream) {
                            bot.sendMessage(msg, suffix + " is online, playing " + stream.stream.game + "\n" + stream.stream.channel.status + "\n" + stream.stream.channel.url);
                        } else {
                            bot.sendMessage(msg, suffix + " is offline.");
                        }
                    }
                });
            }
        }
    }
};

function getSkillName(id, type) {
    var rs3SkillNames = ["Overall", "Attack", "Defence", "Strength", "Constitution", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecrafting", "Hunter", "Construction", "Summoning", "Dungeoneering", "Divination", "Invention"];
    var osSkillNames = ["Overall", "Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Prayer", "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking", "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving", "Slayer", "Farming", "Runecrafting", "Hunter", "Construction"];

    if (type === "oldschool") {
        return osSkillNames[id];
    } else {
        return rs3SkillNames[id];
    }
}

function getLampXp(level, type) {
    var xp = 0;

    // Why did Jagex have to make it fixed numbers...
    var smallLamp = [62, 69, 77, 85, 93, 104, 123, 127, 194, 153, 170, 188, 205, 229, 252, 261, 274, 285, 298, 310, 324, 337, 352, 367, 384, 399, 405, 414, 453, 473, 493, 514, 536, 559, 583, 608, 635, 662, 691, 720, 752, 784, 818, 853, 889, 929, 970, 1012, 1055, 1101, 1148, 1200, 1249, 1304, 1362, 1422, 1485, 1546, 1616, 1684, 1757, 1835, 1911, 2004, 2108, 2171, 2269, 2379, 2470, 2592, 2693, 2809, 2946, 3082, 3213, 3339, 3495, 3646, 3792, 3980, 4166, 4347, 4521, 4762, 4918, 5033, 5375, 5592, 5922, 6121, 6451, 6614, 6928, 7236, 7532, 8064, 8347, 8602];
    var medLamp = [125, 138, 154, 170, 186, 208, 246, 254, 388, 307, 340, 376, 411, 458, 504, 523, 548, 570, 596, 620, 649, 674, 704, 735, 768, 798, 810, 828, 906, 946, 986, 1028, 1072, 1118, 1166, 1217, 1270, 1324, 1383, 1441, 1504, 1569, 1636, 1707, 1779, 1858, 1941, 2025, 2110, 2202, 2296, 2400, 2499, 2609, 2724, 2844, 2970, 3092, 3233, 3368, 3515, 3671, 3822, 4009, 4216, 4343, 4538, 4758, 4940, 5185, 5386, 5618, 5893, 6164, 6427, 6679, 6990, 7293, 7584, 7960, 8332, 8695, 9043, 9524, 9837, 10066, 10751, 11185, 11845, 12243, 12903, 13229, 13857, 14472, 15065, 16129, 16695, 17204];
    var lgLamp = [250, 276, 308, 340, 373, 416, 492, 508, 777, 614, 680, 752, 822, 916, 1008, 1046, 1096, 1140, 1192, 1240, 1298, 1348, 1408, 1470, 1536, 1596, 1621, 1656, 1812, 1892, 1973, 2056, 2144, 2237, 2332, 2434, 2540, 2648, 2766, 2882, 3008, 3138, 3272, 3414, 3558, 3716, 3882, 4050, 4220, 4404, 4593, 4800, 4998, 5218, 5448, 5688, 5940, 6184, 6466, 6737, 7030, 7342, 7645, 8018, 8432, 8686, 9076, 9516, 9880, 10371, 10772, 11237, 11786, 12328, 12855, 13358, 13980, 14587, 15169, 15920, 16664, 17390, 18087, 19048, 19674, 20132, 21502, 22370, 23690, 24486, 25806, 26458, 27714, 28944, 30130, 32258, 33390, 34408];
    var hugeLamp = [499, 612, 616, 680, 746, 832, 984, 1016, 1142, 1228, 1360, 1504, 1645, 1832, 2016, 2093, 2192, 2280, 2384, 2480, 2596, 2696, 2816, 2940, 3071, 3192, 3331, 3312, 3624, 3784, 3946, 4112, 4288, 4129, 4664, 4872, 5080, 5296, 5532, 5764, 6016, 6276, 6544, 6828, 7116, 7432, 7764, 8100, 8440, 8808, 9185, 9600, 9996, 10436, 10896, 11376, 11880, 12368, 12932, 13474, 14060, 14684, 15290, 16036, 16864, 17371, 18152, 19032, 19760, 20741, 21543, 22474, 23572, 24657, 25709, 26716, 27960, 29173, 30338, 31840, 33328, 34780, 36174, 38097, 39347, 41196, 43003, 44739, 47380, 48972, 51612, 52916, 55428, 57887, 60260, 64516, 66780, 68815];

    if (type === "small") {
        if (level >= 1 && level < 98) {
            xp = smallLamp[level - 1];
        }

        if (level >= 98) {
            xp = smallLamp[97];
        }
    }

    if (type === "medium") {
        if (level >= 1 && level < 98) {
            xp = medLamp[level - 1];
        }

        if (level >= 98) {
            xp = medLamp[97];
        }
    }

    if (type === "large") {
        if (level >= 1 && level < 98) {
            xp = lgLamp[level - 1];
        }

        if (level >= 98) {
            xp = lgLamp[97];
        }
    }

    if (type === "huge") {
        if (level >= 1 && level < 98) {
            xp = hugeLamp[level - 1];
        }

        if (level >= 98) {
            xp = hugeLamp[97];
        }
    }

    return xp;
}

function isInteger(x) {
    return x % 1 === 0;
}

exports.commands = commands;
exports.aliases = aliases;
