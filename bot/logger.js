const bunyan = require('bunyan');
const chalk  = require('chalk');
const moment = require('moment');
const R      = require('ramda');

const production = (process.env.NODE_ENV === 'production');
const config     = {name: 'runecord'};
const logger     = bunyan.createLogger(config);

let chalkConstructor = new chalk.constructor({enabled: true});
let logTime = chalkConstructor.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`);

function _submitToLogger(type, msg) {
  if (R.is(Object, msg)) return logger[type](msg, msg.message || '');
  return logger[type](msg);
}

function cmd(cmd, suffix, guild, user) {
  if (production) return logger.info({cmd, suffix}, 'cmd');
  console.log(logTime, chalkConstructor.bold.green('[COMMAND]'), chalkConstructor.bold.green(guild) + ' > ' + chalkConstructor.bold.green(user) + ' > ' + chalkConstructor.bold.green(cmd), suffix);
}

function modCmd(cmd, suffix, server, user) {
  if (production) return logger.info({cmd, suffix}, 'modCmd');
  console.log(chalkConstructor.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalkConstructor.bold.magenta('[MOD COMMAND]'), chalkConstructor.bold.magenta(server) + ' > ' + chalkConstructor.bold.magenta(user) + ' > ' + chalkConstructor.bold.magenta(cmd), suffix);
}

function join(guildName) {
  if (production) return logger.info({guildName}, 'join');
  console.log(logTime, chalkConstructor.bold.yellow('[JOINED]'), chalkConstructor.bold.yellow(guildName));
}

function info(msg) {
  if (production) return _submitToLogger('info', msg);
  console.log(logTime, msg);
}

function warn(msg) {
  if (production) return _submitToLogger('warn', msg);
  console.log(logTime, chalkConstructor.yellow(`[WARN] ${msg}`));
}

function error(msg) {
  if (production) return _submitToLogger('error', msg);
  console.log(logTime, chalkConstructor.red(`[ERROR] ${msg}`));
}

module.exports = { cmd, modCmd, join, info, warn, error };
