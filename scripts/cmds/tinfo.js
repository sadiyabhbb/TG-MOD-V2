const axios = require("axios");

const nix = {
  name: "tinfo",
  version: "0.0.1",
  author: "ArYAN",
  role: 0,
  category: "info",
  description: "Get TikTok user info by username",
  guide: "<username>",
  cooldown: 5,
};

async function onStart({ bot, args, chatId, message }) {
  const input = args.join(" ").trim();

  if (!input) {
    return bot.sendMessage(chatId, "❌ Please provide a TikTok username.");
  }

  try {
    const response = await axios.get(
      `https://aryanx-apisx.onrender.com/tikstalk?username=${encodeURIComponent(input)}`
    );

    const data = response.data;

    if (!data || !data.username) {
      return bot.sendMessage(chatId, "❌ User not found.");
    }

    const {
      nickname,
      username,
      avatarLarger,
      heartCount,
      followerCount,
      followingCount,
      videoCount,
      relation,
    } = data;

    const caption = 
`📱 Nickname: ${nickname}
👤 Username: ${username}
❤️ Likes: ${heartCount}
👥 Followers: ${followerCount}
➡️ Following: ${followingCount}
🎥 Videos: ${videoCount}
🔗 Relation: ${relation}`;

   
    const avatarRes = await axios.get(avatarLarger, { responseType: "stream" });

    return bot.sendPhoto(chatId, avatarRes.data, { caption });
  } catch (error) {
    console.error("tinfo error:", error);
    return bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
}

module.exports = {
  nix,
  onStart,
};
