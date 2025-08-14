const nix = {
  name: "uid",
  aliases: ["id"],
  version: "1.0.1",
  type: "anyone",
  category: "system",
  description: "Get only user ID",
  cooldown: 0,
  prefix: false,
  guide: "uid",
  author: "ArYAN"
};

async function onStart({ bot, message, msg }) {
  const userInfo = msg.reply_to_message ? msg.reply_to_message.from : msg.from;
  await message.reply(`• UID: <code>${userInfo.id}</code>`, { parse_mode: "HTML" });
}

module.exports = { nix, onStart };
