var assert = require("chai").assert;
var glob = require("glob-all");
var CLIEngine = require("eslint").CLIEngine;
var engine = new CLIEngine({
  envs: ["node", "mocha"],
  useEslintrc: true
});
var paths = glob.sync(["./+(bot|test)/**/*.js", "./*.js"]);
var results = engine.executeOnFiles(paths).results;
require("dotenv").config();
describe("ESLint", () => {
  results.forEach((result) => generateTest(result));
});
describe("Environment Variables", () => {
  it("token is defined", () => {
    assert(process.env.TOKEN !== undefined, "environment variable 'TOKEN' is undefined");
  });
  it("twitter api is defined", () => {
    assert(process.env.TWITTER_API !== undefined, "environment variable 'TWITTER_API' is undefined");
  });
  it("application id is defined", () => {
    assert(process.env.APP_ID !== undefined, "environment variable 'APP_ID' is undefined");
  });
  it("admin id is defined", () => {
    assert(process.env.ADMIN_ID !== undefined, "environment variable 'ADMIN_ID' is undefined");
  });
});

function generateTest(result) {
  var {
    filePath,
    messages
  } = result;
  it("validates " + filePath, () => {
    if(messages.length > 0) {
      assert.fail(false, true, formatMessages(messages));
    }
  });
}

function formatMessages(messages) {
  var errors = messages.map((message) => {
    return message.line + ":" + message.column + " " + message.message.slice(0, -1) + " - " + message.ruleId + "\n";
  });
  return "\n" + errors.join("");
}