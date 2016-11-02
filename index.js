/* REQUIRED DEPENDENCIES */
require('dotenv').config();
const Discord = require('discord.js');
const fs      = require('fs');
const request = require('request');

/* REQUIRED FILES */
const logger       = require('./bot/logger.js');
checkDb(); // Run this before anything else
const config       = require('./bot/config.json');
const versionCheck = require('./bot/versionCheck.js');
const database     = require('./bot/data/database.js');
const userCommands = require('./bot/commands/user.js');
const modCommands  = require('./bot/commands/mod.js');
const dataDog      = require('./bot/datadog.js');

/* SET OPTIONS AND INIT BOT */
const discordOptions = {'fetch_all_members': true};
const client         = new Discord.Client(discordOptions);

/* GLOBAL VARIABLES */
commandsProcessed = 0;

/* LOCAL VARIALBES */
var pmCooldown = {};

/* RUN ALL THIS EVERY HOUR */
setInterval(() => {
  pmCooldown = {};
  stats();
}, 3600000);

/* RUN THIS EVERY 15 SECONDS */
setInterval(() => {
  dataDogStats();
}, 15000);

/* MAKE THE BOT CONNECT TO DISCORD, IF NO TOKEN IS SET, DO NOT ATTEMPT TO CONNECT */
function connect() {
  if (!process.env.TOKEN) {
    logger.error('Please setup TOKEN in .env to use RuneCord!');
    process.exit(1);
  }

  client.login(process.env.TOKEN);
}

/* CHECK TO SEE IF THE DATABASE FILES ARE THERE, IF NOT, MAKE THEM */
function checkDb() {
  try {
    fs.statSync('./bot/data/guilds.json');
  } catch (e) {
    logger.warn('\'bot/data/guilds.json\' doesn\'t exist... Creating!');
    fs.writeFileSync('./bot/data/guilds.json', '{}');
  }
  try {
    fs.statSync('./bot/data/times.json');
  } catch (e) {
    logger.warn('\'bot/data/times.json\' doesn\'t exist... Creating!');
    fs.writeFileSync('./bot/data/times.json', '{}');
  }
}

/* USED FOR '(eval)' COMMAND, RUNS THE MESSAGE AS A REAL FUNCTION */
function evaluateString(msg) {
  if (msg.author.id != process.env.ADMIN_ID) return; // Make sure only the admin can use this

  var timeTaken = new Date();
  var result;
  logger.info('Running eval...');
  try {
    result = eval(msg.content.substring(7).replace(/\n/g, ''));
  } catch (e) {
    logger.error(e);
    var toSend = [];
    toSend.push(':x: Error evaluating');
    toSend.push('```diff');
    toSend.push('- ' + e);
    toSend.push('```');
    msg.channel.sendMessage(toSend.join('\n'));
  }
  if (result) {
    var toSend = [];
    toSend.push(':white_check_mark: Evaluated successfully:');
    toSend.push('```');
    toSend.push(result);
    toSend.push('```');
    toSend.push('Time taken: ' + (timeTaken - msg.timestamp) + ' ms');
    msg.channel.sendMessage(toSend.join('\n')).then(logger.info('Result: ' + result));
  }
}

/* COMMAND EXECUTION */
function execCommand(msg, cmd, suffix, type) {
  try {
    commandsProcessed += 1; // Increase amount of commands done since bot was started
    if (process.env.DATADOG_APIKEY && process.env.DATADOG_APPKEY) dataDog.send('commandsProcessed', commandsProcessed);
    if (type == 'user') {

      /* TEXT CHANNEL */
      if (msg.channel.type == 'text') {
        logger.cmd(cmd, suffix, msg.author.username, msg.channel.guild);
        database.updateTimestamp(msg.channel.guild);
      }

      /* 1-ON-1 DIRECT MESSAGE */
      if (msg.channel.type == 'dm') {
        logger.cmd(cmd, suffix, msg.author.username);
      }

      /* PROCESS THE COMMAND */
      userCommands.commands[cmd].process(client, msg, suffix);

      /* IF DELETE COMMANDS IS ENABLED, DELETE THE COMMAND AFTER PROCESSING */
      if (msg.channel.type != 'dm' && userCommands.commands[cmd].hasOwnProperty('deleteCommand')) {
        if (userCommands.commands[cmd].deleteCommand === true && ServerSettings.hasOwnProperty(msg.channel.guild.id) && ServerSettings[msg.channel.guild.id].deleteCommands === true) {
          msg.delete(10000);
        }
      }

    } else if (type == 'mod') {

      /* TEXT CHANNEL */
      if (msg.channel.type == 'text') {
        logger.cmd(cmd, suffix, msg.author.username, msg.channel.guild, 'mod');
      }

      /* 1-ON-1 DIRECT MESSAGE */
      if (msg.channel.type == 'dm') {
        logger.cmd(cmd, suffix, msg.author.username, null, 'mod');
      }

      /* PROCESS THE COMMAND */
      modCommands.commands[cmd].process(client, msg, suffix);

      /* IF DELETE COMMANDS IS ENABLED, DELETE THE COMMAND AFTER PROCESSING */
      if (msg.channel.type != 'dm' && modCommands.commands[cmd].hasOwnProperty('deleteCommand')) {
        if (modCommands.commands[cmd].deleteCommand === true && ServerSettings.hasOwnProperty(msg.channel.guild.id) && ServerSettings[msg.channel.guild.id].deleteCommands === true) {
          msg.delete(10000);
        }
      }
    }
  } catch (err) {
    logger.error(err.stack);
  }
}

/* POST STATS TO VARIOUS WEBSITES */
function stats() {

  /* BOTS.DISCORD.PW STATS */
  if (process.env.DISCORD_BOTS_KEY) {
    request.post({
      'url': 'https://bots.discord.pw/api/bots/' + client.user.id + '/stats',
      'headers': {'content-type': 'application/json', 'Authorization': process.env.DISCORD_BOTS_KEY},
      'json': true,
      body: {
        'server_count': client.guilds.array().length
      }
    }, (err, res, body) => {
      if (err || res.statusCode != 200) {
        logger.error(`Error updating stats at bots.discord.pw:\nBody: ${body}\nStatus Code: ${res.statusCode}\nError: ${err}`);
      }
      logger.stats('bots.discord.pw', client.guilds.array().length);
    });
  }

  /* CARBONITEX.NET STATS */
  if (process.env.CARBON_KEY) {
    request.post({
      'url': 'https://www.carbonitex.net/discord/data/botdata.php',
      'headers': {'content-type': 'application/json'},
      'json': true,
      body: {
        'key': process.env.CARBON_KEY,
        'servercount': client.guilds.array().length
      }
    }, (err, res, body) => {
      if (err || res.statusCode != 200) {
        logger.error(`Error updating stats at carbonitex.net:\nBody: ${body}\nStatus Code: ${res.statusCode}\nError: ${err}`);
      }
      logger.stats('carbonitex.net', client.guilds.array().length);
    });
  }
}

function dataDogStats() {
  /* DATADOG STATS */
  if (process.env.DATADOG_APIKEY && process.env.DATADOG_APPKEY) {
    dataDog.send('serverCount', client.guilds.array().length);
    dataDog.send('userCount', client.users.array().length);
    dataDog.send('botUptime', (client.uptime / 1000));
  }
}

/* WHEN BOT SENDS READY EVENT */
client.on('ready', () => {
  logger.info('RuneCord is ready! Listening to ' + client.channels.array().length + ' channels on ' + client.guilds.array().length + ' guilds.');
  versionCheck.checkForUpdate();
  setTimeout(() => {
    database.checkGuilds(client)
  }, 10000);
});

/* WHEN BOT LEAVES A SERVER */
client.on('guildDelete', (guild) => {
  if (!guild.available) return; // If the guild isn't available, do nothing.
  database.handleLeave(guild);
  logger.leave(guild);
  if (process.env.DATADOG_APIKEY && process.env.DATADOG_APPKEY) dataDog.send('serverCount', client.guilds.array().length);
});

/* WHEN BOT JOINS A NEW GUILD */
client.on('guildCreate', (guild) => {
  if (!guild.available) return; // If the guild is available, do nothing.
  if (database.guildIsNew(guild)) {
    logger.join(guild);
    if (config.banned_server_ids && config.banned_server_ids.indexOf(guild.id) > -1) {
      logger.error('Joined guild but it was on the ban list: ' + guild.name);
      client.channels.get(guild.defaultChannel.id).sendMessage('This server is on the ban list, please contact the bot creator to find out why.');
      setTimeout(() => {
        guild.leave();
      }, 1000);
    } else {
      database.addGuild(guild);
    }
  } else {
    if (config.whitelist.indexOf(guild.id) == -1) {
      var toSend = [];
      toSend.push(`:wave: Hi! I'm **${client.user.username}**!`);
      toSend.push(`You can use \`${config.command_prefix}help\` to see what I can do.`);
      toSend.push(`Moderator/Administrator commands *including bot settings* can be viewed with \`${config.mod_command_prefix}help\`.`);
      toSend.push(`For help, feedback, bugs, info, changelogs, etc. Go to **<https://discord.me/runecord>**.`);
      toSend = toSend.join('\n');
      client.channels.get(guild.defaultChannel.id).sendMessage(toSend);
      if (process.env.DATADOG_APIKEY && process.env.DATADOG_APPKEY) dataDog.send('serverCount', client.guilds.array().length);
    }
  }
});

/* WHEN THE BOT RECEIVES A MESSAGE */
client.on('message', (msg) => {
  if (msg.author.id == client.user.id) return; // Do nothing if the message comes from the bot
  if (!msg.content.startsWith(config.command_prefix) && !msg.content.startsWith(config.mod_command_prefix) && !msg.content.startsWith('(eval) ')) return; // Make sure the bot only responds to messages with command prefixes

  /* REMOVE THE SPACE AFTER THE COMMAND PREFIX FOR MOBILE USERS */
  if (msg.content.indexOf(' ') == 1 && msg.content.length > 2) {
    msg.content = msg.content.replace(' ', '');
  }

  /* IF THE MESSAGE IS IN AN IGNORED CHANNEL, DO NOTHING */
  if (msg.channel.type != 'dm' && !msg.content.startsWith(config.mod_command_prefix) && ServerSettings.hasOwnProperty(msg.channel.guild.id)) {
    if (ServerSettings[msg.channel.guild.id].ignore.indexOf(msg.channel.id) > -1) return;
  }

  /* (eval) COMMAND FOR DOING FUNCTIONS INSIDE DISCORD */
  if (msg.content.startsWith('(eval) ')) {
    if (msg.author.id == process.env.ADMIN_ID) {
      evaluateString(msg);
      return;
    } else {
      msg.channel.sendMessage('```diff\n- You do not have permission to use that command!```');
      return;
    }
  }

  /* IF THE MESSAGE TYPE COMES FROM A DIRECT MESSAGE (1-ON-1) */
  if (msg.channel.type == 'dm') {
    if (msg.content[0] !== config.command_prefix && msg.content[0] !== config.mod_command_prefix && !msg.content.startsWith('(eval) ')) {
      if (pmCooldown.hasOwnProperty(msg.author.id)) {
        if (Date.now() - pmCooldown[msg.author.id] > 3000) {
          if (/&(help how do I use this\??)$/i.test(msg.content)) {
            userCommands.commands.help.process(client, msg);
            return;
          }
          pmCooldown[msg.author.id] = Date.now();
          return;
        }
      } else {
        pmCooldown[msg.author.id] = Date.now();
        if (/^(help|how do I use this\??)$/i.test(msg.content)) {
          userCommands.commands.help.process(client, msg);
          return;
        }
        return;
      }
    }
  }

  /* LET US BEING THE CONFUSING COMMAND CRAP */
  var cmd = msg.content.split(' ')[0].replace(/\n/g, ' ').substring(1).toLowerCase(); // What command are we doing?
  var suffix = msg.content.replace(/\n/g, ' ').substring(cmd.length + 2).trim(); // Get everything after the command for suffixes, each suffix is separated with a space

  /* NORMAL USER COMMANDS */
  if (msg.content.startsWith(config.command_prefix)) {
    if (userCommands.commands.hasOwnProperty(cmd)) {
      execCommand(msg, cmd, suffix, 'user');
    } else if (userCommands.aliases.hasOwnProperty(cmd)) {
      msg.content = msg.content.replace(/[^ ]+ /, config.command_prefix + userCommands.aliases[cmd] + ' ');
      execCommand(msg, userCommands.aliases[cmd], suffix, 'user');
    }
  }

  /* MODERATOR COMMANDS */
  if (msg.content.startsWith(config.mod_command_prefix)) {
    if (modCommands.commands.hasOwnProperty(cmd)) {
      execCommand(msg, cmd, suffix, 'mod');
    } else if (modCommands.aliases.hasOwnProperty(cmd)) {
      msg.content = msg.content.replace(/[^ ]+ /, config.mod_command_prefix + modCommands.aliases[cmd] + ' ');
      execCommand(msg, modCommands.aliases[cmd], suffix, 'mod');
    }
  }

});

connect();
