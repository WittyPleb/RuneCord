var Discord = require("discord.js");
var chalk = require("chalk");
var clk = new chalk.constructor({
    enabled: true
});
var client = new Discord.Client();
var config = require("../bot/config.json");

cYellow = clk.bold.yellow;
cRed = clk.bold.red;
cGreen = clk.bold.green;

var passes = 0,
    failes = 0;

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

client.loginWithToken(config.token).then(function() {
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
