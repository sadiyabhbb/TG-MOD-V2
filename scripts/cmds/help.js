module.exports = {
  nix: {
    name: 'help',
    prefix: false,
    role: 0,
    category: 'utility',
    aliases: ['commands'],
    author: 'ArYAN',
    version: '0.0.1',
  },

  async onStart({ message, args }) {
    if (!global.teamnix || !global.teamnix.cmds) {
      return message.reply("Command collection is not available.");
    }
    const commands = global.teamnix.cmds;

    if (args.length) {
      const query = args[0].toLowerCase();
      const cmd = [...commands.values()].find(
        c => c.nix.name === query || (c.nix.aliases && c.nix.aliases.includes(query))
      );
      if (!cmd) return message.reply(`No command called “${query}”.`);
      const info = cmd.nix;
      const detail = `
╭─────────────────────◊
│ ▸ Command: ${info.name}
│ ▸ Aliases: ${info.aliases?.length ? info.aliases.join(', ') : 'None'}
│ ▸ Can use: ${info.role === 2 ? 'Admin Only' : info.role === 1 ? 'VIP Only' : 'All Users'}
│ ▸ Category: ${info.category?.toUpperCase() || 'UNCATEGORIZED'}
│ ▸ PrefixEnabled?: ${info.prefix === false ? 'False' : 'True'}
│ ▸ Author: ${info.author || 'Unknown'}
│ ▸ Version: ${info.version || 'N/A'}
╰─────────────────────◊
      `.trim();
      return message.reply(detail);
    }

    const cats = {};
    [...commands.values()]
      .filter((command, index, self) =>
        index === self.findIndex((c) => c.nix.name === command.nix.name)
      )
      .forEach(c => {
        const cat = c.nix.category || 'UNCATEGORIZED';
        if (!cats[cat]) {
          cats[cat] = [];
        }
        if (!cats[cat].includes(c.nix.name)) {
          cats[cat].push(c.nix.name);
        }
      });

    let msg = '';
    Object.keys(cats).sort().forEach(cat => {
      msg += `╭─────『 ${cat.toUpperCase()} 』\n`;
      cats[cat].sort().forEach(n => {
        msg += `│ ▸ ${n}\n`;
      });
      msg += `╰──────────────\n`;
    });

    msg += `
╭──────────────◊
│ » Total commands: ${[...new Set(commands.values())].length}
│ » A Powerful Telegram bot
│ » Aryan Rayhan
╰──────────◊
「 Nix bot 」
    `.trim();

    await message.reply(msg);
  }
};
