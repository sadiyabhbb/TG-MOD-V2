const { cmds } = global.ownersv2;
const fs = require('fs');
const path = require('path');

exports.word = async function ({ bot, message, msg, chatId }) {
  if (!msg || !msg.text) return;

  const text = msg.text.trim();

  if (text.startsWith(global.config.prefix)) return;

  const tokens = text.split(/\s+/);
  if (tokens.length > 0) {
    const firstToken = tokens[0].toLowerCase();
    for (const cmd of cmds.values()) {
      if (cmd.nix.prefix === false || cmd.nix.prefix === "both") {
        if (cmd.nix.name.toLowerCase() === firstToken) return;
        if (
          cmd.nix.aliases &&
          Array.isArray(cmd.nix.aliases) &&
          cmd.nix.aliases.map(alias => alias.toLowerCase()).includes(firstToken)
        ) {
          return;
        }
      }
    }
  }

  for (const cmd of cmds.values()) {
    if (cmd.nix && cmd.nix.keyword) {
      const keywords = Array.isArray(cmd.nix.keyword)
        ? cmd.nix.keyword
        : [cmd.nix.keyword];
      const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "i");

      if (keywordRegex.test(msg.text)) {
        const args = text.split(/\s+/);
        try {
      
          await cmd.onWord({ bot, message, msg, chatId, args });
        } catch (error) {
          console.error(`Error in event handler for command "${cmd.nix.name}": ${error.message}`);
        }
      }
    }
  }
};
