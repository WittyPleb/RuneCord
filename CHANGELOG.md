# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

<!-- ## [0.0.0] - YYYY-MM-DD
### Added
### Changed
### Fixed
### Removed -->

[Unpublished] - 2017-03-05
### Added
- Added `~vis` and `~wax` aliases to the `~viswax` command.

### Changed
- Cleaned up `~rots` command.
- Cleaned up `~vorago` command.
- Cleaned up `~araxxi` command.
- Updated all dependencies.

### Fixed

### Removed
- Removed everything to do with MixPanel.

[4.0.4] - 2017-01-31
### Added
- Added `~memberinfo` command.

### Changed
- Updated deprecated code.

### Fixed
- Fix for people who don't use MixPanel.

### Removed
- Removed `twitterId` requireming for `~vos` command.

## [4.0.3] - 2016-12-23
### Changed
- Made `eval` command 'stringify' objects now if the result is an object.
- Cleaned up reloads.
- Cleaned up docs.

### Fixed
- Fixed `alog` command showing invalid dates.
- Fixed not being able to DM commands to RuneCord.
- Fixed `lamp` command not working for medium lamps.

## [4.0.2] - 2016-12-06
### Added
- Added tracking for various things
    - All commands with the following information is logged and stored:
        - Server Name
        - Server ID
        - Username
        - User ID
        - Command Name
        - Arguments used in command
        - Channel ID
        - Channel Name
    - All guild joins and guild removes store the following information:
      - Server Name
      - Server ID
      - Owner Username
      - Owner ID
      - Users Connected
      - Channels

### Changed
- Made `)stats` command use embeds to look prettier.
- Made `~about` command use embeds to look prettier.
- Made `~statues` command use embeds to look prettier.
- Got a new domain for the website, and updated it in all areas.

## [4.0.1] - 2016-11-30
### Added
- Added CodeClimate code testing (doesn't impact performance at all).

### Changed
- Changed `config.json` to `config.json.example`.
- Re-enabled welcome message for new guilds.
- Updated `~roll` command usage.

### Fixed
- Fixed an `unhandledRejection` error in multiple cases.
- Fixed a `guildCreate` event error.
- Fixed bot server count posting.
- Fixed a typo in `~vos` command.
- Fixed a typo in `~price` command.
- Fixed an ESLint error.

### Removed
- Some unnecessary code.

## [4.0.0] - 2016-11-29
### Added
- Cooldowns are back, they are set very low, they are to ensure the bot doesn't get overloaded.
- Sharding - the bot now has shards, which allows it to perform better.
- Random games for the bot to play.

### Changed
- Rewrote the bot in the Eris library.
- Changed how logging works entirely.
- Changed from using `request` library to using `superagent` library.
- Made commands use a CommandHandler class.
    - Commands are now separated in their own individual files.
- `~alog` command now truncates text (cuts off) after 40 characters and adds an automatic ellipsis (...).
- Made `~statues` command have prettier output.
- Made `)stats` command have prettier output.
- Changed how `)settings` works, see [Documentation](https://runecord.xyz/docs/index.html) for more information.
    - You can now ignore each individual command as you wish.
        - You can ignore the command for a specific user, a specific channel, or the entire server.

<!-- ### Fixed -->
### Removed
- Removed `.env` stuff, it's now handled in `config.json`.
- Removed all DataDog stuff.
- Remove `~memberinfo` command.

## [3.2.0] - 2016-11-04
### Added
- Added checks for server inactivity every hour.
    - Made the checks log the amount to DataDog for my personal use.
- Added disconnect check for bot.
- Added a new value for the bot user ID to `config.json`. Required if you use `bots.discord.pw` for stats!

### Changed
- Made viswax pulling faster - Thank you [@duke605](https://github.com/duke605).
- Changed `.eslintrc` rules.
    - Added `camelcase` rule to enforce camelCasing in the code.
    - Added `dot-notation` rule to enforce using dot notation.
    - Added `comma-spacing` rule to enforce a space after commas.
    - Added `key-spacing` rule to enforce a space after keys and values in objects.
    - Added `quotes` rule to warn when you don't use backticks for strings (`` ` ``).
    - Changed `no-unused-vars` rules to warn instead of error out.
- Updated `bunyan` lib from `v1.8.1` to `v1.8.4`.
- Updated `discord.js` lib from `v9.3.0` to `v10.0.1`.
- Updated `moment` lib from `v2.15.0` to `v2.15.2`.
- Updated `request` lib from `v2.74.0` to `v2.78.0`.

### Fixed
- Fixed all ESLint errors & warnings with the new rules.

### Removed
- Removed `~osstats` command. Bot will be exclusive to RS3 from now on.

## [3.1.2] - 2016-11-01
### Added
- Added `~spooder` alias for `~araxxi` - Thank you [@mymemine](https://github.com/mymemine).
- Added time database for tracking inactive servers.

### Changed
- Made `~lamp` easier to understand. - Thank you [@duke605](https://github.com/duke605).

### Fixed
- Fixed a typo in `~rots` command.

## [3.1.1] - 2016-10-14
### Added
- Added DataDog metrics.
- Added `discord.js` lib version to `~about` command.

### Changed
- Updated `discord.js` lib from version `9.2.0` to version `9.3.0`.

### Fixed
- Fixed time til next cache.

## [3.1.0] - 2016-09-21
### Added
- Added a new `~memberinfo` command to find information on a user (title and clan).
- Re-added a `~warbands` command.

### Changed
- Made `~cache` command show when you can get a boost, and updated to use the new hourly cache.

### Fixed
- Fixed logging for when the bot joins a server.
- Fixed bot crashing if `~price` command breaks when the site is working, but the information isn't able to be pulled.
- Fixed bot crashing if `~alog` command had less than 10 entries.

## [3.0.3] - 2016-09-16
### Changed
- Cleaned up all logging features.

## [3.0.2] - 2016-09-14
### Added
- Added bot welcome messages again on first join.
- Added more checks to `~vos` command.
- Added more checks to `~stats` command.
- Added more checks to `~alog` command.
- Added more checks to `~osstats` command.
- Added an error message for `~price` command.

### Changed
- Updated `discord.js` lib from version `9.1.1` to version `9.2.0`.
- Updated `moment` lib from version `2.14.1` to version `2.15.0`.
- Cleaned up response from `(eval)` command.
- Made `~time` command minutes have a 0 in front of it if less than 10.

### Fixed
- Fixed bot crashing if `guilds.json` wasn't created by forcing it to create itself if it doesn't exist.

## [3.0.1] - 2016-09-11
### Added
- Added test file for RuneCord 3.0.1.

### Changed
- Updated `discord.js` lib from version `9.0.2` to version `9.1.1`.

### Fixed
- Fixed minor bug with mod command aliases that caused a crash.
- Fixed minor bug with logging that caused a crash.
- Fixed minor bug with `~viswax` command that could sometimes cause a crash.
- Fixed weird bug with `~bigchin` command.

## [3.0.0] - 2016-09-09
### Changed
- Updated `discord.js` lib from version `8.0.0` to version `9.0.2`.
- Updated `request` lib from version `2.72.0` to version `2.74.0`.
- Reorganized files.
- Rewrote entire bot to work with version `9.0.2` `discord.js` library.
- Rewrote all commands.

### Removed
- Removed times database, no longer needed.
- Removed ability to track inactive servers, no longer needed.
- Removed ability to mention bot for commands. Too buggy, will come back to it another time.
- Removed all command cooldowns.
- Removed ability to turn off command cooldowns, since they are now removed.
- Removed `)serverinfo`, `)userinfo`, and `)announce` commands.

## [2.3.6] - 2016-09-07
### Added
- Added server count posting to [Discord bots](https://bots.discord.pw).

### Fixed
- Fixed Carbon stats posting correctly.

### Removed
- Removed unused global variables from `.eslintrc`.

## [2.3.5] - 2016-08-30
### Changed
- Changed how stats are posted to Carbon.
- Changed how the bot starts up.
- Changed how the bot disconnects.
- Changed how bot logs to console.

### Fixed
- Fixed `~statues` command calculating for 5 statues instead of 6.
- Fixed mod commands being used while mentioning bot.

### Removed
- Disabled `~warbands` commands temporarily.

## [2.3.4] - 2016-07-25
### Changed
- Made `)userinfo` able to use mentions to lookup information on other users.
- Clarified `~statues` command.
- Made `~pengs` command work if level suffix is voided.

### Fixed
- Fixed bot uptime to show correct values.

## [2.3.3] - 2016-07-14
### Added
- Added `)userinfo` command.
- Added more information to `)serverinfo` command.
- Added moment.js support.

### Changed
- Converted `)stats` command to use moment.js.

### Removed
- Removed `~id` command.

## [2.3.2] - 2016-07-08
### Fixed
- Fixed `~alog` command from showing '&amp;apos&semi;' for K'ril and Kree kills.
- Fixed `~rots` command having wrong rotations.

## [2.3.1] - 2016-06-12
### Changed
- Updated discord.js library to version 8.0.0.
- Updated devDependencies to latest versions.

### Fixed
- Fixed the response message when you mess up the `~jot` command.
- Fixed `~pengs` response message if you didn't put in a valid number for level.

## [2.3.0] - 2016-06-06
### Added
- Added `~jot` command - Displays how much XP you'd gain from Jack of Trades based on type and skill level.
- Added `~statues` command - Displays how much XP a specific user would gain in Construction, Prayer, and Slayer, from God statues.
- Added `~raven` command - Displays when the next Raven will spawn in Prifddinas.
- Added `~sinkhole` command - Displays when the next sinkhole will be.
- Added `~pengs` command - Displays how much xp and how many coins you'd gain from penguins.
- Added a new alias for `~invasion` command, it's `~troll`.

### Fixed
- Fixed price from showing up arrow when there was no change.
- Fixed correct usage from showing 'undefined'.
- Fixed a typo in `~circus` command.

## [2.2.1] - 2016-06-01
### Added
- Added the ability to mention the bot for all commands (includes mod commands).

### Changed
- Made days until next for `~vorago`, `~araxxi`, `~rots`, `~spotlight`, and `~circus` command have proper grammar.

### Removed
- Removed all uses of 'strict mode' code.
- Removed some unused code about sending mentions in PM.

## [2.2.0] - 2016-05-28
### Added
- Added `~vorago` command - Displays current Vorago rotation.
- Added `~araxxi` command - Displays current closed path for Araxxi.
- Added `~rots` command - Displays current rotation for Rise of the Six.
- Added `~spotlight` command - Displays what minigame is on spotlight.
- Added `~circus` command - Displays current location of circus.

### Changed
- Changed `)reload` command to have a message sent in the server instead of just console.

## [2.1.2] - 2016-05-24
### Added
- Added a new setting to allow you to remove the cooldowns on all commands.
  - Will eventually add a way to set custom cooldowns on all commands.
- Added the ability for the bot to create `db/servers.json` and `db/times.json` automatically if they don't exist.
- Added timestamps to everything that logs to the console.

### Changed
- Made the testing file only test for environment variable declaration
- Updated `)reload` command (Only the bot owner can use this command).
- Updated how Carbon stats get logged in console.
  - Errors now have the `ERROR` tag
  - Instead of successful posts being in debug, they now use a green BG, and are no longer a debug message.
  - Shows the amount of servers that was posted.

### Fixed
- Fixed a bug that would wipe server database every time the official bot got deployed.
- Fixed Carbon stats posting when bot is ready (hourly stat posting unchanged).
- Fixed `)settings` command from sending double messages on certain occasions.

### Removed
- Removed db files from repo, caused too many issues. (See first bug in fixed above)

## [2.1.1] - 2016-05-19
### Changed
- Changed from a custom testing module, to using mocha.

## [2.1.0] - 2016-05-18
### Added
- Added `.travis.yml` for Travis-CI building.
- Added `.eslintrc` for eslint checking (will use in test script in the future)
- Added node engine to `package.json`.
- Added empty db files for easier installation.

### Changed
- Converted entire application to use ES6.
- Converted application to use environment variables now.
- Updated `README.md` drastically.
- Started using `correctUsage` function when you don't use a command properly.
- Heavily modified `~lamp` command to be more bug-free.
- Put an integer limit on `~roll` command, you can no longer use number higher than `9007199254740991`.
- Found more emojis to change from icons to text.

### Removed
- Removed some unnecessary syntax highlighting.
- Removed `unMute` function in `mod.js` since it was never used.

## [2.0.2] - 2016-05-15
### Fixed
- Fixed `~stats` command not working

## [2.0.1] - 2016-05-14
### Fixed
- Fixed a major bug that made the bot crash every 10 seconds.
- Fixed `~stats` and `~osstats` from crashing the bot.

## 2.0.0 - 2016-05-14
- Initial Re-release

[4.0.4]: https://github.com/unlucky4ever/RuneCord/compare/4.0.3...4.0.4
[4.0.3]: https://github.com/unlucky4ever/RuneCord/compare/4.0.2...4.0.3
[4.0.2]: https://github.com/unlucky4ever/RuneCord/compare/4.0.1...4.0.2
[4.0.1]: https://github.com/unlucky4ever/RuneCord/compare/4.0.0...4.0.1
[4.0.0]: https://github.com/unlucky4ever/RuneCord/compare/3.2.0...4.0.0
[3.2.0]: https://github.com/unlucky4ever/RuneCord/compare/3.1.2...3.2.0
[3.1.2]: https://github.com/unlucky4ever/RuneCord/compare/3.1.1...3.1.2
[3.1.1]: https://github.com/unlucky4ever/RuneCord/compare/3.1.0...3.1.1
[3.1.0]: https://github.com/unlucky4ever/RuneCord/compare/3.0.3...3.1.0
[3.0.3]: https://github.com/unlucky4ever/RuneCord/compare/3.0.2...3.0.3
[3.0.2]: https://github.com/unlucky4ever/RuneCord/compare/3.0.1...3.0.2
[3.0.1]: https://github.com/unlucky4ever/RuneCord/compare/3.0.0...3.0.1
[3.0.0]: https://github.com/unlucky4ever/RuneCord/compare/2.3.6...3.0.0
[2.3.6]: https://github.com/unlucky4ever/RuneCord/compare/2.3.5...2.3.6
[2.3.5]: https://github.com/unlucky4ever/RuneCord/compare/2.3.4...2.3.5
[2.3.4]: https://github.com/unlucky4ever/RuneCord/compare/2.3.3...2.3.4
[2.3.3]: https://github.com/unlucky4ever/RuneCord/compare/2.3.2...2.3.3
[2.3.2]: https://github.com/unlucky4ever/RuneCord/compare/2.3.1...2.3.2
[2.3.1]: https://github.com/unlucky4ever/RuneCord/compare/2.3.0...2.3.1
[2.3.0]: https://github.com/unlucky4ever/RuneCord/compare/2.2.1...2.3.0
[2.2.1]: https://github.com/unlucky4ever/RuneCord/compare/2.2.0...2.2.1
[2.2.0]: https://github.com/unlucky4ever/RuneCord/compare/2.1.2...2.2.0
[2.1.2]: https://github.com/unlucky4ever/RuneCord/compare/2.1.1...2.1.2
[2.1.1]: https://github.com/unlucky4ever/RuneCord/compare/2.1.0...2.1.1
[2.1.0]: https://github.com/unlucky4ever/RuneCord/compare/2.0.2...2.1.0
[2.0.2]: https://github.com/unlucky4ever/RuneCord/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/unlucky4ever/RuneCord/compare/2.0.0...2.0.1
