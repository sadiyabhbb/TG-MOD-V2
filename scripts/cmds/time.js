const moment = require("moment-timezone");

const nix = {
  nix: {
    name: "time",
    aliases: ["now"],
    author: "ArYAN",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    description: "Shows the current time with the configured timezone.",
    category: "UTILITY",
    guide: "Use: {pn}"
  },
  onStart: async function ({ message }) {
    if (!message) return;
    try {
      const now = moment.tz(global.config.timeZone || "Asia/Dhaka");
      message.reply(`🕒 Current time: ${now.format("h:mm:ss A")}\n📅 Date: ${now.format("DD/MM/YYYY")}`, {
        parse_mode: "Markdown"
      });
    } catch (e) {
      console.error(e);
      message.reply("❌ There was an error getting the time.");
    }
  }
};

module.exports = nix;
