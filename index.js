/* REQUIRED DEPENDENCIES */
require('dotenv').config();
const Discord = require('discord.js');
const fs      = require('fs');

/* REQUIRED FILES */
const logger       = require('./bot/logger.js');
const versionCheck = require('./bot/versionCheck.js');
const database     = require('./bot/data/database.js');

/* SET OPTIONS AND INIT BOT */
const discordOptions = {'fetch_all_members': true};
const client         = new Discord.Client(discordOptions);

/* MAKE THE BOT CONNECT TO DISCORD, IF NO TOKEN IS SET, DO NOT ATTEMPT TO CONNECT */
function connect() {
  if (!process.env.TOKEN) {
    logger.error('Please setup TOKEN in .env to use RuneCord!');
    process.exit(1);
  }

  client.login(process.env.TOKEN).then(checkDb());
}

function checkDb() {
  try {
    fs.statSync('./bot/data/guilds.json');
  } catch (e) {
    logger.warn('\'bot/data/guilds.json\' doesn\'t exist... Creating!');
    fs.writeFileSync('./bot/data/guilds.json', '{}');
  }
}

/* WHEN BOT SENDS READY EVENT */
client.on('ready', () => {
  logger.info('RuneCord is ready!');
  versionCheck.checkForUpdate();
  setTimeout(() => {
    database.checkGuilds(client)
  }, 10000);
});

/* WHEN BOT JOINS A NEW GUILD */
client.on('guildCreate', (guild) => {
  if (database.guildIsNew(guild)) {
    logger.info(chalk.bold.green('[JOINED] ') + guild.name);
    if (config.banned_server_ids && config.banned_server_ids.indexOf(guild.id) > -1) {
      logger.error('Joined guild but it was on the ban list: ' + guild.name);
      guild.defaultChannel.sendMessage('This server is on the ban list, please contact the bot creator to find out why.');
      setTimeout(() => {
        guild.leave();
      }, 1000);
    } else {
      database.addGuild(guild);
    }
  } else {
    if (config.whitelist.indexOf(guild.id) == -1) {
      var toSend = [];
      toSend.push(':wave: Hi! I\'m **' + client.user.username + '**');
      toSend.push('You can use `' + config.command_prefix + 'help` to see what I can do. Moderators can use `' + config.mod_command_prefix + 'help` for moderator commands.');
      toSend.push("Moderator/Administrator commands *including bot settings* can be viewed with `" + config.mod_command_prefix + "help`");
      toSend.push("For help, feedback, bugs, info, changelogs, etc. go to **<https://discord.me/runecord>**");
      guild.defaultChannel.sendMessage(toSend);
    }
  }
})

connect();
