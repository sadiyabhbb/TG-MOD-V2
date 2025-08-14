const moment = require("moment-timezone");
const path = require("path");
const fs = require("fs");

const textsPath = path.join(__dirname, '../../languages/texts.txt');
const texts = {};

try {
  const data = fs.readFileSync(textsPath, 'utf8');
  const lines = data.split('\n');
  lines.forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length) {
      texts[key.trim()] = value.join('=').trim();
    }
  });
} catch (error) {
  console.error("Error loading texts.txt:", error);
  process.exit(1);
}

exports.command = async function ({ bot, message, msg, chatId, args }) {
  if (typeof msg.text !== "string") return;

  const text = msg.text;
  const dateNow = Date.now();
  const fullTime = moment.tz(global.config.timeZone || "Asia/Dhaka");

  const timeStr = fullTime.format("HH:mm:ss");
  const dateStr = fullTime.format("DD/MM/YYYY");
  const dayStr = fullTime.format("dddd");
  const yearStr = fullTime.format("YYYY");

  const { admin, symbols, devMode, prefix } = global.config;
  const { cmds, cooldowns } = global.ownersv2;
  const { from, chat } = msg;
  const senderID = String(from.id);
  const userId = from.id;

  const effectivePrefix = prefix;
  const prefixUsed = text.startsWith(effectivePrefix);
  let commandText = prefixUsed ? text.slice(effectivePrefix.length).trim() : text.trim();
  let rawCommandName = commandText.split(/\s+/)[0];

  if (commandText.length === 0) {
    if (prefixUsed) {
      return message.reply(texts.emptyCommand);
    }
    return;
  }

  const commandArgs = commandText.split(/\s+/);
  let commandName = commandArgs.shift().toLowerCase();

  if (commandName.includes("@")) {
    const parts = commandName.split("@");
    commandName = parts[0];
    try {
      const me = await bot.getMe();
      if (parts[1].toLowerCase() !== me.username.toLowerCase()) return;
    } catch (error) {
      console.error("Failed to get bot username:", error);
      return;
    }
  }

  let command = cmds.get(commandName);
  if (!command) {
    for (const cmd of cmds.values()) {
      if (
        Array.isArray(cmd.nix.aliases) &&
        cmd.nix.aliases.map(alias => alias.toLowerCase()).includes(commandName)
      ) {
        command = cmd;
        break;
      }
    }
  }

  if (!command) {
    if (prefixUsed) {
      return message.reply(texts.commandNotFound.replace('{commandName}', commandName));
    }
    return;
  }
  
  const requiredPrefix = command.nix.prefix;

  if (requiredPrefix === false && !prefixUsed) {
    return;
  }
  
  if (requiredPrefix === true && prefixUsed) {
    commandText = text.slice(effectivePrefix.length).trim();
    commandArgs.unshift(...commandText.split(/\s+/).slice(1));
  }
  
  if (requiredPrefix === true && !prefixUsed) {
    commandText = text.trim();
    commandArgs.unshift(...commandText.split(/\s+/).slice(1));
  }

  if (requiredPrefix === false && prefixUsed) {
    commandText = text.slice(effectivePrefix.length).trim();
    commandArgs.unshift(...commandText.split(/\s+/).slice(1));
  }

  commandName = commandText.split(/\s+/)[0].toLowerCase();
  
  const usages = () => {
    if (!command.nix.guide) return;
    let usageText = `${symbols} Usages:\n\n`;
    const displayPrefix = command.nix.prefix === false ? effectivePrefix : "";

    if (Array.isArray(command.nix.guide)) {
      usageText += command.nix.guide.map(guide => `${displayPrefix}${command.nix.name} ${guide}`).join("\n");
    } else {
      usageText += `${displayPrefix}${command.nix.name} ${command.nix.guide}`;
    }

    if (command.nix.description) {
      usageText += `\n- ${command.nix.description}`;
    }

    return message.reply(usageText, { parse_mode: "Markdown" });
  };

  const isBotAdmin = admin.includes(senderID);
  const isVIP = global.vip?.uid?.includes(senderID);

  if (command.nix.type === "administrator" && !isBotAdmin) {
    if (!["group", "supergroup"].includes(chat.type)) {
      return message.reply(texts.adminGroupOnly.replace('{commandName}', command.nix.name));
    }
    try {
      const member = await bot.getChatMember(chatId, senderID);
      if (!(member.status === "administrator" || member.status === "creator")) {
        return message.reply(texts.notGroupAdmin.replace('{commandName}', command.nix.name));
      }
    } catch (error) {
      return message.reply(texts.adminVerificationFailed);
    }
  }

  if (!isBotAdmin) {
    if (command.nix.type === "admin") {
      return message.reply(texts.notBotAdmin.replace('{commandName}', command.nix.name));
    }
    if (command.nix.type === "vip" && !isVIP) {
      return message.reply(texts.notVip.replace('{commandName}', command.nix.name));
    }
    if (command.nix.type === "group" && !["group", "supergroup"].includes(chat.type)) {
      return message.reply(texts.groupOnly.replace('{commandName}', command.nix.name));
    }
    if (command.nix.type === "private" && chat.type !== "private") {
      return message.reply(texts.privateOnly.replace('{commandName}', command.nix.name));
    }
  }

  if (!isBotAdmin) {
    if (!cooldowns.has(command.nix.name)) {
      cooldowns.set(command.nix.name, new Map());
    }

    const timestamps = cooldowns.get(command.nix.name);
    const expirationTime = (command.nix.cooldown || 1) * 1000;

    if (timestamps.has(senderID)) {
      const lastUsed = timestamps.get(senderID);
      const timeLeft = Math.ceil((lastUsed + expirationTime - dateNow) / 1000);
      if (dateNow < lastUsed + expirationTime) {
        return message.reply(texts.cooldown.replace('{timeLeft}', timeLeft).replace('{commandName}', commandName));
      }
    }

    timestamps.set(senderID, dateNow);
  }

  try {
    const context = {
      bot,
      message,
      msg,
      chatId,
      args: commandArgs,
      type: isBotAdmin ? "admin" : "anyone",
      userId,
      usages
    };

    await command.onStart(context);

    if (devMode) {
      const executionTime = Date.now() - dateNow;
      const blue = "\x1b[34m";
      const cyan = "\x1b[36m";
      const reset = "\x1b[0m";
      const separator = `${blue}${"─".repeat(40)}${reset}`;

      const logMessage = `
${separator}
Command         : ${cyan}${commandName}${reset}
Time            : ${cyan}${timeStr}${reset}
Date            : ${cyan}${dateStr}${reset}
Day             : ${cyan}${dayStr}${reset}
Year            : ${cyan}${yearStr}${reset}
Sender ID       : ${cyan}${senderID}${reset}
Execution Time  : ${cyan}${executionTime}ms${reset}
${separator}
      `.trim();

      console.log(logMessage);
    }
  } catch (e) {
    console.error(`\x1b[31m[Error executing command "${commandName}"]\x1b[0m:`, e);
    return message.reply(texts.commandExecutionError.replace('{commandName}', commandName).replace('{errorMessage}', e.message));
  }
};
