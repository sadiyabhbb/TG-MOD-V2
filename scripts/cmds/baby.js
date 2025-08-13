const axios = require('axios');

const baseApiUrl = "https://noobs-api.top/dipto/baby";

const nix = {
    name: "baby",
    version: "0.0.1",
    aliases: ["baby1", "bbe1", "babe1", "sam1"],
    description: "Better than all sim simi. Interact with the 'baby' AI.",
    author: "ArYAN",
    prefix: "both",
    prefix: true,
    category: "chat",
    type: "anyone",
    cooldown: 0,
    guide: [
        "[anyMessage]",
        "teach [YourMessage] - [Reply1], [Reply2], [Reply3]...",
        "teach [react] [YourMessage] - [react1], [react2], [react3]... OR (react emoji)",
        "remove [YourMessage]",
        "rm [YourMessage] - [indexNumber]",
        "msg [YourMessage]",
        "list",
        "list all [limit (optional, default 100)]",
        "edit [YourMessage] - [NewMessage]"
    ]
};

async function onStart({ bot, message, msg, chatId, args, usages }) {
    const aryan = args.join(" ").toLowerCase();
    const userId = msg.from.id;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "Type !bby hi", "Type /bby hi"];
            return message.reply(ran[Math.floor(Math.random() * ran.length)]);
        }

        if (args[0] === 'remove') {
            if (args.length < 2) return message.reply('Please provide a message to remove. Usage: `!bby remove [YourMessage]`');
            const messageToRemove = args.slice(1).join(" ");
            const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(messageToRemove)}&senderID=${userId}`);
            return message.reply(res.data.message);
        }

        if (args[0] === 'rm') {
            if (args.length < 2 || !aryan.includes('-')) return message.reply('Invalid format! Use `!bby rm [YourMessage] - [indexNumber]`');
            const parts = aryan.replace("rm ", "").split(/\s*-\s*/);
            const messageToRm = parts[0];
            const index = parts[1];
            const res = await axios.get(`${baseApiUrl}?remove=${encodeURIComponent(messageToRm)}&index=${index}`);
            return message.reply(res.data.message);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const limit = parseInt(args[2]) || 100;
                const res = await axios.get(`${baseApiUrl}?list=all`);
                const data = res.data;

                if (!data || !data.teacher || !data.teacher.teacherList) {
                    return message.reply("No teacher data available or API is offline.");
                }

                const limitedTeachers = data.teacher.teacherList.slice(0, limit);
                const teachers = limitedTeachers.map((item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    return { name: number, value: value };
                });

                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return message.reply(`Total Teach = ${data.length || '0'}\n👑 | List of Teachers of baby\n${output}`);
            } else {
                const res = await axios.get(`${baseApiUrl}?list=all`);
                const d = res.data;
                return message.reply(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`);
            }
        }

        if (args[0] === 'msg') {
            if (args.length < 2) return message.reply('Please provide a message query. Usage: `!bby msg [YourMessage]`');
            const messageQuery = args.slice(1).join(" ");
            const res = await axios.get(`${baseApiUrl}?list=${encodeURIComponent(messageQuery)}`);
            const d = res.data.data;
            return message.reply(`Message ${messageQuery} = ${d}`);
        }

        if (args[0] === 'edit') {
            const parts = aryan.split(/\s*-\s*/);
            if (parts.length < 2 || parts[1].length < 2) {
                return message.reply('❌ | Invalid format! Use `!bby edit [YourMessage] - [NewReply]`');
            }
            const originalMessage = args[1];
            const newReply = parts[1];
            const res = await axios.get(`${baseApiUrl}?edit=${encodeURIComponent(originalMessage)}&replace=${encodeURIComponent(newReply)}&senderID=${userId}`);
            return message.reply(`Changed ${res.data.message}`);
        }

        if (args[0] === 'teach') {
            let teachType = args[1];
            let messageAndReply = aryan.replace("teach ", "").split(/\s*-\s*/);

            if (teachType === 'react') {
                messageAndReply = aryan.replace("teach react ", "").split(/\s*-\s*/);
                if (messageAndReply.length < 2 || messageAndReply[1].length < 1) {
                    return message.reply('❌ | Invalid format! Use `!bby teach react [YourMessage] - [reactEmoji]`');
                }
                const finalMessage = messageAndReply[0].trim();
                const reactContent = messageAndReply[1].trim();
                const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(finalMessage)}&react=${encodeURIComponent(reactContent)}`);
                return message.reply(`✅ Replies added: ${res.data.message}`);
            }
            else if (teachType === 'amar') {
                messageAndReply = aryan.replace("teach amar ", "").split(/\s*-\s*/);
                if (messageAndReply.length < 2 || messageAndReply[1].length < 2) {
                    return message.reply('❌ | Invalid format! Use `!bby teach amar [YourMessage] - [Reply]`');
                }
                const finalMessage = messageAndReply[0].trim();
                const replyContent = messageAndReply[1].trim();
                const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(finalMessage)}&senderID=${userId}&reply=${encodeURIComponent(replyContent)}&key=intro`);
                return message.reply(`✅ Replies added: ${res.data.message}`);
            }
            else {
                if (messageAndReply.length < 2 || messageAndReply[1].length < 2) {
                    return message.reply('❌ | Invalid format! Use `!bby teach [YourMessage] - [Reply]`');
                }
                const finalMessage = messageAndReply[0].replace("teach ", "").trim();
                const replyContent = messageAndReply[1].trim();
                const res = await axios.get(`${baseApiUrl}?teach=${encodeURIComponent(finalMessage)}&reply=${encodeURIComponent(replyContent)}&senderID=${userId}&threadID=${chatId}`);
                return message.reply(`✅ Replies added: ${res.data.message}\nTeacher ID: ${res.data.teacher}\nTeachs: ${res.data.teachs}`);
            }
        }

        if (aryan.includes('amar name ki') || aryan.includes('amr nam ki') || aryan.includes('amar nam ki') || aryan.includes('amr name ki') || aryan.includes('whats my name')) {
            const res = await axios.get(`${baseApiUrl}?text=amar name ki&senderID=${userId}&key=intro`);
            return message.reply(res.data.reply);
        }

        const res = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(aryan)}&senderID=${userId}&font=1`);
        const replyText = res.data.reply;

        const sentMessage = await message.reply(replyText);

        global.ownersv2.replies.set(sentMessage.message_id, {
            nix: { name: nix.name },
            type: "reply",
            messageID: sentMessage.message_id,
            author: userId,
            data: replyText,
            apiUrl: baseApiUrl
        });

    } catch (e) {
        console.error(`Error in bby command:`, e);
        return message.reply(`An error occurred: ${e.message}`);
    }
}

async function onReply({ bot, message, msg, chatId, userId, args, data, commandName, replyMsg }) {
    try {
        const repliedToMessageId = replyMsg.message_id;
        const currentReplyData = global.ownersv2.replies.get(repliedToMessageId);

        if (!currentReplyData) {
            return;
        }

        const userMessage = msg.text ? msg.text.toLowerCase() : "";

        const res = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(userMessage)}&senderID=${userId}&font=1`);
        const aiResponse = res.data.reply;

        const sentMessage = await bot.sendMessage(chatId, aiResponse, {
            reply_to_message_id: msg.message_id
        });

        global.ownersv2.replies.set(sentMessage.message_id, {
            nix: { name: currentReplyData.nix.name || nix.name },
            type: "reply",
            messageID: sentMessage.message_id,
            author: userId,
            data: aiResponse,
            apiUrl: baseApiUrl
        });

    } catch (err) {
        console.error(`Error in bby onReply:`, err);
        return bot.sendMessage(chatId, `An error occurred while processing your reply: ${err.message}`);
    }
}

async function onChat({ bot, message, msg, chatId, args }) {
    const text = msg.text ? msg.text.toLowerCase() : "";
    const userId = msg.from.id;

    // Get the configured prefix from global settings
    const botPrefix = global.settings.prefix; 

    // If the message starts with the prefix, it's a command. Let onStart handle it.
    if (text.startsWith(botPrefix)) {
        return true; 
    }

    const triggerWords = ["বেবী", "bby", "bot", "jan", "babu", "janu"];
    const startsWithTrigger = triggerWords.some(word => text.startsWith(word));

    if (!startsWithTrigger) {
        return true;
    }

    const messageContent = text.replace(/^\S+\s*/, "").trim();

    try {
        if (!messageContent) {
            const randomReplies = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno"];
            const sentMessage = await message.reply(randomReplies[Math.floor(Math.random() * randomReplies.length)]);

            global.ownersv2.replies.set(sentMessage.message_id, {
                nix: { name: nix.name },
                type: "reply",
                messageID: sentMessage.message_id,
                author: userId
            });
            return false;
        }

        const res = await axios.get(`${baseApiUrl}?text=${encodeURIComponent(messageContent)}&senderID=${userId}&font=1`);
        const aiResponse = res.data.reply;

        const sentMessage = await message.reply(aiResponse);

        global.ownersv2.replies.set(sentMessage.message_id, {
            nix: { name: nix.name },
            type: "reply",
            messageID: sentMessage.message_id,
            author: userId,
            data: aiResponse
        });

        return false;
    } catch (err) {
        console.error(`Error in bby onChat:`, err);
        message.reply(`An error occurred during chat interaction: ${err.message}`);
        return false;
    }
}

module.exports = { nix, onStart, onReply, onChat };
