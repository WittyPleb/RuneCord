/* REQUIRED FILES */
const config = require('../config.json');
const version = require('../../package.json').version;

var aliases = {
  'h': 'help',
  'commands': 'help'
};

var commands = {
  'help': {
    desc: 'Sends a DM containing all of the commands. If a command is specified, it gives info on that command.',
    usage: '[command]',
    deleteCommand: true,
    shouldDisplay: false,
    process: (client, msg, suffix) => {
      var toSend = [];

      /* WANTS THE ENTIRE HELP LIST */
      if (!suffix) {
        toSend.push('Use `' + config.command_prefix + 'help <command name` to get more information on a command.\n');
        toSend.push('Moderator commands can be found using `' + config.mod_command_prefix + 'help`.\n');
        toSend.push('You can find the list online at https://unlucky4ever.github.io/RuneCord/\n');
        toSend.push('**Commands:**```\n');
        Object.keys(commands).forEach((cmd) => {
          if (commands[cmd].hasOwnProperty('shouldDisplay')) {
            if (commands[cmd].shouldDisplay) {
              toSend.push('\n' + config.command_prefix + cmd + ' ' + commands[cmd].usage + '\n\t#' + commands[cmd].desc);
            }
          } else {
            toSend.push('\n' + config.command_prefix + cmd + ' ' + commands[cmd].usage + '\n\t#' + commands[cmd].desc);
          }
        });
        toSend = toSend.join('');

        /* IF THE MESSAGE IS OVER 1990 CHARACTERS */
        if (toSend.length > 1990) {
          msg.author.sendMessage(toSend.substr(0, 1990).substr(0, toSend.substr(0, 1990).lastIndexOf('\n\t')) + '```');
          setTimeout(() => {
            msg.author.sendMessage('```' + toSend.substr(toSend.substr(0, 1990).lastIndexOf('\n\t')) + '```');
          }, 1000);
        } else {
          msg.author.sendMessage(toSend + '```');
        }
      } else {
        suffix = suffix.trim().toLowerCase();
        if (commands.hasOwnProperty(suffix)) {
          toSend.push('`' + config.command_prefix + suffix + ' ' + commands[suffix].usage + '`\n');
          if (commands[suffix].hasOwnProperty('info')) {
            toSend.push(commands[suffix].info);
          } else if (commands[suffix].hasOwnProperty('desc')) {
            toSend.push(commands[suffix].desc);
          }

          if (commands[suffix].hasOwnProperty('deleteCommand')) {
            toSend.push('\n*Can delete the activating message*');
          }

          toSend = toSend.join('');

          msg.author.sendMessage(toSend);

        } else {
          msg.author.sendMessage('Command `' + suffix + '` not found. Aliases aren\'t allowed.').then(msg.delete(10000));
        }
      }
    }
  },
  'invite': {
    desc: 'Get an invite link for the bot, to invite to your own server.',
    deleteCommand: true,
    usage: '',
    process: (bot, msg) => {
      msg.channel.sendMessage('Use this to bring me to your server: <https://discordapp.com/oauth2/authorize?&client_id=' + process.env.APP_ID + '&scope=bot&permissions=12659727>');
    }
  },
  'about': {
    desc: 'Get information about RuneCord.',
    deleteCommand: true,
    usage: '',
    process: (bot, msg) => {
      var toSend = [];
      toSend.push('__Author:__ Witty <witty.twitch@gmail.com>');
      toSend.push('__Library:__ Discord.js');
      toSend.push('__Version:__ ' + version);
      toSend.push('__GitHubPage:__ <https://github.com/unlucky4ever/RuneCord>');
      toSend.push('__Donate:__ <https://paypal.me/unluck4ever>');
      toSend.push('__Official Server:__ <https://discord.me/runecord>');
      toSend = toSend.join('\n');

      msg.channel.sendMessage(toSend);
    }
  },
  'time': {
    desc: 'Tells you the time in-game.',
    usage: '',
    process: (bot, msg) => {
      function addZero(i) {
        if (i < 10) i = '0' + i;
        return i;
      }

      var d = new Date();

      msg.channel.sendMessage('The current time in-game is **' + addZero(d.getUTCHours()) + ':' + d.getUTCMinutes() + '**.');
    }
  },
  'reset': {
    desc: 'Displays how long until the game resets.',
    usage: '',
    process: (bot, msg) => {
      var now = Date.now();
      var then = new Date();
      then.setUTCHours(24, 0, 0, 0);

      var resetTime = then - now;
      var hours = Math.floor(resetTime / 1000 / 60 / 60);
      resetTime -= hours * 1000 * 60 * 60;

      var minutes = Math.floor(resetTime / 1000 / 60);
      resetTime -= minutes * 1000 * 60;

      var timestr = '';

      if (hours > 0) {
        timestr += hours + ' hour' + (hours > 1 ? 's ' : ' ');
      }

      if (minutes > 0) {
        timestr += minutes + ' minute' + (minutes > 1 ? 's.' : '.');
      }

      msg.channel.sendMessage('The game will reset in ' + timestr);
    }
  },
  'bigchin': {
    desc: 'Lets you know when the next Big chinchompa D&D starts.',
    usage: '',
    process: (bot, msg) => {
      var d = new Date();
      var secondsUntil = 3600 - (d.getUTCMinutes() + 30) % 60 * 60 - d.getUTCSeconds();
      var minutesUntil = Math.floor(secondsUntil / 60);
      timestr = '';

      if (minutesUntil == 0) {
        timestr += '1 hour';
      }

      if (minutesUntil > 0) {
        timestr += minutesUntil + ' minute' + (minutesUntil > 0 && minutesUntil < 1 ? '' : 's');
      }

      msg.channel.sendMessage('The next Big chinchompa will start in ' + timestr);
    }
  }
};

exports.commands = commands;
exports.aliases = aliases;
