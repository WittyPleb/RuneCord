/* REQUIRED DEPENDENCIES */
require('dotenv').config();
const Discord = require('discord.js');

/* REQUIRED FILES */
const logger = require('./bot/logger.js');
const versionCheck = require('./bot/versionCheck.js');

/* SET OPTIONS AND INIT BOT */
const discordOptions = {'fetch_all_members': true};
const client = new Discord.Client(discordOptions);

/* MAKE THE BOT CONNECT TO DISCORD, IF NO TOKEN IS SET, DO NOT ATTEMPT TO CONNECT */
function connect() {
  if (!process.env.TOKEN) {
    logger.error('Please setup TOKEN in .env to use RuneCord!');
    process.exit(1);
  }

  client.login(process.env.TOKEN);
}

/* WHEN BOT SENDS READY EVENT */
client.on('ready', () => {
  logger.info('RuneCord is ready!');
  versionCheck.checkForUpdate();
});

connect();
