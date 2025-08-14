const moment = require("moment-timezone");

exports.chat = async function ({ bot, message, msg, chatId }) {
  const { from, chat, text } = msg;

  if (global.config.devMode) {
    const fullTime = moment.tz(global.config.timeZone || "Asia/Dhaka");
    const timeStr = fullTime.format("HH:mm:ss");
    const dateStr = fullTime.format("DD/MM/YYYY");
    const blue = "\x1b[34m";
    const cyan = "\x1b[36m";
    const reset = "\x1b[0m";
    const separator = `${blue}${"─".repeat(40)}${reset}`;
    const logMessage = `
${separator}
Message         : ${cyan}${text}${reset}
Chat ID         : ${cyan}${chatId}${reset}
Chat Type       : ${cyan}${chat.type}${reset}
Sender ID       : ${cyan}${from.id}${reset}
Sender Name     : ${cyan}${from.first_name}${reset}
Time            : ${cyan}${timeStr}${reset}
Date            : ${cyan}${dateStr}${reset}
${separator}
    `.trim();

    console.log(logMessage);
  }
};
