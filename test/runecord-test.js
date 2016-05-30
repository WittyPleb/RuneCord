"use strict"

const assert = require("chai").assert;
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
