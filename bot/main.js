const fs = require('fs');
const path = require('path');
const { loadScripts } = require('./login/loadScripts');
const { utils } = require('../func/utils.js');

const configPath = path.join(process.cwd(), 'config.json');
const tokenPath = path.join(process.cwd(), 'token.txt');

if (!fs.existsSync(configPath) || !fs.existsSync(tokenPath)) {
  console.error("Error: config.json or token.txt not found in the root directory.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));

global.config = config;
global.token = token;

global.ownersv2 = {
  cmds: new Map(),
  cooldowns: new Map(),
  replies: new Map(),
  callbacks: new Map(),
  events: new Map()
};

global.scripts = scriptsUtils;

scriptsUtils();

const { log } = require('./login/log');
login();
