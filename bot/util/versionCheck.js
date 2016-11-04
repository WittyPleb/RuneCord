/* REQUIRED DEPENDENCIES */
const request = require(`request`);

/* REQUIRED FILES */
const logger  = require(`./logger.js`);
const version = require(`../../package.json`).version;

exports.checkForUpdate = () => {
  request(`https://raw.githubusercontent.com/unlucky4ever/RuneCord/master/package.json`, (err, res, body) => {
    if (err) {
      logger.error(`Version check error: ${err}`);
    } else if (res.statusCode == 200) {
      var latest = JSON.parse(body).version;
      if ((version.split(`.`).join(``)) < (latest.split(`.`).join(``))) {
        logger.info(`RuneCord is out of date! (current v${version}) (latest v${latest})`);
      } else {
        logger.info(`RuneCord is up-to-date (v${version})`);
      }
    } else {
      logger.error(`Failed to check for new version. Status code: ${res.statusCode}`);
    }
  });
};
