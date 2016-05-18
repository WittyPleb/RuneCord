RuneCord
========
[![Build Status](https://david-dm.org/unlucky4ever/RuneCord.svg)](https://david-dm.org/unlucky4ever/RuneCord)
<span class="badge-paypal"><a href="https://paypal.me/unlucky4ever" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<a href="https://zenhub.io"><img src="https://img.shields.io/badge/RuneCord-Zenhub.io-blue.svg"></a>

<img src="http://i.imgur.com/TkiKjWM.png" alt="RuneCord Icon" align="right" />
RuneCord is a bot for [Discord](https://discordapp.com) which allows you to use certain commands to get [RuneScape](http://www.runescape.com/) information easily.

Features
--------

##### RuneScape Commands
* `~vos` -- Displays the current Voice of Seren districts.
* `~stats <username>` -- Displays the stats of `<username>`.
* `~osstats <username>` -- Displays the oldschool stats of `<username>`.
* `~time` -- Displays the current in-game time.
* `~reset` -- Displays how long till the game resets.
* `~price <item name>` -- Displays grand exchange information based on `<item name>`.
* `~cache` -- Displays when the next Guthixian Cache is.
* `~viswax` -- Displays the current viswax combinations.
* `~alog <username>` -- Displays the adventure log of `<username>`.
* `~warbands` -- Displays when the next Warbands will be.
* `~bigchin` -- Displays when the next Big Chinchompa will be.
* `~invasion <skill level>` -- Displays how much XP you'd gain in troll invasion if your level was `<skill level>` and you finished the entire thing.
* `~lamp` `small|med|large|huge` `<skill level>` -- Displays how much XP you'd gain from a lamp based on skill level and size.

##### General Commands
* `~invite` -- Generates an invite link for you to invite the bot to your server (same link as below).
* `~roll <number>` -- Rolls a number between 1 and `<number>`.
* `~twitch <username>` -- Displays twitch information based on `<username>`.
* `~about` -- Displays some useful information about the bot.
* `~id [channel]` -- If you supply `channel` as the suffix, it returns the channel id, if no suffix is provided, it returns your user id.

##### Moderator Commands
* `)stats` -- Displays some cool statistics about the bot.
* `)changelog` -- View the latest changes to the bot.
* `)serverinfo` -- Get some useful information about the server the bot is in.
* `)announce <message>` -- Sends a PM to all users in your server.*
* `)ignore` -- Makes the bot ignore **ALL** commands in the channel this message is said in.*
* `)unignore` -- Makes the bot start listening to **ALL** commands in the channel this message is said in.*
* `)settings check` -- Check what settings the bot is using in the current server.*
* `)settings enable|disable settingName` -- Enables or disables a specific setting based on `settingName`. View the [Documentation](https://unlucky4ever.github.io/RuneCord/) to see possible settings.*
* `)settings notify here` -- Makes your default notification channel the channel you said this in.*
* `)settings welcome WELCOME MESSAGE` -- Set a welcome message for new users to your server. Based on the example it would make it `WELCOME MESSAGE`.*
* `)settings welcome none` -- Disables the welcome message.*

** \*Must have `manageServer` permissions to use this command.**

Add RuneCord to your Server
---------------------------
If you would like to add RuneCord to your server, simply click the link below. **YOU MUST BE THE OWNER OF THE SERVER**
https://discordapp.com/oauth2/authorize?&client_id=168215284161708032&scope=bot&permissions=12659727

Installation
------------
This bot is written to run on top of node.js. Please see https://nodejs.org/en/download/

1. Once you have node installed, running `npm install` from the bot directory should install all the needed packages. If this command prints errors the bot won't work!
  ___
  #### Windows Users
  Please note that you must have a working C compiler and Python in your path for `npm install` to work. The bot has been tested to work on Windows using Visual Studio 2015 Community Edition, and Python 2.7.
  - [Install Node on Windows](http://blog.teamtreehouse.com/install-node-js-npm-windows)
  - [npm errors on Windows](http://stackoverflow.com/questions/21365714/nodejs-error-installing-with-npm)
  - [Visual Studio 2015 Community Edition](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx)
  - [Python 2.7](https://www.python.org/downloads/)  

  ___
2. Now you must rename `config.json.example` to `config.json` and edit the values `token` and `twitter_api` with your information.

3. Once complete, you may run `npm test` to test your bot, if it all passes, you are free to run `npm start` to start the bot officially.

**Congratulations! You just installed RuneCord!**

Twitter API
-----------
To get the value for your `twitter_api` in the `config.json` you must go to [Twitter](https://twitter.com/) and create a widget by going to `Settings->Widget`. Set the username for the twitter widget to `JagexClock`, then click 'Create Widget'.

Once the widget is created, you will see a textbox area with some source code. You will see a long number named `data-widget-id` in the source code, you must select that number, and add it to your `config.json`, that is the value for your `twitter_api`. If you fail to add this, the `~vos` command **will not** work.

Issues
------
Before reporting a problem, please read how to [File an issue](https://github.com/unlucky4ever/RuneCord/blob/master/CONTRIBUTING.md#file-an-issue).

Development / Contributing
--------------------------
See the [Contributing Guide](https://github.com/unlucky4ever/RuneCord/blob/master/CONTRIBUTING.md#development)

#### Author
[unlucky4ever](https://github.com/unlucky4ever) ([@WittyRS](https://twitter.com/WittyRS))

#### Contributers
https://github.com/unlucky4ever/RuneCord/graphs/contributors
