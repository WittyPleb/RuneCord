var bunyan = require('bunyan');
var chalk = require('chalk');
var moment = require('moment');
var R = require('ramda');

var production = (process.env.NODE_ENV === 'production');
var cfg = {name: 'runecord'};
var logger = bunyan.createLogger(cfg);

function _submitToLogger(type, msg) {
  if (R.is(Object, msg)) return logger[type](msg, msg.message || '');
  return logger[type](msg);
}

function cmd(cmd, suffix) {
  if (production) return logger.info({cmd, suffix}, 'cmd');
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.bold.green('[COMMAND]'), chalk.bold.green(cmd), suffix);
}

function modCmd(cmd, suffix) {
  if (production) return logger.info({cmd, suffix}, 'modCmd');
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.bold.magenta('[MOD COMMAND]'), chalk.bold.green(cmd), suffix);
}

function debug(msg) {
  if (production) return;
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.bgWhite.black('DEBUG'), msg);
}

function info(msg) {
  if (production) return _submitToLogger('info', msg);
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), msg);
}

function warn(msg) {
  if (production) return _submitToLogger('warn', msg);
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.yellow('[WARN] ' + msg));
}

function error(msg) {
  if (production) return _submitToLogger('error', msg);
  console.log(chalk.cyan('[' + moment().format('YYYY-MM-DD HH:mm:ss') + ']'), chalk.red('[ERROR] ' + msg));
}

module.exports = {cmd, modCmd, debug, info, warn, error};
