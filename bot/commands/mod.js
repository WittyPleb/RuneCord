/* REQUIRED DEPENDENCIES */
const moment = require('moment');
const os     = require('os');

/* REQUIRED FILES */
const version  = require('../../package.json').version;
const config   = require('../config.json');
const database = require('../data/database.js');
const logger   = require('../logger.js');

/* SEND THE USER HOW TO CORRECTLY USE THE COMMAND */
function correctUsage(cmd, usage, msg, client, delay) {
  msg.channel.sendMessage(`${msg.author.username.replace(/@/g, '@\u200b')}, the correct usage is *\`${config.command_prefix + cmd} ${usage}\`*.`);
}

var commands = {
  'help': {
    desc: 'Sends a DM containing all moderator commands. If a command is specified, gives information on that command.',
    usage: '[command]',
    deleteCommand: true,
    shouldDisplay: false,
    process: (client, msg, suffix) => {
      // TODO: THIS INSANELY CONFUSING HELP COMMAND
    }
  },
  'stats': {
    desc: 'Display statistics about RuneCord.',
    usage: '',
    process: (client, msg) => {
      var days = Math.round(client.uptime / (1000 * 60 * 60 * 24));
      var hours = Math.round(client.uptime / (1000 * 60 * 60)) % 24;
      var minutes = Math.round(client.uptime / (1000 * 60) % 60);

      var timestr = '';

      if (days > 0) {
        timestr += `${days} day${(days > 1 ? 's ' : ' ')}`;
      }

      if (hours > 0) {
        timestr += `${hours} hour${hours > 1 ? 's ' : ' '}`;
      }

      if (hours >= 1) {
        timestr += `and ${minutes} minute${minutes > 0 && minutes < 2 ? '' : 's'}`;
      } else {
        timestr += `${minutes} minute${minutes > 0 && minutes < 2 ? '' : 's'}`;
      }

      var memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
      var totalMem = Math.round(os.totalmem() / 1024 / 1024);
      var percentUsed = Math.round((memUsed / totalMem) * 100);

      var toSend = [];

      toSend.push('```xl');
      toSend.push(`Uptime: ${timestr}.`);
      toSend.push(`Connected to ${client.guilds.array().length} guilds with ${client.channels.array().length} channels and ${client.users.array().length} users.`);
      toSend.push(`Memory Usage: ${memUsed} MB (${percentUsed}%)`);
      toSend.push(`Running RuneCord v${version}`);
      toSend.push(`Commands this session: ${commandsProcessed} (avg ${(commandsProcessed / (client.uptime / (1000 * 60))).toFixed(2)}/min)`);
      toSend.push('```');

      toSend = toSend.join('\n');

      msg.channel.sendMessage(toSend);
    }
  },
  'ignore': {
    desc: 'Make the bot ignore the channel.',
    usage: '',
    deleteCommand: true,
    process: (client, msg) => {
      if (msg.channel.type == 'dm') {
        msg.channel.sendMessage('Can\'t do this in a PM!');
        return;
      }

      if (!msg.channel.permissionsFor(msg.member).hasPermission(0x00000020) && msg.author.id != process.env.ADMIN_ID) {
        msg.channel.sendMessage('You must have permission to manage the guild!');
        return;
      }

      if (!ServerSettings.hasOwnProperty(msg.channel.guild.id)) {
        database.addGuild(msg.channel.guild);
      }

      if (ServerSettings[msg.channel.guild.id].ignore.indexOf(msg.channel.id) > -1) {
        msg.channel.sendMessage('This channel is already ignored.');
      } else {
        database.ignoreChannel(msg.channel.id, msg.channel.guild.id);
        msg.channel.sendMessage(':mute: Okay! I\'ll ignore all commands in this channel from now on.');
      }
    }
  },
  'unignore': {
    desc: 'Make the bot stop ignoring the channel.',
    usage: '',
    deleteCommand: true,
    process: (client, msg) => {
      if (msg.channel.type == 'dm') {
        msg.channel.sendMessage('Can\'t do this in a PM!');
        return;
      }

      if (!msg.channel.permissionsFor(msg.member).hasPermission(0x00000020) && msg.author.id != process.env.ADMIN_ID) {
        msg.channel.sendMessage('You must have permission to mange the guild!');
        return;
      }

      if (!ServerSettings.hasOwnProperty(msg.channel.guild.id)) {
        database.addGuild(msg.channel.guild);
      }

      if (ServerSettings[msg.channel.guild.id].ignore.indexOf(msg.channel.id) == -1) {
        msg.channel.sendMessage('This channel isn\'t ignored.');
      } else {
        database.unignoreChannel(msg.channel.id, msg.channel.guild.id);
        msg.channel.sendMessage(':loud_sound: Okay, I\'ll stop ignoring commands in this channel now.');
      }
    }
  }
}

exports.commands = commands;
