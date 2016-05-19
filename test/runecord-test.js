/**
 * Required Dependencies
 */
const Discord = require("discord.js");
const chalk = require("chalk");
const client = new Discord.Client();

const clk = new chalk.constructor({
    enabled: true
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

client.on("ready", function() {
    pass("Received ready");

    exit();
});

client.loginWithToken(process.env.TOKEN).then(function() {
    pass("Valid login token");
}).catch(function(e) {
    err("Bad token");
    console.log("Error logging in: " + e);
});

function exit() {
    section("Exiting");

    client.logout().then(function() {
        pass("Logged out.");
        done();
    }).catch(function(e) {
        err("Couldn't log out: " + e);
    });
}

function done() {
    section("Report");
    pass("All tests done.");
    process.exit(0);
}
