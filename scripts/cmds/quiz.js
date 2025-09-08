const axios = require("axios");
const fs = require('fs');
const path = require('path');

const nix = {
  name: "quiz",
  version: "0.0.1",
  aliases: ["qz"],
  description: "Play a quiz game to earn coins.",
  author: "ArYAN", 
  prefix: false,
  category: "game",
  role: 0,
  cooldown: 5,
  guide: "Start a quiz: {p}quiz [bn/en]\nExample: {p}quiz bn or {p}quiz en",
};

async function onStart({ bot, message, msg, chatId, args, usages }) {
  const input = args[0] ? args[0].toLowerCase() : "bn";
  let category = "bangla";
  const quizTimeout = 30;

  if (input === "bn" || input === "bangla") {
    category = "bangla";
  } else if (input === "en" || input === "english") {
    category = "english";
  } else {
    return usages();
  }

  try {
    const response = await axios.get(`https://nix-quizv2.onrender.com/quiz?category=${category}&q=random`);

    const quizData = response.data.question;
    const { question, correctAnswer, options } = quizData;
    const { a, b, c, d } = options;

    const quizMsgBody = `
\n╭──✦ ${question}
├‣ 𝗔) ${a}
├‣ 𝗕) ${b}
├‣ 𝗖) ${c}
├‣ 𝗗) ${d}
╰──────────────────‣
Reply to this message with your answer. You have ${quizTimeout} seconds.
    `.trim();

    const sentMessage = await bot.sendMessage(
      chatId,
      quizMsgBody, {
        reply_to_message_id: msg.message_id,
        parse_mode: "Markdown"
      }
    );

    global.teamnix.replies.set(sentMessage.message_id, {
      nix,
      type: "quiz_reply",
      authorId: msg.from.id,
      correctAnswer: correctAnswer.toLowerCase(),
      attempts: 0,
      originalMessageId: sentMessage.message_id,
      chatId: chatId,
    });

    setTimeout(async () => {
      const replyData = global.teamnix.replies.get(sentMessage.message_id);
      if (replyData) {
        global.teamnix.replies.delete(sentMessage.message_id);
        
        await bot.deleteMessage(sentMessage.chat.id, sentMessage.message_id)
          .catch(console.error);
        await bot.sendMessage(
          chatId,
          `🕰️ Time's up! The quiz for "${question}" has ended. The correct answer was: **${correctAnswer}**`, {
            reply_to_message_id: msg.message_id,
            parse_mode: "Markdown"
          }
        ).catch(console.error);
        
      }
    }, quizTimeout * 1000);

  } catch (error) {
    console.error("❌ | Error occurred during quiz start:", error);
    await message.reply("An error occurred while fetching the quiz. Please try again later.");
  }
}

async function onReply({ bot, message, msg, chatId, userId, args, data, replyMsg }) {
  if (data.type !== "quiz_reply" || userId !== data.authorId) {
    return bot.sendMessage(chatId, "This reply is not for the active quiz or you are not the quiz initiator.", {
      reply_to_message_id: msg.message_id
    });
  }

  const maxAttempts = 2;

  if (data.attempts >= maxAttempts) {
    await bot.sendMessage(
      chatId,
      `🚫 You've reached the maximum number of attempts (${maxAttempts}). The correct answer was: **${data.correctAnswer}**`, {
        reply_to_message_id: msg.message_id,
        parse_mode: "Markdown"
      }
    );
    
    await bot.deleteMessage(data.chatId, data.originalMessageId).catch(console.error);
    global.teamnix.replies.delete(replyMsg.message_id);
    return;
  }

  const userReply = msg.text ? msg.text.toLowerCase().trim() : "";

  if (userReply === data.correctAnswer) {
    const rewardCoins = 300;
    const rewardExp = 100;

    const dataPath = path.join(process.cwd(), 'database', 'balance.json');
    const getBalanceData = () => {
      if (!fs.existsSync(dataPath)) {
          fs.writeFileSync(dataPath, JSON.stringify({}));
      }
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    };

    const saveData = (data) => {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    };

    let balances = getBalanceData();
    if (!balances[userId]) {
        balances[userId] = { money: 0 };
    }
    balances[userId].money += rewardCoins;
    saveData(balances);
    
    await bot.sendMessage(
      chatId,
      `Congratulations, ${msg.from.first_name}! 🌟🎉\n\nYou're a Quiz Champion! 🏆\n\nYou've earned ${rewardCoins} Coins 💰 and ${rewardExp} EXP 🌟\n\nYour new balance is ${balances[userId].money} Coins.\n\nKeep up the great work! 🚀`, {
        reply_to_message_id: msg.message_id,
        parse_mode: "Markdown"
      }
    );
 
    await bot.deleteMessage(data.chatId, data.originalMessageId).catch(console.error);
    global.teamnix.replies.delete(replyMsg.message_id);
  } else {
    data.attempts += 1;
    global.teamnix.replies.set(replyMsg.message_id, data);
    await bot.sendMessage(
      chatId,
      `❌ Wrong Answer. You have ${maxAttempts - data.attempts} attempts left.\n✅ Try Again!`, {
        reply_to_message_id: msg.message_id
      }
    );
  }
}

module.exports = {
  onStart,
  onReply,
  nix
};
