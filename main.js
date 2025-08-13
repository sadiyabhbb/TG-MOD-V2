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

const commandsDir = path.join(__dirname, "apps", "scripts", "commands");
const eventsDir = path.join(__dirname, "apps", "scripts", "events");

console.log(
  `${c.cyan}────────────────────────────────────────────\n${c.bold}${c.pink}LOADING COMMANDS${c.reset}\n────────────────────────────────────────────${c.reset}`
);

const loadCommands = () => {
  const commands = new Map();

  if (!fs.existsSync(commandsDir)) {
    console.warn(`${c.yellow}[WARNING]${c.reset} Commands directory not found: ${commandsDir}`);
    return commands;
  }

  const commandFiles = fs.readdirSync(commandsDir).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const command = require(path.join(commandsDir, file));
      if (command.meta?.name) {
        commands.set(command.meta.name.toLowerCase(), command);
        console.log(`${c.green}[COMMAND]${c.reset} Loaded ${file}`);
      } else {
        console.warn(`${c.yellow}[SKIP]${c.reset} Missing meta.name in ${file}`);
      }
    } catch (err) {
      console.error(`${c.red}[ERROR]${c.reset} Failed to load ${file}: ${err.message}`);
    }
  }

  return commands;
};

const commands = loadCommands();

console.log(
  `\n${c.cyan}────────────────────────────────────────────\n${c.bold}${c.lavender}LOADING EVENTS${c.reset}\n────────────────────────────────────────────${c.reset}`
);

const loadEvents = () => {
  if (!fs.existsSync(eventsDir)) {
    console.warn(`${c.yellow}[WARNING]${c.reset} Events directory not found: ${eventsDir}`);
    return;
  }

  const eventFiles = fs.readdirSync(eventsDir).filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    try {
      require(path.join(eventsDir, file));
      console.log(`${c.orange}[EVENT]${c.reset} Loaded ${file}`);
    } catch (err) {
      console.error(`${c.red}[ERROR]${c.reset} Failed to load event ${file}: ${err.message}`);
    }
  }
};

loadEvents();

const botInfo = {
  login: "Bot logged in successfully",
  info: "Running ✅",
};

console.log(
  `\n${c.cyan}────────────────────────────────────────────\n${c.bold}${c.pink}BOT INFO${c.reset}\n────────────────────────────────────────────${c.reset}`
);
console.log(`${c.mint}Login:${c.reset} Successfully logged in`);
console.log(`${c.lavender}Username:${c.reset} ${c.bold}${botInfo.username}${c.reset}`);
console.log(`${c.lavender}Bot Name:${c.reset} ${c.bold}${botInfo.name}${c.reset}`);
console.log(`${c.lavender}Bot ID:${c.reset} ${c.bold}${botInfo.id}${c.reset}`);

console.log(
  `\n${c.cyan}────────────────────────────────────────────\n${c.bold}${c.orange}ADMIN INFO${c.reset}\n────────────────────────────────────────────${c.reset}`
);

const adminTxtUrl =
  "https://raw.githubusercontent.com/itzaryan008/Telegram-Control/main/admin.txt";

https
  .get(adminTxtUrl, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log(`${c.cyan}${data.trim()}${c.reset}`);
    });
  })
  .on("error", (err) => {
    console.error(`${c.red}[ERROR]${c.reset} Could not fetch admin info: ${err.message}`);
  });

let botProcess = null;

const manageBotProcess = (script) => {
  if (botProcess) {
    botProcess.kill();
    console.log(`${c.yellow}[PROCESS]${c.reset} Terminated previous instance of ${script}`);
  }

  botProcess = spawn("node", ["--trace-warnings", "--async-stack-traces", script], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
  });

  botProcess.on("close", (code) => {
    console.log(`${c.yellow}[PROCESS]${c.reset} ${script} exited with code ${code}`);
  });

  botProcess.on("error", (err) => {
    console.error(`${c.red}[PROCESS ERROR]${c.reset} Failed to start ${script}: ${err.message}`);
  });
};

manageBotProcess("core/main.js");

module.exports = { commands };
