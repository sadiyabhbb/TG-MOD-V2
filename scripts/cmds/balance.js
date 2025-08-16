const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, '../../database/balance.json');

const getBalanceData = () => {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({}));
        return {};
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
};

const nix = {
  nix: {
    name: "bal",
    aliases: ["balance", "money"],
    author: "ArYAN",
    version: "1.0",
    cooldowns: 5,
    role: 0,
    description: "Shows the user's current balance.",
    category: "GAMES",
    guide: "Use: {pn}"
  },
  onStart: async function ({ message, userId }) {
    const balances = getBalanceData();
    const userBalance = balances[userId] ? balances[userId].money : 0;
    
    message.reply(`💸 Your balance: ${userBalance} BDT`);
  }
};

module.exports = nix;
