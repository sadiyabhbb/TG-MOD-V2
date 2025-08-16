const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const { Message } = require("../../bot/custom.js");

module.exports = {
  nix: {
    name: "video",
    aliases: [],
    version: "1.4.3",
    author: "ArYAN",
    cooldown: 5,
    role: 0,
    category: "utility",
    shortDescription: "Download YouTube video or audio",
    longDescription: "Use '/video [name]' to search, '/video -v [YouTube URL]' for video, or '/video -a [YouTube URL]' for audio.",
    guide: "video leja re\nvideo -v https://youtu.be/abc123\nvideo -a https://youtu.be/abc123"
  },

  onStart: async function ({ bot, message, msg, chatId, args, usages }) {
    const apiKey = "itzaryan";
    let type = "video";
    let videoId, topResult;
    let processingMessageId;
    let downloadPath;

    try {
      const mode = args[0];
      const inputArg = args[1];
      
      const processingMsg = await bot.sendMessage(chatId, "📥 Fetching your media...");
      processingMessageId = processingMsg.message_id;
      
      if ((mode === "-v" || mode === "-a") && inputArg) {
        type = mode === "-a" ? "audio" : "video";
        let urlObj;
        try {
          urlObj = new URL(inputArg);
        } catch {
          throw new Error("❌ Invalid YouTube URL.");
        }
        
        if (urlObj.hostname === "youtu.be") {
          videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes("youtube.com")) {
          const urlParams = new URLSearchParams(urlObj.search);
          videoId = urlParams.get("v");
        }
        
        if (!videoId) throw new Error("❌ Could not extract video ID from URL.");
        
        const infoRes = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        topResult = { 
          title: infoRes.data.title || "Unknown Title", 
          author: { name: infoRes.data.author_name || "Unknown Channel" }, 
          timestamp: "0:00", 
          views: 0, 
          ago: "N/A" 
        };
      } else {
        const query = args.join(" ");
        if (!query) throw new Error("❌ Please enter a video name or YouTube URL.");
        
        const searchResults = await ytSearch(query);
        if (!searchResults || !searchResults.videos.length) {
          throw new Error("❌ No results found.");
        }
        
        topResult = searchResults.videos[0];
        videoId = topResult.videoId;
      }
      
      const timestamp = topResult.timestamp || "0:00";
      const parts = timestamp.split(":").map(Number);
      const durationSeconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
      
      if (durationSeconds > 600) {
        throw new Error(`❌ Video too long (${timestamp}). Only videos under 10 minutes are supported.`);
      }

      const apiUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${videoId}&type=${type}&apikey=${apiKey}`;
      
      const downloadResponse = await axios.get(apiUrl, { timeout: 30000 });
      const downloadUrl = downloadResponse.data.downloadUrl;
      
      if (!downloadUrl) throw new Error("❌ Failed to get download link.");
      
      const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      
      const ext = type === "audio" ? "mp3" : "mp4";
      const safeTitle = topResult.title.replace(/[\\/:*?"<>|]/g, "").substring(0, 50);
      const filename = `${safeTitle}.${ext}`;
      downloadPath = path.join(__dirname, filename);
      
      fs.writeFileSync(downloadPath, buffer);
      
      const caption = `${type === "audio" ? "🎵 AUDIO INFO" : "🎬 VIDEO INFO"}\n` + 
                      `━━━━━━━━━━━━━━━\n` + 
                      `📌 Title: ${topResult.title}\n` + 
                      `🎞 Duration: ${topResult.timestamp || "Unknown"}\n` + 
                      `📺 Channel: ${topResult.author.name}\n` + 
                      `👁 Views: ${topResult.views?.toLocaleString?.() || "N/A"}\n` + 
                      `📅 Uploaded: ${topResult.ago || "N/A"}`;
      
      const options = {
        reply_to_message_id: msg.message_id,
        caption: caption,
        thumb: topResult.thumbnail, // Optional thumbnail
        duration: durationSeconds,
        fileName: filename
      };

      if (type === "video") {
        await bot.sendVideo(chatId, downloadPath, options);
      } else {
        await bot.sendAudio(chatId, downloadPath, options);
      }

    } catch (err) {
      console.error("Error:", err.message);
      bot.sendMessage(chatId, err.message, { reply_to_message_id: msg.message_id });
    } finally {
      if (processingMessageId) {
        bot.deleteMessage(chatId, processingMessageId);
      }
      if (downloadPath && fs.existsSync(downloadPath)) {
        fs.unlinkSync(downloadPath);
      }
    }
  }
};
