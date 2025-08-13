const TelegramBot = require('node-telegram-bot-api');

const login = () => {
  const tokens = global.states.tokens;

  const bots = tokens.map(token => new TelegramBot(token, { polling: true }));
  const { listen } = require('../../logger/listen.js');

  bots.forEach(bot => listen(bot));

  return bots;
};

module.exports = { login };
