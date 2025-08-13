exports.callback = function({ bot, msg, chatId, message }) {
  if (bot._callbackHandler) {
    bot.removeListener('callback_query', bot._callbackHandler);
  }

  const parsePayload = (data) => {
    if (typeof data !== 'string') return null;

    if (data.startsWith("tm_")) {
      const parts = data.split('_');
      if (parts.length >= 2 && parts[0] === "tm") {
        return {
          command: "tm",
          action: parts.slice(1).join('_'),
          rawData: data
        };
      }
    }

    try {
      const jsonPayload = JSON.parse(data);
      if (jsonPayload && typeof jsonPayload === 'object' && jsonPayload.command) {
        return jsonPayload;
      }
    } catch (err) {
      const parts = data.split(':');
      if (parts.length > 0) {
        return { command: parts[0], args: parts.slice(1) };
      }
    }

    return null;
  };

  bot._callbackHandler = async (callbackQuery) => {
    if (!callbackQuery || !callbackQuery.data) {
      console.error('Invalid callback query received: No data', callbackQuery);
      return;
    }

    const payload = parsePayload(callbackQuery.data);
    if (!payload || !payload.command) {
      console.error('No command found in payload or invalid payload:', payload, 'Raw data:', callbackQuery.data);
      return bot.answerCallbackQuery(callbackQuery.id, {
        text: "Invalid callback format."
      }).catch(console.error);
    }

    const { commands } = global.ownersv2;
    if (!commands) {
      console.error('Global client commands not initialized');
      return;
    }

    const command = commands.get(payload.command);
    if (!command || typeof command.onCallback !== 'function') {
      console.error(`No valid onCallback handler found for command: ${payload.command}`);
      return bot.answerCallbackQuery(callbackQuery.id, {
        text: "Command not found or does not support callbacks.",
        show_alert: true
      }).catch(console.error);
    }

    try {
      const messageId = callbackQuery.message?.message_id;
      const chatId = callbackQuery.message?.chat?.id;
      if (!chatId) throw new Error('Chat ID not found in callback query');

      await command.onCallback({
        bot,
        callbackQuery,
        chatId,
        messageId,
        args: [],
        payload,
      });

      if (!callbackQuery.answered) {
        await bot.answerCallbackQuery(callbackQuery.id);
      }
    } catch (error) {
      console.error(`Error executing onCallback for command "${payload.command}" with data "${callbackQuery.data}":`, error);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "An error occurred. Please try again.",
        show_alert: true
      }).catch(console.error);
    }
  };

  bot.on('callback_query', bot._callbackHandler);
};
