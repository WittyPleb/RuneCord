const bunyan = require('bunyan');
const chalk  = require('chalk');
const moment = require('moment');
const R      = require('ramda');

const production = (process.env.NODE_ENV === 'production');
const config     = {name: 'runecord'};
const logger     = bunyan.createLogger(config);

function _submitToLogger(type, msg) {
  if (R.is(Object, msg)) return logger[type](msg, msg.message || '');
  return logger[type](msg);
}

function cmd(cmd, suffix, guild, user) {
  if (production) return logger.info({cmd, suffix}, 'cmd');
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), chalk.bold.green('[COMMAND]'), chalk.bold.green(guild) + ' > ' + chalk.bold.green(user) + ' > ' + chalk.bold.green(cmd), suffix);
}

function modCmd(cmd, suffix, server, user) {
  if (production) return logger.info({cmd, suffix}, 'modCmd');
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.bold.magenta('[MOD COMMAND]'), chalk.bold.magenta(server) + ' > ' + chalk.bold.magenta(user) + ' > ' + chalk.bold.magenta(cmd), suffix);
}

function info(msg) {
  if (production) return _submitToLogger('info', msg);
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), msg);
}

function warn(msg) {
  if (production) return _submitToLogger('warn', msg);
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), chalk.yellow(`[WARN] ${msg}`));
}

function error(msg) {
  if (production) return _submitToLogger('error', msg);
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), chalk.red(`[ERROR] ${msg}`));
}

module.exports = { cmd, modCmd, info, warn, error };
