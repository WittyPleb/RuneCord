/* REQUIRED DEPENDENCIES */
require('dotenv').config();
const Discord = require('discord.js');

/* REQUIRED FILES */
const logger = require('./bot/logger.js');

/* SET OPTIONS AND INIT BOT */
const discordOptions = {'fetch_all_members': true};
const client = new Discord.Client(discordOptions);

/* WHEN BOT SENDS READY EVENT */
client.on('ready', () => {
  logger.info('Ready');
});

client.login(process.env.TOKEN);
