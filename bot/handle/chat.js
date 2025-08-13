exports.chat = async function({ bot, message, msg, chatId, args }) {
  const { cmds } = global.ownersv2;

  for (const [commandName, command] of cmds.entries()) {
    if (command.onChat) {
      try {
        const shouldContinue = await command.onChat({
          bot,
          message,
          msg,
          chatId,
          args
        });
        if (shouldContinue === false) {
          break;
        }
      } catch (error) {
        console.error(`Error executing onChat for command "${commandName}":`, error);
      }
    }
  }
};
