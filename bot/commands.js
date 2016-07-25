/**
 * Required Dependencies
 */
var AsciiTable = require("ascii-table");
var numeral = require("numeral");
var request = require("request");
var Entities = require("html-entities").AllHtmlEntities;
var version = require("../package.json").version;
/**
 * Required Files
 */
var config = require("./config.json");

var entities = new Entities();

function correctUsage(cmd, usage, msg, bot, delay) {
  bot.sendMessage(msg, msg.author.username.replace(/@/g, "@\u200b") + ", the correct usage is *`" + config.command_prefix + cmd + " " + usage + "`*", (erro, wMessage) => {
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
  "join": "invite",
  "gametime": "time",
  "hs": "stats",
  "rs3stats": "stats",
  "osrsstats": "osstats",
  "adventurelog": "alog",
  "advlog": "alog",
  "wbs": "warbands",
  "trollinvasion": "invasion",
  "troll": "invasion",
  "xplamp": "lamp",
  "jackoftrades": "jot",
  "rago": "vorago",
  "rax": "araxxi"
};
var commands = {
  "help": {
    desc: "Sends a DM containing all of the commands. If a command is specified, gives info on that command.",
    usage: "[command]",
    deleteCommand: true,
    shouldDisplay: false,
    cooldown: 1,
    process: (bot, msg, suffix) => {
      var toSend = [];
      if (!suffix) {
        toSend.push("Use `" + config.command_prefix + "help <command name>` to get more info on a command.\n");
        toSend.push("Mod commands can be found using `" + config.mod_command_prefix + "help`.\n");
        toSend.push("You can find the list online at **https://unlucky4ever.github.io/RuneCord/**\n");
        toSend.push("**Commands:**```\n");
        Object.keys(commands).forEach((cmd) => {
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
          setTimeout(() => {
            bot.sendMessage(msg.author, "```" + toSend.substr(toSend.substr(0, 1990).lastIndexOf("\n\t")) + "```");
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
          bot.sendMessage(msg, "Command `" + suffix + "` not found. Aliases aren't allowed.", (err, msg) => {
            bot.deleteMessage(msg, {
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
    process: (bot, msg) => {
      bot.sendMessage(msg, "Use this to bring me to your server: <https://discordapp.com/oauth2/authorize?&client_id=" + process.env.APP_ID + "&scope=bot&permissions=12659727>");
    }
  },
  "about": {
    desc: "About me",
    deleteCommand: true,
    cooldown: 10,
    usage: "",
    process: (bot, msg) => {
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
    process: (bot, msg) => {
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
    process: (bot, msg) => {
      var now = Date.now();
      var then = new Date();
      then.setUTCHours(24, 0, 0, 0);
      var resetTime = then - now;
      var hours = Math.floor(resetTime / 1000 / 60 / 60);
      resetTime -= hours * 1000 * 60 * 60;
      var minutes = Math.floor(resetTime / 1000 / 60);
      resetTime -= minutes * 1000 * 60;
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
    process: (bot, msg) => {
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
  "sinkhole": {
    desc: "Displays when the next Sinkhole will be.",
    usage: "",
    process: (bot, msg) => {
      var d = new Date();
      var secondsUntil = 3600 - (d.getUTCMinutes() + 30) % 60 * 60 - d.getUTCSeconds();
      var minutesUntil = Math.floor(secondsUntil / 60);
      var timestr = "";
      if (minutesUntil === 0) {
        timestr += "1 hour";
      }
      if (minutesUntil > 0) {
        timestr += minutesUntil + " minute" + (minutesUntil > 0 && minutesUntil < 1 ? "" : "s");
      }
      bot.sendMessage(msg, "Next Sinkhole will be in " + timestr + ".");
    }
  },
  "cache": {
    desc: "Displays when the next Guthixian Cache is.",
    usage: "",
    cooldown: 30,
    process: (bot, msg) => {
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
    process: (bot, msg) => {
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
    process: (bot, msg) => {
      request("https://cdn.syndication.twimg.com/widgets/timelines/" + process.env.TWITTER_API + "?&lang=en&supress_response_codes=true&rnd=" + Math.random(), (err, res, body) => {
        if (res.statusCode == 404 || err) {
          bot.sendMessage(msg, "Unable to grab the VoS, please try again.");
          if (debug) {
            console.log(cDebug(" DEBUG ") + " Unable to grab the VoS: " + err);
          }
          return;
        }
        if (!err && res.statusCode == 200) {
          var vosBody = body;
          var vosStart = vosBody.indexOf("The Voice of Seren is now active in the ");
          var vosText = vosBody.slice(vosStart, vosBody.length);
          vosText = vosText.replace(/Amlodd|Cadarn|Crwys|Hefin|Iorwerth|Ithell|Meilyr|Trahaearn/gi, function(x) {
            return "**" + x + "**";
          });
          vosText = vosText.slice(0, vosText.indexOf("districts") + 10);
          bot.sendMessage(msg, vosText + ".");
        }
      });
    }
  },
  "lamp": {
    usage: "small|med|large|huge <skill level>",
    desc: "Displays how much XP you'd get from a lamp based on <skill level>.",
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("lamp", commands.lamp.usage, msg, bot);
        return;
      } else {
        var size = suffix.split(" ")[0];
        var level = suffix.split(" ")[1];
        var xp = 0;
        if (size && level) {
          if (size && !isInteger(size)) {
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
              correctUsage("lamp", commands.lamp.usage, msg, bot);
            }
          } else {
            correctUsage("lamp", commands.lamp.usage, msg, bot);
            return;
          }
          if (level) {
            if (isNaN(level)) {
              correctUsage("lamp", commands.lamp.usage, msg, bot);
              return;
            } else if (!isInteger(level)) {
              correctUsage("lamp", commands.lamp.usage, msg, bot);
              return;
            } else if (level < 1) {
              correctUsage("lamp", commands.lamp.usage, msg, bot);
              return;
            } else if (level > 120) {
              correctUsage("lamp", commands.lamp.usage, msg, bot);
              return;
            } else {
              bot.sendMessage(msg, "If you were level **" + level + "**, you'd gain **" + numeral(xp).format() + "** XP from a **" + size + "** lamp.");
            }
          }
        } else {
          correctUsage("lamp", commands.lamp.usage, msg, bot);
          return;
        }
      }
    }
  },
  "pengs": {
    desc: "Displays how much XP or Coins you'd gain from penguins.",
    usage: "points level",
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("pengs", commands.pengs.usage, msg, bot);
        return;
      } else {
        var points = suffix.split(" ")[0];
        var level = suffix.split(" ")[1];
        if (points && !level) {
          var pengGp = 6500 * points;
          bot.sendMessage(msg, "You'd gain **" + numeral(pengGp).format() + "** coins, if you use **" + points + "** points.");
        } else if (points * level) {
          if (points) {
            if (isNaN(points)) {
              correctUsage("pengs", commands.pengs.usage, msg, bot);
              return
            } else if (!isInteger(points)) {
              correctUsage("pengs", commands.pengs.usage, msg, bot);
              return;
            } else {
              if (level) {
                if (isNaN(level)) {
                  correctUsage("pengs", commands.pengs.usage, msg, bot);
                  return;
                } else if (!isInteger(level)) {
                  correctUsage("pengs", commands.pengs.usage, msg, bot);
                  return;
                } else if (level < 1) {
                  correctUsage("pengs", commands.pengs.usage, msg, bot);
                  return;
                } else if (level > 120) {
                  correctUsage("pengs", commands.pengs.usage, msg, bot);
                  return;
                } else {
                  var pengXp = 25 * level * points;
                  bot.sendMessage(msg, "You'd gain **" + numeral(pengXp).format() + "** XP at level **" + level + "**, if you use **" + points + "** points.");
                }
              }
            }
          }
        } else {
          correctUsage("pengs", commands.pengs.usage, msg, bot);
          return;
        }
      }
    }
  },
  "jot": {
    desc: "Displays how much XP you'd gain from Jack of Trades based on type and skill level.",
    usage: "normal|master|supreme|legendary level",
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("jot", commands.jot.usage, msg, bot);
        return;
      } else {
        var type = suffix.split(" ")[0];
        var level = suffix.split(" ")[1];
        var xp = 0;
        if (type && level) {
          if (type && !isInteger(type)) {
            if (type === "normal") {
              type = "Normal";
              xp = 1.5 * (Math.pow(level, 2) - (2 * level) + 100);
            } else if (type === "master") {
              type = "Master";
              xp = 2 * (Math.pow(level, 2) - (2 * level) + 100);
            } else if (type === "supreme") {
              type = "Supreme";
              xp = 2.5 * (Math.pow(level, 2) - (2 * level) + 100);
            } else if (type === "legendary") {
              type = "Legendary";
              xp = 3 * (Math.pow(level, 2) - (2 * level) + 100);
            } else {
              correctUsage("jot", commands.jot.usage, msg, bot);
            }
          } else {
            correctUsage("jot", commands.jot.usage, msg, bot);
            return;
          }
          if (level) {
            if (isNaN(level)) {
              correctUsage("jot", commands.jot.usage, msg, bot);
              return;
            } else if (!isInteger(level)) {
              correctUsage("jot", commands.jot.usage, msg, bot);
              return;
            } else if (level < 1) {
              correctUsage("jot", commands.jot.usage, msg, bot);
              return;
            } else if (level > 120) {
              correctUsage("jot", commands.jot.usage, msg, bot);
              return;
            } else {
              bot.sendMessage(msg, "From a **" + type + "** Jack of Trades aura, you'd gain **" + numeral(xp).format() + "** XP if you were level **" + level + "**.");
            }
          }
        } else {
          correctUsage("jot", commands.jot.usage, msg, bot);
          return;
        }
      }
    }
  },
  "statues": {
    desc: "Displays how much XP you'd gain in various skills from monthly god statues.",
    usage: "<username>",
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("statues", commands.statues.usage, msg, bot);
        return;
      } else {
        if (debug) {
          console.log(cDebug(" DEBUG ") + " Grabbing stats for " + suffix);
        }
        request("http://services.runescape.com/m=hiscore/index_lite.ws?player=" + suffix, (err, res, body) => {
          if (res.statusCode == 404 || err) {
            if (debug) {
              console.log(cDebug(" DEBUG ") + " Unable to retrieve stats for " + suffix);
            }
            bot.sendMessage(msg, "Unable to get your stats.");
            return;
          }
          if (!err && res.statusCode == 200) {
            var stat_data = body.split("\n");
            var result = [];
            for (var i = 0; i < 28; i++) {
              result[i] = stat_data[i].split(",");
            }
            var conXp = getLampXp(result[23][1], "large");
            var prayerXp = getLampXp(result[6][1], "medium");
            var slayerXp = getLampXp(result[19][1], "medium");
            var toSend = [];
            toSend.push("Each God Statue would give **" + suffix + "** **" + numeral(conXp).format() + "** Construction XP at level **" + result[23][1] + "**.");
            toSend.push("Each God Statue would give **" + suffix + "** **" + numeral(prayerXp).format() + "** Prayer XP at level **" + result[6][1] + "**.");
            toSend.push("Each God Statue would give **" + suffix + "** **" + numeral(slayerXp).format() + "** Slayer XP at level **" + result[19][1] + "**.");
            toSend.push("Giving a total of **" + numeral(prayerXp * 6).format() + "** Prayer XP, and either **" + numeral(conXp * 6).format() + "** Construction XP, or **" + numeral(slayerXp * 6).format() + "** Slayer XP. If **" + suffix + "** completed all 6 statues.");
            bot.sendMessage(msg, toSend);
          }
        });
      }
    }
  },
  "stats": {
    usage: "<username>",
    desc: "Display stats of the username given.",
    cooldown: 30,
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("stats", commands.stats.usage, msg, bot);
        return;
      } else {
        if (debug) {
          console.log(cDebug(" DEBUG ") + " Grabbing stats for " + suffix);
        }
        request("http://services.runescape.com/m=hiscore/index_lite.ws?player=" + suffix, (err, res, body) => {
          if (res.statusCode == 404 || err) {
            if (debug) {
              console.log(cDebug(" DEBUG ") + " Unable to retrieve stats for " + suffix);
            }
            bot.sendMessage(msg, "Unable to retrieve stats for '" + suffix + "'.");
            return;
          }
          if (!err && res.statusCode == 200) {
            var stat_data = body.split("\n");
            var result = [];
            for (var i = 0; i < 28; i++) {
              result[i] = stat_data[i].split(",");
            }
            var table = new AsciiTable();
            table.setTitle("VIEWING RS3 STATS FOR " + suffix.toUpperCase());
            table.setHeading("Skill", "Level", "Experience", "Rank");
            for (var i = 0; i < 28; i++) {
              table.addRow(getSkillName(i), result[i][1], numeral(result[i][2]).format(), numeral(result[i][0]).format());
            }
            if (debug) {
              console.log(cDebug(" DEBUG ") + " Stats successfully grabbed for " + suffix);
            }
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
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("price", commands.price.usage, msg, bot);
        return;
      } else {
        if (debug) {
          console.log(cDebug(" DEBUG ") + " Attempting to retrieve grand exchange data for '" + suffix + "'...");
        }
        request("http://rscript.org/lookup.php?type=ge&search=" + suffix + "&exact=1", (err, res, body) => {
          if (!err && res.statusCode == 200) {
            var results = body.split("RESULTS: ");
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
              toSend.push("**Change in last 24 hours** -- `" + result[3].slice(0, -5) + " GP`" + (result[3].substring(0, 1) === "0" ? ":arrow_right:" : result[3].substring(0, 1) === "-" ? ":arrow_down:" : ":arrow_up:"));
              bot.sendMessage(msg, toSend);
            } else if (results[1].substring(0, 1) > 1) {
              if (debug) {
                console.log(cDebug(" DEBUG ") + " Too many results returned for " + suffix);
              }
              bot.sendMessage(msg, "Too many results, please refine your search term better.");
            } else {
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
    process: (bot, msg) => {
      if (debug) {
        console.log(cDebug(" DEBUG ") + " Attempting to grab viswax combination...");
      }
      request("http://warbandtracker.com/goldberg/index.php", (err, res, body) => {
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
          var firstRuneStart = visBody.indexOf("First Rune");
          var firstRuneText = visBody.slice(firstRuneStart, visBody.length);
          var firstRunePct = firstRuneText.slice(firstRuneText.indexOf("Reported by ") + 12, firstRuneText.indexOf("%.</td>"));
          firstRuneText = firstRuneText.slice(firstRuneText.indexOf("<b>") + 3, firstRuneText.indexOf("</b>"));
          var secondRuneStart = visBody.indexOf("Second Rune");
          var secondRuneText = visBody.slice(secondRuneStart, visBody.length);
          var secondRuneText1 = secondRuneText.slice(secondRuneText.indexOf("<b>") + 3, secondRuneText.indexOf("</b>"));
          var secondRunePct1 = secondRuneText.slice(secondRuneText.indexOf("Reported by ") + 12, secondRuneText.indexOf("%.</td>"));
          secondRuneText = secondRuneText.slice(secondRuneText.indexOf("%.</td>") + 7, secondRuneText.length);
          var secondRuneText2 = secondRuneText.slice(secondRuneText.indexOf("<b>") + 3, secondRuneText.indexOf("</b>"));
          var secondRunePct2 = secondRuneText.slice(secondRuneText.indexOf("Reported by ") + 12, secondRuneText.indexOf("%.</td>"));
          secondRuneText = secondRuneText.slice(secondRuneText.indexOf("%.</td>") + 7, secondRuneText.length);
          var secondRunePct3 = secondRuneText.slice(secondRuneText.indexOf("Reported by ") + 12, secondRuneText.indexOf("%.</td>"));
          var secondRuneText3 = secondRuneText.slice(secondRuneText.indexOf("<b>") + 3, secondRuneText.indexOf("</b>"));
          var toSend = [];
          toSend.push("**First Rune**: *" + firstRuneText + "* `" + firstRunePct + "%`");
          toSend.push("**Second Rune**: *" + secondRuneText1 + "* `" + secondRunePct1 + "%`, *" + secondRuneText2 + "* `" + secondRunePct2 + "%`" + ", *" + secondRuneText3 + "* `" + secondRunePct3 + "%`");
          var now = Date.now();
          var then = new Date();
          then.setUTCHours(24, 0, 0, 0);
          var resetTime = then - now;
          var hours = Math.floor(resetTime / 1000 / 60 / 60);
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
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("invasion", commands.invasion.usage, msg, bot);
        return;
      } else {
        if (isNaN(suffix)) {
          correctUsage("invasion", commands.invasion.usage, msg, bot);
          return;
        } else if (!isInteger(suffix)) {
          correctUsage("invasion", commands.invasion.usage, msg, bot);
          return;
        } else if (suffix < 1) {
          correctUsage("invasion", commands.invasion.usage, msg, bot);
          return;
        } else if (suffix > 120) {
          correctUsage("invasion", commands.invasion.usage, msg, bot);
          return;
        } else {
          var formula = 8 * (20 / 20) * (Math.pow(suffix, 2) - 2 * suffix + 100);
          bot.sendMessage(msg, "If you were to **fully** complete Troll Invasion, you'd gain **" + numeral(formula).format() + "** XP if you were level **" + suffix + "**.");
        }
      }
    }
  },
  "alog": {
    usage: "<username>",
    desc: "Display the adventure log of <username>.",
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("alog", commands.alog.usage, msg, bot);
        return;
      } else {
        if (debug) {
          console.log(cDebug(" DEBUG ") + " Attempting to grab adventure log for '" + suffix + "'...");
        }
        request("http://services.runescape.com/m=adventurers-log/a=13/rssfeed?searchName=" + suffix, (err, res, body) => {
          if (res.statusCode == 404 || err) {
            if (debug) {
              console.log(cDebug(" DEBUG ") + " Unable to retrieve adventure log for '" + suffix + "': " + err);
            }
            bot.sendMessage(msg, "Unable to retrieve adventure log for '" + suffix + "'.");
            return;
          }
          if (!err && res.statusCode == 200) {
            if (debug) {
              console.log(cDebug(" DEBUG ") + " Adventure log successfully grabbed for " + suffix);
            }
            var AlogText = body.slice(body.indexOf("<item>"), body.indexOf("</channel>"));
            var alog_data = AlogText.split("</item>");
            var table = new AsciiTable();
            table.setTitle("VIEWING ADVENTURE LOG FOR " + suffix.toUpperCase()).setHeading("Achievement", "Date");
            for (var i = 0; i < 10; i++) {
              table.addRow(entities.decode(alog_data[i].slice(alog_data[i].indexOf("<title>") + 7, alog_data[i].indexOf("</title>"))), alog_data[i].slice(alog_data[i].indexOf("<pubDate>") + 9, alog_data[i].indexOf("00:00:00") - 1));
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
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("osstats", commands.osstats.usage, msg, bot);
        return;
      } else {
        if (debug) {
          console.log(cDebug(" DEBUG ") + " Grabbing stats for " + suffix);
        }
        request("http://services.runescape.com/m=hiscore_oldschool/index_lite.ws?player=" + suffix, (err, res, body) => {
          if (res.statusCode == 404 || err) {
            if (debug) {
              console.log(cDebug(" DEBUG ") + " Unable to retrieve stats for " + suffix);
            }
            bot.sendMessage(msg, " Unable to retrieve stats for '" + suffix + "'.");
            return;
          }
          if (!err && res.statusCode == 200) {
            if (debug) {
              console.log(cDebug(" DEBUG ") + " Stats successfully grabbed for " + suffix);
            }
            var stat_data = body.split("\n");
            var result = [];
            for (var i = 0; i < 24; i++) {
              result[i] = stat_data[i].split(",");
            }
            var table = new AsciiTable();
            table.setTitle("VIEWING OLDSCHOOL STATS FOR " + suffix.toUpperCase());
            table.setHeading("Skill", "Level", "Experience", "Rank");
            for (var i = 0; i < 24; i++) {
              table.addRow(getSkillName(i, "oldschool"), result[i][1], numeral(result[i][2]).format(), numeral(result[i][0]).format());
            }
            bot.sendMessage(msg, "```" + table + "```");
          }
        });
      }
    }
  },
  "vorago": {
    desc: "Displays what the current rotation for Vorago is.",
    usage: "",
    process: (bot, msg) => {
      var voragoRotations = [
        "Ceiling Collapse",
        "Scopulus",
        "Vitalis",
        "Green Bomb",
        "Team Split",
        "The End"
    ];
      var currentRotation = Math.floor((((Math.floor(Math.floor(Date.now() / 1000) / (24 * 60 * 60))) - 6) % (7 * voragoRotations.length)) / 7);
      var daysUntilNext = 7 - ((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) - 6) % (7 * voragoRotations.length) % 7;
      var nextRotation = currentRotation + 1;
      if (nextRotation === voragoRotations.length) {
        nextRotation = 0;
      }
      var toSend = [];
      toSend.push("The current rotation for Vorago is **" + voragoRotations[currentRotation] + "**.");
      toSend.push("The next rotation for Vorago will be **" + voragoRotations[nextRotation] + "** in **" + daysUntilNext + "** day" + (daysUntilNext > 1 ? "s." : "."));
      bot.sendMessage(msg, toSend);
    }
  },
  "araxxi": {
    desc: "Display what the current rotation for Araxxi is.",
    usage: "",
    process: (bot, msg) => {
      var araxxiRotations = [
        "Path 1 - Minions",
        "Path 2 - Acid",
        "Path 3 - Darkness"
      ];
      var currentRotation = Math.floor((((Math.floor(Math.floor(Date.now() / 1000) / (24 * 60 * 60))) + 3) % (4 * araxxiRotations.length)) / 4);
      var daysUntilNext = 4 - ((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) + 3) % (4 * araxxiRotations.length) % 4;
      var nextRotation = currentRotation + 1;
      if (nextRotation === araxxiRotations.length) {
        nextRotation = 0;
      }
      var toSend = [];
      toSend.push("The current path that is closed for Araxxi is **" + araxxiRotations[currentRotation] + "**.");
      toSend.push("The next path to be closed will be **" + araxxiRotations[nextRotation] + "** in **" + daysUntilNext + "** day" + (daysUntilNext > 1 ? "s." : "."));
      bot.sendMessage(msg, toSend);
    }
  },
  "rots": {
    desc: "Displays what the current rotation for Rise of the Six is.",
    usage: "",
    process: (bot, msg) => {
      var names = {
        A: "Ahrim",
        D: "Dharok",
        G: "Guthan",
        K: "Karil",
        T: "Torag",
        V: "Verac"
      }
      var rotsRotations = [
        [[names.D, names.T, names.V], [names.K, names.A, names.G]],
        [[names.K, names.T, names.G], [names.A, names.D, names.V]],
        [[names.K, names.G, names.V], [names.A, names.T, names.D]],
        [[names.G, names.T, names.V], [names.K, names.A, names.D]],
        [[names.K, names.T, names.V], [names.A, names.G, names.D]],
        [[names.A, names.G, names.D], [names.K, names.T, names.V]],
        [[names.K, names.A, names.D], [names.G, names.T, names.V]],
        [[names.A, names.T, names.D], [names.K, names.G, names.V]],
        [[names.A, names.D, names.V], [names.K, names.T, names.G]],
        [[names.K, names.A, names.G], [names.T, names.D, names.V]],
        [[names.A, names.T, names.G], [names.K, names.D, names.V]],
        [[names.A, names.G, names.V], [names.K, names.T, names.D]],
        [[names.K, names.A, names.T], [names.G, names.D, names.V]],
        [[names.K, names.A, names.V], [names.D, names.T, names.G]],
        [[names.A, names.T, names.V], [names.K, names.D, names.G]],
        [[names.K, names.D, names.G], [names.A, names.T, names.V]],
        [[names.D, names.T, names.G], [names.K, names.A, names.V]],
        [[names.G, names.D, names.V], [names.K, names.A, names.T]],
        [[names.K, names.T, names.D], [names.A, names.G, names.V]],
        [[names.K, names.D, names.V], [names.A, names.T, names.G]]
      ];
      var currentRotation = (Math.floor((Date.now() / 1000) / (24 * 60 * 60)) % 20);
      if (currentRotation === -1 || currentRotation >= rotsRotations.length) {
        currentRotation = 0;
      }
      var westSide = rotsRotations[currentRotation][0].join(" - ");
      var eastSide = rotsRotations[currentRotation][1].join(" - ");
      westSide = westSide.replace(/Ahrim|Dharok|Guthan|Karil|Torag|Verac/gi, function(x) {
        return "**" + x + "**";
      });
      eastSide = eastSide.replace(/Ahrim|Dharok|Guthan|Karil|Torag|Verac/gi, function(x) {
        return "**" + x + "**";
      });
      var toSend = [];
      toSend.push("**Current rotation for Rise of the Six**");
      toSend.push("----------------------------------------");
      toSend.push("West Side: " + westSide + ".");
      toSend.push("East Side: " + eastSide + ".");
      bot.sendMessage(msg, toSend);
    }
  },
  "spotlight": {
    desc: "Displays what minigame is currently on spotlight.",
    usage: "",
    process: (bot, msg) => {
      var minigames = [
        "Pest Control",
        "Soul Wars",
        "Fist of Guthix",
        "Barbarian Assault",
        "Conquest",
        "Fishing Trawler",
        "The Great Orb Project",
        "Flash Powder Factory",
        "Castle Wars",
        "Stealing Creation",
        "Cabbage Facepunch Bonanza",
        "Heist", "Mobilising Armies",
        "Barbarian Assault",
        "Conquest",
        "Fist of Guthix",
        "Castle Wars",
        "Pest Control",
        "Soul Wars",
        "Fishing Trawler",
        "The Great Orb Project",
        "Flash Powder Factory",
        "Stealing Creation",
        "Cabbage Facepunch Bonanza",
        "Heist",
        "Trouble Brewing",
        "Castle Wars"
      ];
      var currentSpotlight = Math.floor((((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) - 49) % (3 * minigames.length)) / 3);
      var daysUntilNext = 3 - ((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) - 49) % (3 * minigames.length) % 3;
      var nextSpotlight = currentSpotlight + 1;
      if (nextSpotlight === minigames.length) {
        nextSpotlight = 0;
      }
      var toSend = [];
      toSend.push("The current minigame that is on spotlight is **" + minigames[currentSpotlight] + "**.");
      toSend.push("The next minigame to be on spotlight will be **" + minigames[nextSpotlight] + "** in **" + daysUntilNext + "** day" + (daysUntilNext > 1 ? "s." : "."));
      bot.sendMessage(msg, toSend);
    }
  },
  "circus": {
    desc: "Displays the current location for the Circus.",
    usage: "",
    process: (bot, msg) => {
      var locations = [
        "Tree Gnome Stronghold",
        "Seers' Village",
        "Catherby",
        "Taverley",
        "Edgeville",
        "Falador",
        "Rimmington",
        "Draynor Village",
        "Al Kharid",
        "Lumbridge",
        "Lumber Yard",
        "Gertrude's House"
      ];
      var currentLocation = Math.floor((((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) + 1) % (7 * locations.length)) / 7);
      var daysUntilNext = 7 - ((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) + 1) % (7 * locations.length) % 7;
      var nextLocation = currentLocation + 1;
      if (nextLocation === locations.length) {
        nextLocation = 0;
      }
      var toSend = [];
      toSend.push("The circus is currently located in **" + locations[currentLocation] + "**.");
      toSend.push("The next location for the circus is **" + locations[nextLocation] + "** in **" + daysUntilNext + "** day" + (daysUntilNext > 1 ? "s." : "."));
      bot.sendMessage(msg, toSend);
    }
  },
  "raven": {
    desc: "Displays when the next Raven will spawn in Prifddinas.",
    usage: "",
    process: (bot, msg) => {
      var spawned = false;
      var daysUntilNext = 0;
      var formula = (((Math.floor((Date.now() / 1000) / (24 * 60 * 60))) + 7) % 13);
      if (formula < 1) {
        daysUntilNext = 1 - formula;
        spawned = true;
      } else {
        daysUntilNext = 13 - formula;
        spawned = false;
      }
      if (spawned) {
        bot.sendMessage(msg, "A raven is currently spawned in Prifddinas. The next one will be in **" + daysUntilNext + "** days.");
      } else {
        bot.sendMessage(msg, "There is currently no raven spawned in Prifddinas. The next one will be in **" + daysUntilNext + "** days");
      }
    }
  },
  "roll": {
    desc: "Roll a random number between 1 and <number>.",
    usage: "<number>",
    cooldown: 5,
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("roll", commands.roll.usage, msg, bot);
        return;
      } else {
        if (isNaN(suffix)) {
          correctUsage("roll", commands.roll.usage, msg, bot);
          return;
        } else if (!isInteger(suffix)) {
          correctUsage("roll", commands.roll.usage, msg, bot);
          return;
        } else if (suffix <= 1) {
          correctUsage("roll", commands.roll.usage, msg, bot);
          return;
        } else if (suffix > Number.MAX_SAFE_INTEGER) {
          bot.sendMessage(msg, msg.author.username.replace(/@/g, "@\u200b") + ", That number is too high for me to process, please use a smaller number", (err, wMessage) => {
            bot.deleteMessage(wMessage, {
              "wait": 10000
            });
          });
          bot.deleteMessage(msg, {
            "wait": 10000
          });
          return;
        } else {
          var roll = Math.floor(Math.random() * suffix) + 1;
          msg.reply(":game_die: Rolled a **" + roll + "** out of **" + suffix + "**.");
        }
      }
    }
  },
  "twitch": {
    usage: "<username>",
    desc: "Displays twitch information based on <username>.",
    cooldown: 30,
    process: (bot, msg, suffix) => {
      if (!suffix) {
        correctUsage("twitch", commands.twitch.usage, msg, bot);
        return;
      } else {
        if (debug) {
          console.log(cDebug(" DEBUG ") + "Attempting to retrieve twitch status for '" + suffix + "'...");
        }
        request("https://api.twitch.tv/kraken/streams/" + suffix, (err, res, body) => {
          if (res.statusCode == 404 || err) {
            if (debug) {
              console.log(cDebug(" DEBUG ") + "Unable to retrieve twitch status for '" + suffix + "'");
            }
            bot.sendMessage(msg, "Unable to find information on '" + suffix + "'.");
            return;
          }
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
