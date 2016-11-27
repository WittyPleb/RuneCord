require('dotenv').config(); // Required for easy environment variables
const Eris = require('eris');

var bot = new Eris(process.env.TOKEN);

bot.on('ready', () => {
    console.log('Ready!'); // Logs when ready
});

bot.on('messageCreate', (msg) => {
    if (msg.content === '!ping') {
        bot.createMessage(msg.channel.id, 'Pong!');
    } else if (msg.content === '!pong') {
        bot.createMessage(msg.channel.id, 'Ping!');
    }
});

bot.connect(); // Connect the bot