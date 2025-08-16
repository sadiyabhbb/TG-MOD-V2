const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../database/balance.json');

const getData = () => {
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify({}));
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
};

const saveData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

const nix = {
    nix: {
        name: "daily",
        aliases: ["claim"],
        author: "ArYAN",
        version: "1.0",
        cooldowns: 5,
        role: 0,
        description: "Claim your daily money",
        category: "GAMES",
        guide: "Use: {pn}"
    },
    onStart: async function ({ message, userId }) {
        try {
            const balances = getData();
            
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;

            let user = balances[userId] || { money: 0, lastClaim: 0 };
            
            if (now - user.lastClaim < oneDay) {
                const waitTime = oneDay - (now - user.lastClaim);
                const hours = Math.floor(waitTime / (1000 * 60 * 60));
                const minutes = Math.floor((waitTime % (1000 * 60 * 60)) / (1000 * 60));
                return await message.reply(`⏳ You already claimed your daily reward.\nTry again in ${hours}h ${minutes}m.`);
            }

            const reward = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
            user.money += reward;
            user.lastClaim = now;
            
            balances[userId] = user;
            saveData(balances);

            await message.reply(`💰 You claimed ${reward} BDT!\nYour total balance: ${user.money} BDT`);
        } catch (err) {
            console.error('❌ Error in daily command:', err);
            await message.reply('❌ Something went wrong. Please try again later.');
        }
    }
};

module.exports = nix;
