const fs = require('fs');
const path = require('path');

module.exports = {
  nix: {
    name: 'unsend',
    aliases: ['u', 'uns'],
    version: '1.0.0',
    role: 0,
    author: 'ArYAN',
    description: 'Deletes a message by replying to it.',
    category: 'utility',
    prefix: false,
  },

  onStart: async function ({ bot, message, msg, chatId }) {
    const reply_to_message = msg.reply_to_message;

    if (!reply_to_message) {
      return message.reply({ body: "❌ Please reply to the message you want to unsend." });
    }

    try {
      await bot.deleteMessage(chatId, reply_to_message.message_id);
      await bot.deleteMessage(chatId, msg.message_id);
    } catch (error) {
      console.error('Error deleting message:', error);
      if (error.response && error.response.body) {
        if (error.response.body.description.includes("message can't be deleted")) {
          return message.reply({ body: "❌ I cannot delete this message. It might be too old or not sent by me." });
        }
      }
      return message.reply({ body: `❌ An unexpected error occurred: ${error.message}` });
    }
  }
};
