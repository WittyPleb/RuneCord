<<<<<<< HEAD
const bunyan = require('bunyan');
const chalk  = require('chalk');
const moment = require('moment');
const R      = require('ramda');

const production = (process.env.NODE_ENV === 'production');
const config     = {name: 'runecord'};
const logger     = bunyan.createLogger(config);
=======
var bunyan = require('bunyan');
var chalk = require('chalk');
var moment = require('moment');
var R = require('ramda');

var production = (process.env.NODE_ENV === 'production');
var cfg = {name: 'runecord'};
var logger = bunyan.createLogger(cfg);

chalk = new chalk.constructor({
  enabled: true
});
>>>>>>> master

function _submitToLogger(type, msg) {
  if (R.is(Object, msg)) return logger[type](msg, msg.message || '');
  return logger[type](msg);
}

<<<<<<< HEAD
function cmd(cmd, suffix, guild, user) {
  if (production) return logger.info({cmd, suffix}, 'cmd');
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), chalk.bold.green('[COMMAND]'), chalk.bold.green(guild) + ' > ' + chalk.bold.green(user) + ' > ' + chalk.bold.green(cmd), suffix);
=======
function cmd(cmd, suffix, server, user) {
  if (production) return logger.info({cmd, suffix}, 'cmd');
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.bold.green('[COMMAND]'), chalk.bold.green(server) + ' > ' + chalk.bold.green(user) + ' > ' + chalk.bold.green(cmd), suffix);
>>>>>>> master
}

function modCmd(cmd, suffix, server, user) {
  if (production) return logger.info({cmd, suffix}, 'modCmd');
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.bold.magenta('[MOD COMMAND]'), chalk.bold.magenta(server) + ' > ' + chalk.bold.magenta(user) + ' > ' + chalk.bold.magenta(cmd), suffix);
}

<<<<<<< HEAD
function info(msg) {
  if (production) return _submitToLogger('info', msg);
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), msg);
=======
function debug(msg) {
  if (production) return;
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.bgWhite.black('[DEBUG]'), msg);
}

function info(msg) {
  if (production) return _submitToLogger('info', msg);
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), msg);
>>>>>>> master
}

function warn(msg) {
  if (production) return _submitToLogger('warn', msg);
<<<<<<< HEAD
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), chalk.yellow(`[WARN] ${msg}`));
=======
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.yellow('[WARN] ' + msg));
>>>>>>> master
}

function error(msg) {
  if (production) return _submitToLogger('error', msg);
<<<<<<< HEAD
  console.log(chalk.cyan(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`), chalk.red(`[ERROR] ${msg}`));
}

module.exports = { cmd, modCmd, info, warn, error };
=======
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.red('[ERROR] ' + msg));
}

module.exports = {cmd, modCmd, debug, info, warn, error};
>>>>>>> master
