/**
 * Required Dependencies
 */
const dotenv = require("dotenv");
const Discord = require("discord.js");
const chalk = require("chalk");
const request = require("request");
const client = new Discord.Client();

const clk = new chalk.constructor({
    enabled: true
});

dotenv.load({
    path: ".env"
});

cYellow = clk.bold.yellow;
cRed = clk.bold.red;
cGreen = clk.bold.green;

function section(s) {
    console.log(cYellow("\n    ") + cYellow(s));
}

function pass(msg) {
    console.log(cGreen("      ✓ ") + chalk.italic(msg));
}

function err(msg) {
    console.log(cRed("      ✗ ") + chalk.italic(msg));
    process.exit(1);
}

console.log(cYellow("Beginning Bot Test"));

section("Logging In");

client.on("ready", () => {
    pass("Received ready");

    exit();
});

client.loginWithToken(process.env.TOKEN).then(() => {
    pass("Valid login token");
}).catch((e) => {
    err("Bad token");
    console.log("Error logging in: " + e);
});
if (process.env.TWITTER_API) {
    request("https://cdn.syndication.twimg.com/widgets/timelines/" + process.env.TWITTER_API + "?&lang=en&supress_response_codes=true&rnd=" + Math.random(), (err, res, body) => {
        if (res.statusCode == 404 || err) {
            err("Invalid Twitter API");
            console.log("Twitter API failed: " + err);
        }

        if (!err && res.statusCode == 200 && body) {
            pass("Valid Twitter API");
        }
    });
}

function exit() {
    section("Exiting");

    client.logout().then(() => {
        pass("Logged out.");
        done();
    }).catch((e) => {
        err("Couldn't log out: " + e);
    });
}

function done() {
    section("Report");
    pass("All tests done.");
    process.exit(0);
}
