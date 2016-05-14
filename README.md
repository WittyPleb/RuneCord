RuneCord
========
[![Build Status](https://david-dm.org/unlucky4ever/RuneCord.svg)](https://david-dm.org/unlucky4ever/RuneCord) 
<span class="badge-paypal"><a href="https://paypal.me/unlucky4ever" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span> 
<a href="https://zenhub.io"><img src="https://img.shields.io/badge/RuneCord-Zenhub.io-blue.svg"></a>

<img src="http://i.imgur.com/TkiKjWM.png" alt="RuneCord Icon" align="right" />
RuneCord is a bot for [Discord](https://discordapp.com) which allows you to use certain commands to get [RuneScape](http://www.runescape.com/) information easily.

#### Features
* `~help` -- Shows all available commands.
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
* `~lamp `small|med|large|huge` `<skill level>` -- Displays how much XP you'd gain from a lamp based on skill level and size.
* `~roll <number>` -- Rolls a number between 1 and `<number>`.
* `~twitch <username>` -- Displays twitch information based on `<username>`.

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
2. Once you have everything setup, and `npm install` was a success, you **must** create a twitter widget, make sure you set the username on the widget to `@JagexClock`, leave the rest of the settings at their defaults. To get the `twitter_api` needed for the bot to work, look at the embed code, and you will see a large number that will look similiar to this: `937151197101446304`. Copy that number, then edit `bot/config.json` and add your `twitter_api`.

3. To get the bot token to allow your bot to login, you can go https://discordapp.com/developers and create a new application. Name it whatever you want your bot to be called. Once your app is created, create a bot user for the application, and then you will see a token for the bot. Use that token and edit `bot/config.json` with the value of your token.

4. Last but not least, you must create a folder called `db` and inside that folder create two files, `servers.json` and `times.json` and each one will have an initial content of `{}`, the files will be auto updated with the bot.

5. After you get the you entire config set up, you can run `node test/runecord-test.js` to test your bot, to make sure it can log in. If all of it passes, you are free to use `node runecord.js` to start your bot.

**Congratulations! You just installed RuneCord!**

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