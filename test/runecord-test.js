const expect = require("chai").expect;
const assert = require("chai").assert;
const request = require("request");
const Discord = require("discord.js");
const client = new Discord.Client();
const glob = require("glob-all");
const CLIEngine = require("eslint").CLIEngine;
const engine = new CLIEngine({
  envs: ["node", "mocha"],
  useEslintrc: true
});

const paths = glob.sync([
  "./+(bot|test)/**/*.js",
  "./*.js"
]);

const results = engine.executeOnFiles(paths).results;

describe("ESLint", () => {
  results.forEach((result) => generateTest(result));
});

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

function generateTest(result) {
  const {
    filePath,
    messages
  } = result;

  it("validates " + filePath, () => {
    if (messages.length > 0) {
      assert.fail(false, true, formatMessages(messages));
    }
  });
}

function formatMessages(messages) {
  const errors = messages.map((message) => {
    return message.line + ":" + message.column + " " + message.message.slice(0, -1) + " - " + message.ruleId + "\n";
  });

  return "\n" + errors.join("");
}
