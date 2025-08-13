"use strict";

const { execSync } = require("child_process");

const RESTART_CODE = 0;

exports.install = function() {
  const originalRequire = module.constructor.prototype.require;

  module.constructor.prototype.require = function(moduleName) {
    try {
      return originalRequire.call(this, moduleName);
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND" && !moduleName.startsWith(".") && !moduleName.startsWith("/")) {
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

function restartBot() {
  console.log("Bot restarting now...");
  process.exit(RESTART_CODE);
}

if (!global.install) {
  exports.install();
  global.install = true;
}
