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

function cmd(cmd, suffix, user, guild = null, type = null) {
  if (production) return logger.info({cmd, suffix}, 'cmd');

  if (!guild) {
    if (type === 'mod') {
      console.log(logTime, chalkConstructor.bold.magenta('[MOD COMMAND]'), `${chalkConstructor.bold.magenta(user)} > ${chalkConstructor.bold.magenta(cmd)}`, suffix);
    } else {
      console.log(logTime, chalkConstructor.bold.green('[COMMAND]'), `${chalkConstructor.bold.green(user)} > ${chalkConstructor.bold.green(cmd)}`, suffix);
    }
  } else {
    if (type === 'mod') {
      console.log(logTime, chalkConstructor.bold.magenta('[MOD COMMAND]'), `${chalkConstructor.bold.magenta(guild.name)} > ${chalkConstructor.bold.magenta(user)} > ${chalkConstructor.bold.magenta(cmd)}`, suffix);
    } else {
      console.log(logTime, chalkConstructor.bold.green('[COMMAND]'), `${chalkConstructor.bold.green(guild.name)} > ${chalkConstructor.bold.green(user)} > ${chalkConstructor.bold.green(cmd)}`, suffix);
    }
  }
}

function join(guild) {
  let name = guild.name;
  if (production) return logger.info({name}, 'join');
  console.log(logTime, chalkConstructor.bold.yellow('[JOINED]'), `${chalkConstructor.bold.yellow(name)} (${chalkConstructor.bold.yellow(guild.id)})`);
}

function stats(site, count) {
  if (production) return logger.info({site, count}, 'stats');
  console.log(logTime, chalkConstructor.bold.blue('[STATS]'), `Updated stats at ${chalkConstructor.bold.blue(site)} to ${chalkConstructor.bold.blue(count)} guilds.`);
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

module.exports = { cmd, join, stats, info, warn, error };
