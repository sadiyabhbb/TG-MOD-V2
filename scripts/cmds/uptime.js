const os = require('os');
const process = require('process');

const nix = {
    name: "uptime",
    aliases: ["upt", "up"],
    author: "ArYAN",
    description: "Get system and bot uptime information",
    category: "utility",
    usage: "uptime",
    prefix: true,
};

async function onStart({ message }) {
    try {
        function formatTime(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h}h ${m}m ${s}s`;
        }

        const systemUptime = formatTime(os.uptime());
        const processUptime = formatTime(process.uptime());
    
        const systemInfo = {
            os: os.type() + " " + os.release(),
            cores: os.cpus().length,
            architecture: os.arch(),
            totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + " GB",
            freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + " GB",
            ramUsage: ((os.totalmem() - os.freemem()) / (1024 ** 2)).toFixed(2) + " MB",
        };

        const uptimeMessage = `
╭──✦ 「 ⏱️ Uptime Information 」
├‣ ⚙️ System Uptime: ${systemUptime}
╰‣ 🤖 Bot Uptime: ${processUptime}

╭──✦ 「 🖥️ System Information 」
├‣ 🌐 OS: ${systemInfo.os}
├‣ 💻 Cores: ${systemInfo.cores}
├‣ ⚙️ Architecture: ${systemInfo.architecture}
├‣ 🔋 Node Version: ${process.version}
├‣ 💾 Total Memory: ${systemInfo.totalMemory}
├‣ 🧠 Free Memory: ${systemInfo.freeMemory}
╰‣ 📊 RAM Usage: ${systemInfo.ramUsage}`;
        
        await message.reply(uptimeMessage);
    } catch (err) {
        await message.reply(`❌ | An error occurred: ${err.message}`);
    }
}

module.exports = {
    nix,
    onStart
};
