const moment = require("moment-timezone");

exports.event = async function ({ bot, msg, chatId, message }) {
  const timeStart = Date.now();
  const fullTime = moment.tz(global.settings.timeZone || "Asia/Dhaka");
  const timeStr = fullTime.format("HH:mm:ss");
  const dateStr = fullTime.format("DD/MM/YYYY");
  const dayStr = fullTime.format("dddd");
  const yearStr = fullTime.format("YYYY");

  const { events } = global.ownersv2;
  const { devMode } = global.settings;

  chatId = chatId || String(msg.chat.id);

  if (msg.new_chat_members || msg.left_chat_member) {
    const eventType = msg.new_chat_members ? "welcome" : "leave";

    for (const [eventName, eventHandler] of events.entries()) {
      if (eventHandler.meta.type.includes(eventType)) {
        try {
          const context = { bot, message, msg, chatId };
          await eventHandler.onStart(context);

          if (devMode) {
            const executionTime = Date.now() - timeStart;
            const blue = "\x1b[34m";
            const cyan = "\x1b[36m";
            const reset = "\x1b[0m";
            const separator = `${blue}${"─".repeat(60)}${reset}`;

            const logMessage = `
${separator}
Type            : ${cyan}${eventType}${reset}
Time            : ${cyan}${timeStr}${reset}
Date            : ${cyan}${dateStr}${reset}
Day             : ${cyan}${dayStr}${reset}
Year            : ${cyan}${yearStr}${reset}
Chat ID         : ${cyan}${chatId}${reset}
Execution Time  : ${cyan}${executionTime}ms${reset}
${separator}
            `.trim();

            console.log(logMessage);
          }
        } catch (error) {
          console.error(`\x1b[31m[ Event Error ] ${eventHandler.meta.name}:\x1b[0m`, error);
        }
      }
    }
    return;
  }
};
