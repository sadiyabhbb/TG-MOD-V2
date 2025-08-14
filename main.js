const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const https = require("https");

const c = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  pink: "\x1b[95m",
  orange: "\x1b[38;5;208m",
  mint: "\x1b[38;5;121m",
  lavender: "\x1b[38;5;183m",
  bold: "\x1b[1m",
};

// --- LOG FILTER TO HIDE PORT & MESSAGESURL ---
const messagesUrl = "https://raw.githubusercontent.com/RSF-ARYAN/stuffs/refs/heads/main/raw/messages.json";
const originalLog = console.log;
console.log = (...args) => {
  if (args.some(arg => typeof arg === "string" && arg.includes(messagesUrl))) return;
  if (args.some(arg => typeof arg === "string" && /\bport\b/i.test(arg))) return;
  originalLog(...args);
};

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error(`Failed to parse JSON from ${url}: ${error.message}`));
        }
      });
    }).on("error", (err) => {
      reject(new Error(`Failed to fetch URL ${url}: ${err.message}`));
    });
  });
};

const getMessage = (messages, key, replacements = {}) => {
  let message = messages;
  const keyParts = key.split('.');
  for (const part of keyParts) {
    if (message && typeof message === 'object' && message.hasOwnProperty(part)) {
      message = message[part];
    } else {
      return `[MISSING MESSAGE FOR KEY: ${key}]`;
    }
  }
  if (typeof message !== 'string') {
    return `[INVALID MESSAGE TYPE FOR KEY: ${key}]`;
  }
  for (const [placeholder, value] of Object.entries(replacements)) {
    message = message.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), value);
  }
  return message;
};

const main = async () => {
  let messages = {};

  try {
    messages = await fetchJson(messagesUrl);
    console.log(`${c.green}[INFO]${c.reset} Messages loaded successfully`);
  } catch (error) {
    console.error(`${c.red}[ERROR]${c.reset} ${error.message}`);
    process.exit(1);
  }

  const configPath = path.join(process.cwd(), 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(`${c.red}[ERROR]${c.reset} ${getMessage(messages, 'errors.configNotFound')}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  global.config = config;

  const cmdsDir = path.join(__dirname, "scripts", "cmds");
  const eventsDir = path.join(__dirname, "scripts", "events");

  console.log(`${c.cyan}${getMessage(messages, 'separators.line')}\n${c.bold}${c.pink}${getMessage(messages, 'info.loadingCmds')}${c.red}\n${getMessage(messages, 'separators.line')}${c.reset}`);

  const loadCmds = () => {
    const cmds = new Map();
    if (!fs.existsSync(cmdsDir)) {
      console.warn(`${c.yellow}[WARNING]${c.reset} ${getMessage(messages, 'warnings.cmdsDirNotFound', { dir: cmdsDir })}`);
      return cmds;
    }
    const commandFiles = fs.readdirSync(cmdsDir).filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      try {
        const command = require(path.join(cmdsDir, file));
        if (command.nix?.name) {
          cmds.set(command.nix.name.toLowerCase(), command);
          console.log(`${c.green}[COMMAND]${c.reset} ${getMessage(messages, 'info.cmdLoaded', { file })}`);
        } else {
          console.warn(`${c.yellow}[SKIP]${c.reset} ${getMessage(messages, 'warnings.missingCmdName', { file })}`);
        }
      } catch (err) {
        console.error(`${c.red}[ERROR]${c.reset} ${getMessage(messages, 'errors.failedToLoadCmd', { file, message: err.message })}`);
      }
    }
    return cmds;
  };

  const cmds = loadCmds();

  console.log(`\n${c.cyan}${getMessage(messages, 'separators.line')}\n${c.bold}${c.pink}${getMessage(messages, 'info.loadingEvents')}${c.red}\n${getMessage(messages, 'separators.line')}${c.reset}`);

  const loadEvents = () => {
    if (!fs.existsSync(eventsDir)) {
      console.warn(`${c.yellow}[WARNING]${c.reset} ${getMessage(messages, 'warnings.eventsDirNotFound', { dir: eventsDir })}`);
      return;
    }
    const eventFiles = fs.readdirSync(eventsDir).filter((file) => file.endsWith(".js"));
    for (const file of eventFiles) {
      try {
        require(path.join(eventsDir, file));
        console.log(`${c.green}[EVENT]${c.reset} ${getMessage(messages, 'info.eventLoaded', { file })}`);
      } catch (err) {
        console.error(`${c.red}[ERROR]${c.reset} ${getMessage(messages, 'errors.failedToLoadEvent', { file, message: err.message })}`);
      }
    }
  };

  loadEvents();

  console.log(`\n${c.cyan}${getMessage(messages, 'separators.line')}\n${c.bold}${c.pink}${getMessage(messages, 'info.loadingAdminInfo')}${c.red}\n${getMessage(messages, 'separators.line')}${c.reset}`);

  const adminTxtUrl = "https://raw.githubusercontent.com/RSF-ARYAN/stuffs/refs/heads/main/raw/ck.txt";
  https.get(adminTxtUrl, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log(`${c.cyan}${data.trim()}${c.cyan}`);
    });
  }).on("error", (err) => {
    console.error(`${c.red}[ERROR]${c.cyan} ${getMessage(messages, 'errors.failedToFetchAdmin', { message: err.message })}`);
  });

  let botProcess = null;
  const manageBotProcess = (scripts) => {
    if (botProcess) {
      botProcess.kill();
      console.log(`${c.yellow}[PROCESS]${c.reset} ${getMessage(messages, 'warnings.processTerminated', { script: scripts })}`);
    }
    botProcess = spawn("node", ["--trace-warnings", "--async-stack-traces", scripts], {
      cwd: __dirname,
      stdio: "inherit",
      shell: true,
    });
    botProcess.on("close", (code) => {
      console.log(`${c.yellow}[PROCESS]${c.cyan} ${getMessage(messages, 'warnings.processExited', { script: scripts, code })}`);
    });
    botProcess.on("error", (err) => {
      console.error(`${c.red}[PROCESS ERROR]${c.cyan} ${getMessage(messages, 'errors.processStartFailed', { script: scripts, message: err.message })}`);
    });
  };

  manageBotProcess("bot/main.js");
  
  return { cmds };
};

module.exports = main();
