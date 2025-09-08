const axios = require("axios");
const apiUrl = "https://nix-baby-apis.vercel.app";
const randRep = [ "hmmm bby", "bolo baby", "hea bolo", "hmm" ];
const getRand = () => randRep[Math.floor(Math.random() * randRep.length)];

const nix = {
  nix: {
    name: "bby",
    aliases: ["baby"],
    version: "0.0.1",
    author: "ArYAN",
    cooldowns: 0,
    role: 0,
    category: "chat",
    shortDescription: "AI chat bot with learning",
    longDescription: "Chat bot with random replies, teaching, removing, editing",
    guide: "Chat: {pn} [msg]\nTeach: {pn} teach [msg] - [reply1, reply2]\nTeach react: {pn} teach react [msg] - [react1, react2]\nRemove: {pn} remove [msg]\nRemove specific reply: {pn} rm [msg] - [index]\nList teachers: {pn} list all\nView info: {pn} list\nEdit reply: {pn} edit [msg] - [newReply]",
    prefix: false,
  },
};

async function handleReply(bot, chatId, userId, text, reply_to_message_id) {
  try {
    const res = await axios.get(`${apiUrl}/baby?text=${encodeURIComponent(text)}&senderID=${userId}&font=1`);
    const rep = res?.data?.reply;
    if (rep) {
      bot.sendMessage(chatId, rep, { reply_to_message_id, parse_mode: "Markdown" }).catch(console.error);
    } else {
      bot.sendMessage(chatId, "❌ | No response found. Please teach me!", { reply_to_message_id }).catch(console.error);
    }
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, "❌ | Failed to fetch reply.", { reply_to_message_id }).catch(console.error);
  }
}

async function onStart({ bot, message, msg, chatId, userId, args, usages }) {
  const userInput = args.join(" ").toLowerCase();
  
  if (!args[0]) {
    const userName = msg.from.first_name;
    const randMessage = `${userName}, ${getRand()}`;
    return bot.sendMessage(chatId, randMessage, { reply_to_message_id: msg.message_id });
  }

  const firstArg = args[0].toLowerCase();
  
  try {
    switch (firstArg) {
      case "remove":
        if (args.length < 2) return message.reply('Please provide a message to remove. Usage: `!bby remove [YourMessage]`');
        const messageToRemove = args.slice(1).join(" ");
        const resRemove = await axios.get(`${apiUrl}/baby-remove?key=${encodeURIComponent(messageToRemove)}&senderID=${userId}`);
        return message.reply(resRemove.data.message || "Removed");
        
      case "rm":
        if (args.length < 2 || !userInput.includes("-")) return message.reply('Invalid format! Use `!bby rm [YourMessage] - [indexNumber]`');
        const [messageToRm, index] = userInput.replace("rm ", "").split(/\s*-\s*/);
        const resRm = await axios.get(`${apiUrl}/baby-remove?key=${encodeURIComponent(messageToRm)}&index=${index}`);
        return message.reply(resRm.data.message || "Removed");
        
      case "list":
        if (args[1] === "all") {
          const limit = parseInt(args[2]) || 100;
          const resListAll = await axios.get(`${apiUrl}/teachers`);
          const teachers = resListAll.data.teachers || {};
          const sorted = Object.keys(teachers).sort((a, b) => teachers[b] - teachers[a]);
          const list = sorted.map(id => `• ${id}: ${teachers[id]}`);
          return message.reply(`👑 | Teachers:\n${list.slice(0, limit).join("\n")}`);
        } else {
          const infoRes = await axios.get(`${apiUrl}/baby-info`);
          return message.reply(
            `❇️ | Total Teach = ${infoRes.data.totalKeys || "api off"}\n♻️ | Total Response = ${infoRes.data.totalReplies || "api off"}`
          );
        }
        
      case "edit":
        const partsEdit = userInput.replace("edit ", "").split(/\s*-\s*/);
        if (partsEdit.length < 2) return message.reply('❌ | Invalid format! Use `edit [msg] - [newReply]`');
        const oldMsg = partsEdit[0];
        const newMsg = partsEdit[1];
        const resEdit = await axios.get(`${apiUrl}/baby-edit?key=${encodeURIComponent(oldMsg)}&replace=${encodeURIComponent(newMsg)}&senderID=${userId}`);
        return message.reply(resEdit.data.message || "Edited");
        
      case "teach":
        const teachType = args[1]?.toLowerCase();
        let teachParts = userInput.replace("teach ", "").split(/\s*-\s*/);

        if (teachType === "react") {
          teachParts = userInput.replace("teach react ", "").split(/\s*-\s*/);
          if (teachParts.length < 2) return message.reply('❌ | Invalid format! Use `teach react [msg] - [reactEmoji]`');
          const [finalReactMsg, reactContent] = teachParts;
          const resReact = await axios.get(`${apiUrl}/baby?teach=${encodeURIComponent(finalReactMsg)}&react=${encodeURIComponent(reactContent)}`);
          return message.reply(`✅ Replies added ${resReact.data.message}`);
        }
        
        if (teachParts.length < 2) return message.reply('❌ | Invalid format! Use `teach [msg] - [reply]`');
        const [finalMsg, replyContent] = teachParts;
        const resTeach = await axios.get(`${apiUrl}/baby?teach=${encodeURIComponent(finalMsg.replace("teach ", ""))}&reply=${encodeURIComponent(replyContent)}&senderID=${userId}&threadID=${chatId}`);
        const teacherName = msg.from.first_name;
        const teachsRes = await axios.get(`${apiUrl}/teachers`);
        const teachCount = teachsRes.data.teachers[userId] || 0;
        const addedReplies = resTeach.data.addedReplies?.join(", ") || replyContent;
        return message.reply(`✅ | Replies added "${addedReplies}" added to "${finalMsg.replace("teach ", "")}".\nTeacher: ${teacherName}\nTeachs: ${teachCount}`);
        
      default:
        await handleReply(bot, chatId, userId, userInput, msg.message_id);
    }
  } catch (e) {
    console.error("Error in bby onStart:", e);
    return message.reply(`An error occurred: ${e.message}`);
  }
}

async function onReply({ bot, msg, chatId, userId, replyMsg }) {
  if (!msg.text || !replyMsg || !replyMsg.message_id) return;
  
  const currentReplyData = global.teamnix.replies.get(replyMsg.message_id);
  if (!currentReplyData || currentReplyData.nix.name !== nix.nix.name) return;
  
  const userMessage = msg.text.toLowerCase().trim();
  global.teamnix.replies.delete(replyMsg.message_id);

  await handleReply(bot, chatId, userId, userMessage, msg.message_id);
}

async function onWord({ bot, message, msg, chatId, userId }) {
  const text = msg.text?.toLowerCase();
  if (!text) return;

  const matchedKeyword = nix.nix.keyword.find(keyword => text.startsWith(keyword.toLowerCase()));
  if (!matchedKeyword) return;
  
  const messageContent = text.slice(matchedKeyword.length).trim();

  if (!messageContent) {
    const userName = msg.from.first_name;
    const randMessage = `${userName}, ${getRand()}`;
    const sentMessage = await bot.sendMessage(chatId, randMessage, { reply_to_message_id: msg.message_id });
    global.teamnix.replies.set(sentMessage.message_id, {
      nix: { name: nix.nix.name },
      type: "reply",
      author: userId
    });
    return;
  }
  
  await handleReply(bot, chatId, userId, messageContent, msg.message_id);
}

module.exports = { nix, onStart, onReply, onWord };
