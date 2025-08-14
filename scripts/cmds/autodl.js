const axios = require("axios");
const fs = require("fs");
const path = require("path");

const nix = {
  name: "autodl",
  keyword: [
    "https://vt.tiktok.com",
    "https://www.tiktok.com/",
    "https://www.facebook.com",
    "https://www.instagram.com/",
    "https://youtu.be/",
    "https://youtube.com/",
    "https://x.com/",
    "https://twitter.com/",
    "https://vm.tiktok.com",
    "https://fb.watch",
  ],
  aliases: [],
  version: "1.0.3",
  author: "ArYAN",
  description: "Instant downloader for videos from social media.",
  guide: ["[video_link]"],
  cooldown: 0,
  type: "anyone",
  category: "media",
};

async function onStart({ bot, chatId }) {
  await bot.sendMessage(chatId, "Send a video link, and I'll download it for you!", {
    parse_mode: "HTML",
  });
}

async function onWord({ bot, msg, chatId }) {
  const messageText = msg.link_preview_options?.url || msg.text || "";
  const detectedUrl = nix.keyword.find((url) => messageText.startsWith(url));
  if (!detectedUrl) return;

  const messageId = msg.message_id;
  const waitMessage = await bot.sendMessage(chatId, "⏳ Downloading...", { reply_to_message_id: messageId });
  const waitMId = waitMessage.message_id;

  try {
    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const videoPath = path.join(tempDir, `video_${Date.now()}.mp4`);

    let apiUrl = "";
    let platform = "";

    if (messageText.includes("tiktok")) {
      platform = "tiktok";
      apiUrl = `https://api-aryan-xyz.vercel.app/tikdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
    } else if (messageText.includes("instagram")) {
      platform = "instagram";
      apiUrl = `https://api-aryan-xyz.vercel.app/igdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
    } else if (messageText.includes("facebook")) {
      platform = "facebook";
      apiUrl = `https://api-aryan-xyz.vercel.app/fbdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
    } else if (messageText.includes("youtube") || messageText.includes("youtu.be")) {
      platform = "youtube";
      apiUrl = `https://api-aryan-xyz.vercel.app/ytdl?url=${encodeURIComponent(messageText)}&apikey=ArYAN`;
    } else {
      throw new Error("Unsupported URL");
    }

    const { data } = await axios.get(apiUrl);

    let videoUrl = "";
    let title = "Video downloaded!";

    switch (platform) {
      case "tiktok":
        videoUrl = data?.result?.url || data?.result?.video_url || data?.result?.videoUrl || data?.result?.result?.video_url;
        title = data?.result?.title || "TikTok Video";
        break;
      case "instagram":
        videoUrl = data?.result?.result?.video_url || data?.result?.video_url || data?.result?.videoUrl;
        title = data?.result?.result?.title || data?.result?.title || "Instagram Video";
        break;
      case "facebook":
        videoUrl = data?.result?.videoUrl || data?.result?.url || data?.result?.response?.["360p"]?.download_url;
        title =
          data?.result?.title ||
          data?.result?.response?.["360p"]?.title ||
          "Facebook Video";
        break;
      case "youtube":
        if (data?.result?.response) {
          
          videoUrl = data.result.response["720p"]?.download_url || data.result.response["360p"]?.download_url || "";
          title = data.result.response["720p"]?.title || data.result.response["360p"]?.title || "YouTube Video";
        } else {
          videoUrl = data?.result?.url || data?.result;
          title = data?.result?.title || "YouTube Video";
        }
        break;
    }

    if (!videoUrl) throw new Error("No video URL found in API response.");

    const writer = fs.createWriteStream(videoPath);
    const response = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
    });

    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await bot.deleteMessage(chatId, waitMId);

    await bot.sendVideo(
      chatId,
      videoPath,
      {
        caption: `✅ download successfull`,
        reply_to_message_id: messageId,
      },
      {
        filename: "video.mp4",
        contentType: "video/mp4",
      }
    );

    fs.unlinkSync(videoPath);
  } catch (error) {
    await bot.sendMessage(chatId, `❎ Error: ${error.message}`, { reply_to_message_id: messageId });
  }
}

module.exports = {
  nix,
  onStart,
  onWord,
};
