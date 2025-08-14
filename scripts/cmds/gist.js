const fsp = require('fs').promises;
const axios = require('axios');
const path = require('path');

const ArYAN = "https://nix-gist.vercel.app";

module.exports = {
  nix: {
    name: "gist",
    version: "0.0.1",
    role: 2,
    author: "ArYAN",
    prefix: true,
    description: "Upload code to GitHub Gist",
    category: "convert",
    guide: { en: "[fileName] OR [reply with file name]" },
    cooldown: 1
  },

  async onStart({ bot, message, msg, args }) {
    const ownerIDs = global.config.admin;
    if (!ownerIDs.includes(msg.from.id.toString())) {
      return message.reply("❌ | Only bot's admin can use the command");
    }

    const fileName = args[0];
    if (!fileName) {
      return message.reply("[⚜️]➜ | Missing file name.");
    }

    let codeContent = '';
    try {
      if (msg.reply_to_message && msg.reply_to_message.text) {
        codeContent = msg.reply_to_message.text;
      } else {
        const filePath = path.join(__dirname, '..', '..', 'scripts', 'cmds', `${fileName}.js`);
        console.log("Looking for file at:", filePath);
        codeContent = await fsp.readFile(filePath, 'utf8');
      }
    } catch (err) {
      console.error("Read file error:", err);
      return message.reply("[⚜️]➜ | File not found or cannot be read.");
    }

    try {
      const payload = {
        code: encodeURIComponent(codeContent),
        nam: `${fileName}.js`
      };
      const { data } = await axios.post(`${ArYAN}/gist`, payload);
      message.reply(data.data || "[⚜️]➜ API error.");
    } catch (err) {
      console.error("Gist API error:", err);
      message.reply("[⚜️]➜ | Failed to upload to gist.");
    }
  }
};
