const request = require(`request`);
const config  = require(`../config.json`);
const logger  = require(`./logger.js`);

module.exports = count => {
  updateCarbon(count);
  updateDiscord(count);
}

/* eslint-disable no-unused-vars */
const updateCarbon = count => {
  if (process.env.CARON_KEY === ``) return; // No carbon key is set

  logger.info(`Updating Carbon...`);
  request.post({
    'url': `https://www.carbonitex.net/discord/data/botdata.php`,
    'headers': {'content-type': `application/json`},
    'json': true,
    body: {
      'key': process.env.CARBON_KEY,
      'servercount': count
    }
  }, (err, res, body) => {
    if (!err) console.log(`SUCCESSFULL CARBON UPDATE`, count);
  });
}

const updateDiscord = count => {
  if (process.env.DISCORD_BOTS_KEY === ``) return; // No Discord.pw key is set
  logger.info(`Updating Discord.pw...`);
  request.post({
    'url': `https://bots.discord.pw/api/bot/${config.bot.user_id}/stats`,
    'headers': {'content-type': `application/json`},
    json: true,
    body: {
      'server_count': count
    }
  }, (err, res, body) => {
    if (!err) console.log(`SUCCESSFULL DISCORD.PW UPDATE`, count);
  });
}
/* eslint-enable no-unused-vars */
