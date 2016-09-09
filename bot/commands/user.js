var commands = {
  'help': {
    desc: 'Sends a DM containing all of the commands. If a command is specified, it gives info on that command.',
    usage: '[command]',
    deleteCommand: true,
    shouldDisplay: false,
    cooldown: 1,
    process: (client, msg, suffix) => {
      msg.author.sendMessage('You asked for help?');
    }
  }
};

exports.commands = commands;
