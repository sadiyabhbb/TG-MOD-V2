const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ARYAN_API = "https://nix-album-api.vercel.app";

module.exports = {
  nix: {
    name: "album",
    version: "0.0.1",
    role: 0,
    author: "ArYAN",
    description: "Send random videos from an album.",
    category: "media",
    cooldowns: 5,
    prefix: true,
  },

  onStart: async function ({ bot, message, msg, args, chatId }) {
    const categories = ["funny", "islamic", "sad", "anime", "lofi", "attitude", "ff", "love"];
    const displayNames = ["Funny", "Islamic", "Sad", "Anime", "LoFi", "Attitude", "FF", "Love"];
    
    if (!global.teamnix) {
        global.teamnix = {};
    }

    const getKeyboard = () => {
      const buttons = categories.map((cat, index) => ({
        text: displayNames[index],
        callback_data: `album_${cat}`,
      }));

      const keyboard = [];
      for (let i = 0; i < buttons.length; i += 2) { 
        keyboard.push(buttons.slice(i, i + 2));
      }

      return {
        reply_markup: {
          inline_keyboard: keyboard,
        },
      };
    };

    if (args[0] === "add") {
      const category = args[1]?.toLowerCase();
      let videoUrl = args[2];
      
      if (!category) {
        return message.reply("Please specify a category. Usage: `!album add [category] [video_url]`");
      }
      
      if (msg.reply_to_message?.video) {
        videoUrl = msg.reply_to_message.video.file_id;
      }
      
      if (!videoUrl) {
        return message.reply("Please provide a video URL or reply to a video message.");
      }
      
      try {
        const addResponse = await axios.post(`${ARYAN_API}/api/album/add`, { category, videoUrl });
        return message.reply(addResponse.data.message);
      } catch (error) {
        console.error(error);
        return message.reply(`Failed to add video.\nError: ${error.response?.data?.error || error.message}`);
      }
    } else if (args[0] === "list") {
      try {
        const response = await axios.get(`${ARYAN_API}/api/category/list`);
        if (response.data.success) {
          const catList = response.data.categories.map((cat, index) => `${index + 1}. ${cat}`).join("\n");
          return message.reply(`Available Album Categories:\n\n${catList}`);
        } else {
          return message.reply(`Failed to fetch categories.\nError: ${response.data.error}`);
        }
      } catch (error) {
        return message.reply("Error while fetching categories from the API. Please check the server and try again later.");
      }
    } else {
      const keyboardOptions = getKeyboard();
      await bot.sendMessage(chatId, "𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨 𝐋𝐢𝐬𝐭 🎀\n\n**Select a category:**", {
        ...keyboardOptions,
        parse_mode: "Markdown",
        reply_to_message_id: msg.message_id
      });
    }
  },

  onCallback: async function ({ bot, callbackQuery, chatId, messageId }) {
    const header = "🎯 𝐀𝐥𝐛𝐮𝐦\n━━━━━━━━━━━━━\n\n";
    const data = callbackQuery.data;

    await bot.answerCallbackQuery(callbackQuery.id);

    if (data.startsWith("album_")) {
      const category = data.split('_')[1];
      const categoryNames = { "funny": "Funny Video", "islamic": "Islamic Video", "sad": "Sad Video", "anime": "Anime Video", "lofi": "LoFi Video", "attitude": "Attitude Video", "ff": "Ff Video", "love": "Love Video" };
      
      await bot.editMessageText(`Loading video for category: **${categoryNames[category]}**`, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
      });

      try {
        const response = await axios.get(`${ARYAN_API}/api/album/videos/${category}`);
        if (!response.data.success || !response.data.videos || response.data.videos.length === 0) {
          return bot.editMessageText(header + `❌ No videos found for this category: **${categoryNames[category]}**`, {
              chat_id: chatId,
              message_id: messageId,
              parse_mode: "Markdown",
          });
        }
        
        const videoUrls = response.data.videos;
        const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
        const caption = `Here is your ${categoryNames[category]} Baby <💖`;
        
        await bot.sendVideo(
          chatId,
          randomVideoUrl,
          { caption: caption }
        );

        bot.deleteMessage(chatId, messageId);

      } catch (error) {
        console.error("Error fetching video:", error);
        await bot.editMessageText(header + "An error occurred while fetching the video.", {
            chat_id: chatId,
            message_id: messageId,
        });
      }
    }
  }
};
