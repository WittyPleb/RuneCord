const expect = require("chai").expect;
const request = require("request");
const Discord = require("discord.js");
const client = new Discord.Client();

describe("Token", () => {
    it("valid token", () => {
        client.loginWithToken(process.env.TOKEN).then(() => {
            done();
        });
    });
});
describe("Log In", () => {
    it("returns ready", () => {
        client.on("ready", () => {
            done();
        });
    });
});
describe("Twitter API", () => {
    var url = "https://cdn.syndication.twimg.com/widgets/timelines/" + process.env.TWITTER_API + "?&lang=en&supress_response_codes=true&rnd=" + Math.random();

    it("returns status 200", () => {
        /* eslint-disable no-unused-vars */
        request(url, (error, response, body) => {
            /* eslint-enable no-unused-vars */
            expect(response.statusCode).to.equal(200);
            done();
        });
    });
});
describe("Logout", () => {
    it("logs out", () => {
        client.logout().then(() => {
            done();
        });
    });
});
