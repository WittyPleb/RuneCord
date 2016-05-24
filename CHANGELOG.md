# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [2.1.2] - 2016-05-24
### Added
- Added a new setting to allow you to remove the cooldowns on all commands.
  - Will eventually add a way to set custom cooldowns on all commands.

### Fixed
- Fixed `)settings` command from sending double messages on certain occasions.

## Changed
- Made the testing file only test for environment variable declaration

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

[2.1.2]: https://github.com/unlucky4ever/RuneCord/compare/2.1.1...2.1.2
[2.1.1]: https://github.com/unlucky4ever/RuneCord/compare/2.1.0...2.1.1
[2.1.0]: https://github.com/unlucky4ever/RuneCord/compare/2.0.2...2.1.0
[2.0.2]: https://github.com/unlucky4ever/RuneCord/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/unlucky4ever/RuneCord/compare/2.0.0...2.0.1
