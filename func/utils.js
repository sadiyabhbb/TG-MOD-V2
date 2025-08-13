"use strict";

const { execSync } = require("child_process");
const fs = require('fs-extra');
const path = require('path');
const { create, clear } = require('../database/cache.js');

const RESTART_CODE = 0;

exports.install = function() {
  const originalRequire = module.constructor.prototype.require;

  module.constructor.prototype.require = function(moduleName) {
    try {
      return originalRequire.call(this, moduleName);
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND" && !moduleName.startsWith(".") && !moduleName.startsWith("/")) {
        execSync(`npm install ${moduleName}`, {
          stdio: "inherit",
          cwd: process.cwd(),
        });
        restartBot();

        return originalRequire.call(this, moduleName);
      }
      throw error;
    }
  };
};

function restartBot() {
  process.exit(RESTART_CODE);
}

if (!global.install) {
  exports.install();
  global.install = true;
}

const cacheReady = (async () => {
  await create();
  await clear();
})();

function validateModule(module) {
  if (!module) {
    throw new Error('No export found in module');
  }
  if (!module.nix) {
    throw new Error('Missing nix property in module');
  }
  if (!module.nix.name || typeof module.nix.name !== 'string') {
    throw new Error('Missing or invalid nix.name in module');
  }
  if (!module.onStart) {
    throw new Error('Missing onStart method in module');
  }
}

async function loadDirectory(directory, moduleType, collection) {
  const errors = {};

  try {
    const files = await fs.readdir(directory);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    for (const file of jsFiles) {
      try {
        const modulePath = path.join(directory, file);
        const module = require(modulePath);
        const moduleExport = module.default || module;

        validateModule(moduleExport);
        collection.set(moduleExport.nix.name, moduleExport);
      } catch (error) {
        errors[file] = error;
      }
    }
  } catch (error) {
    errors.directory = error;
  }

  return errors;
}

async function scriptsUtils() {
  await cacheReady;

  const errors = {};
  const cmdsPath = path.join(process.cwd(), 'scripts', 'cmds');
  const eventsPath = path.join(process.cwd(), 'scripts', 'events');

  const [commandErrors, eventErrors] = await Promise.all([
    loadDirectory(cmdsPath, 'cmds', global.ownersv2.cmds),
    loadDirectory(eventsPath, 'events', global.ownersv2.events)
  ]);

  Object.assign(errors, commandErrors, eventErrors);

  return Object.keys(errors).length === 0 ? false : errors;
}

module.exports = { utils: scriptsUtils };
