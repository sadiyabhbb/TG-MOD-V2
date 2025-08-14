const path = require('path');
const fs = require('fs');

exports.callback = function({ bot }) {
  if (bot._callbackHandler) {
    bot.removeListener('callback_query', bot._callbackHandler);
  }

  const callbackDataFilePath = path.join(__dirname, '../../scripts/cmds/aryan/callback.json');
  let allowedCallbackPrefixes = [];

  try {
    const data = fs.readFileSync(callbackDataFilePath, 'utf8');
    allowedCallbackPrefixes = JSON.parse(data);
  } catch (error) {
    console.error(`Error reading or parsing callback.json at ${callbackDataFilePath}: ${error.message}`);
    return;
  }

  const parsePayload = (data) => {
    if (typeof data !== 'string' || !data) return null;
    const parts = data.split('_');
    if (parts.length > 1) {
      return {
        prefix: parts[0],
        action: parts.slice(1).join('_'),
        rawData: data
      };
    }
    return null;
  };

  bot._callbackHandler = async (callbackQuery) => {
    if (!callbackQuery || !callbackQuery.data) {
      return;
    }

    const payload = parsePayload(callbackQuery.data);

    if (!payload || !allowedCallbackPrefixes.includes(payload.prefix)) {
      console.error(`Invalid or unauthorized callback prefix: ${payload?.prefix}`);
      return bot.answerCallbackQuery(callbackQuery.id, {
        text: "Invalid command.",
        show_alert: true
      }).catch(console.error);
    }

    const handlerPath = path.join(__dirname, `../../scripts/cmds/${payload.prefix}.js`);

    try {
      if (!fs.existsSync(handlerPath)) {
        throw new Error(`Handler file not found: ${handlerPath}`);
      }

      delete require.cache[require.resolve(handlerPath)];
      const handlerModule = require(handlerPath);

      if (typeof handlerModule.onCallback !== 'function') {
        throw new Error(`Handler file ${payload.prefix}.js does not export an onCallback function.`);
      }

      const messageId = callbackQuery.message?.message_id;
      const chatId = callbackQuery.message?.chat?.id;

      if (!chatId) throw new Error('Chat ID not found in callback query');

      await handlerModule.onCallback({
        bot,
        callbackQuery,
        chatId,
        messageId,
        payload,
      });

      if (!callbackQuery.answered) {
        await bot.answerCallbackQuery(callbackQuery.id);
      }
      
    } catch (error) {
      console.error(`Error executing callback for "${payload.prefix}" with data "${callbackQuery.data}":`, error);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "An error occurred. Please try again.",
        show_alert: true
      }).catch(console.error);
    }
  };

  bot.on('callback_query', bot._callbackHandler);
};
