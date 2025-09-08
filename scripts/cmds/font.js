const axios = require("axios");
const apiUrl = "https://apis-top.vercel.app/aryan/font";

const nix = {
  nix: {
    name: "font",
    aliases: ["ft"],
    version: "0.0.1",
    author: "ArYAN",
    cooldowns: 5,
    role: 0,
    category: "tools",
    shortDescription: "Stylish text generator",
    longDescription: "Generate stylish text with different font styles.",
    guide: "Use: {p}font list\n{p}font <number> <text>",
    prefix: false,
  },

  onStart: async function ({ bot, message, args, chatId, msg }) {
    if (!args[0]) {
      return message.reply("❌ | Please provide arguments.\nUse:\nfont list\nfont <number> <text>");
    }

    let styles = [];
    try {
      const r = await axios.get(apiUrl);
      styles = r.data.available_styles || [];
    } catch {
      return message.reply("❌ | Failed to fetch font styles from API.");
    }

    if (args[0].toLowerCase() === "list") {
      let msg = "📜 | Available Font Styles:\n\n";
      styles.forEach((style, i) => {
        msg += `${i + 1}. ${style}\n`;
      });
      const sentMessage = await bot.sendMessage(chatId, msg, { reply_to_message_id: msg.message_id });
      setTimeout(() => bot.deleteMessage(chatId, sentMessage.message_id), 15000);
      return;
    }

    const index = parseInt(args[0]);
    if (isNaN(index) || index < 1 || index > styles.length) {
      return message.reply("❌ | Invalid style number.\nType: font list");
    }

    const style = styles[index - 1];
    const text = args.slice(1).join(" ");
    if (!text) return message.reply("❌ | Please provide text to style.");

    try {
      const url = `${apiUrl}?style=${style}&text=${encodeURIComponent(text)}`;
      const r = await axios.get(url);
      const styledText = r.data.result || "❌ API error.";
      return message.reply(styledText);
    } catch {
      return message.reply("❌ | Failed to fetch styled text.");
    }
  }
};

module.exports = nix;
