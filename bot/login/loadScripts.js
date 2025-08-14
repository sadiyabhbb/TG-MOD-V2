"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const RESTART_CODE = 0;
const RESTART_FILE = path.join(__dirname, "../../restart.json");

function restartBot(chatId) {
  if (chatId) {
    fs.writeFileSync(RESTART_FILE, JSON.stringify({ chatId }));
  }
  console.log("Bot restarting now...");
  process.exit(RESTART_CODE);
}

exports.install = function () {
  const originalRequire = module.constructor.prototype.require;
  module.constructor.prototype.require = function (moduleName) {
    try {
      return originalRequire.call(this, moduleName);
    } catch (error) {
      if (
        error.code === "MODULE_NOT_FOUND" &&
        !moduleName.startsWith(".") &&
        !moduleName.startsWith("/")
      ) {
        console.log(`NPM module '${moduleName}' not found. Attempting to install...`);
        try {
          execSync(`npm install ${moduleName}`, {
            stdio: "inherit",
            cwd: process.cwd(),
          });
          console.log(`Successfully installed '${moduleName}'. Restarting bot...`);
          restartBot();
          return originalRequire.call(this, moduleName);
        } catch (installError) {
          console.error(`Failed to install '${moduleName}': ${installError.message}`);
          throw installError;
        }
      }
      throw error;
    }
  };
};

exports.restartBot = restartBot;
exports.RESTART_FILE = RESTART_FILE;

if (!global.install) {
  exports.install();
  global.install = true;
}
