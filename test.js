/* REQUIRED DEPENDENCIES */
require(`dotenv`).config();
const assert    = require(`chai`).assert;
const glob      = require(`glob-all`);
const CLIEngine = require(`eslint`).CLIEngine;

/* LOCAL VARIABLES */
var engine = new CLIEngine({
  envs: [`node`, `mocha`],
  useEslintrc: true
});

var paths = glob.sync([`./+(bot)/**/*.js`, `./*.js`]);
var results = engine.executeOnFiles(paths).results;

/* STEP 1, CHECK FOR CODING ERRORS IN FILES */
describe(`ESLint`, () => {
  results.forEach((result) => generateTest(result));
});

/* STEP 2, CHECK IF REQUIRED ENVIRONMENT VARIABLES ARE DEFINED */
describe(`Environment Variables`, () => {
  it(`token is defined`, () => {
    assert(process.env.TOKEN !== undefined, `environment variable "TOKEN" is undefined`);
  });
  it(`twitter api is defined`, () => {
    assert(process.env.TWITTER_API !== undefined, `environment variable "TWITTER_API" is undefined`);
  });
  it(`application id is defined`, () => {
    assert(process.env.APP_ID !== undefined, `environment variable "APP_ID" is undefined`);
  });
  it(`admin id is defined`, () => {
    assert(process.env.ADMIN_ID !== undefined, `environment variable "ADMIN_ID" is undefined`);
  });
});

/* TEST THE FILES */
function generateTest(result) {
  var {
    filePath,
    messages
  } = result;
  it(`validates ${filePath}`, () => {
    if (messages.length > 0) {
      assert.fail(false, true, formatMessages(messages));
    }
  });
}

/* FORMAT THE ERROR MESSAGES */
function formatMessages(messages) {
  var errors = messages.map((message) => {
    return `${message.line}:${message.column} ${message.message.slice(0, -1)} - ${message.ruleId}\n`;
  });
  return `\n${errors.join(``)}`;
}
