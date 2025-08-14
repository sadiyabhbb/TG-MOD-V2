module.exports = {
  nix: {
    name: "tid",
    version: "1.0.0",
    author: "ArYAN",
    role: 0,
    description: "Show current chat TID (group ID)",
    category: "utility",
    usage: "tid",
    cooldown: 2,
    prefix: false
  },

  async onStart({ bot, message, msg, chatId }) {
    return message.reply(`• TID: \`${chatId}\``, {
      parse_mode: "Markdown",
      reply_to_message_id: msg.message_id
    });
  }
};
