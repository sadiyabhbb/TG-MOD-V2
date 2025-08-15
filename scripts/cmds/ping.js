module.exports = {
  nix: {
    name: "ping",
    aliases: ["p"],
    version: "1.0.0",
    author: "ArYAN",
    cooldowns: 5,
    role: 0,
    description: "Checks the bot's response time.",
    category: "utility",
    prefix: false,
  },

  onStart: async function ({ bot, message, msg }) {
    try {
      const startTime = Date.now();

      
      const sentMessage = await message.reply("🏓 Pinging...", {
        noReply: true 
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      await bot.editMessageText(`⚡️ Pong! Latency: ${latency}ms`, {
          chat_id: sentMessage.chat.id,
          message_id: sentMessage.message_id,
      });

    } catch (error) {
      console.error("Error in ping command:", error);
      
      await message.reply("❌ An error occurred while checking ping.");
    }
  }
};
