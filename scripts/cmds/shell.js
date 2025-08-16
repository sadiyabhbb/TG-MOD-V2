const { exec } = require("child_process");

const nix = {
  nix: {
    name: "shell",
    aliases: ["sh", "terminal"],
    author: "ArYAN",
    version: "1.0",
    cooldowns: 10,
    role: 2,
    description: "Execute shell commands (developer only).",
    category: "DEVELOPER",
    guide: "Use: {pn} <command>"
  },
  onStart: async function ({ message, args }) {
    const command = args.join(" ").trim();
    if (!command) {
      return message.reply("⚠️ Usage: shell <command>");
    }

    exec(command, { timeout: 10000 }, async (error, stdout, stderr) => {
      let output = "";

      if (error) {
        output += `❌ Error:\n${error.message}\n`;
      }
      if (stderr) {
        output += `⚠️ Stderr:\n${stderr}\n`;
      }
      if (stdout) {
        output += `✅ Output:\n${stdout}\n`;
      }

      if (output.length > 3000) {
        output = output.slice(0, 3000) + "\n...truncated";
      }

      await message.reply(output || "✅ Done.");
    });
  }
};

module.exports = nix;
