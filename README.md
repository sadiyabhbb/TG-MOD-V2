<img src="https://i.imgur.com/spCJE2T.jpeg" alt="banner">
<h1 align="center"><img src="./dashboard/images/logo-non-bg.png" width="22px"> Nix Bot - Bot Chat Telegram</h1>
  
---

## Setup

### Prerequisites

1. **Bot Token**  
   Get it from [BotFather](https://t.me/BotFather) on Telegram.  
   ![BotFather Preview](https://i.imgur.com/1eBNpbK.jpeg)

2. **Verification with Manybot**  
   After obtaining the token, verify it to get your bot's URL (`t.me/<bot_username>`) using [Manybot](https://t.me/Manybot).  
   ![Manybot Preview](https://i.imgur.com/uENHXlz.jpeg)

3. **Admin ID**  
   Retrieve it via [MyIDBot](https://t.me/myidbot).  
   ![MyIDBot Preview](https://i.imgur.com/pwwMlg1.jpeg)
   
### Configuration
1. Add the Bot Token to `config.json`.
2. Add the Admin ID to `config.json`.
3. For VIP add the Admin ID to `config.json`.

### Run the Bot
1. Fork this [Repo](https://github.com/FNG-ARYAN/TG-BOT-V2).

2. Add the following build command:
   ```bash
   npm install
   ```

3. Use the following start command:
   ```bash
   node index.js
   ```

### Deployment

You can deploy the bot on the following platforms:
- [Hosting](https://katabump.com)
- [Render](https://render.com)
- [Railway](https://railway.app)
- [Koyeb](https://koyeb.com)
- [Litegix](https://litegix.com)
- Pterodactyl Panels (self-managed)
---

## Bot Command Structure

Commands in Ownersv2 follow a specific structure for consistency and maintainability. Here's the basic template:

```javascript
const nix = {
  name: "example",
  version: "0.0.1",
  aliases: [],             
  description: "",         
  author: "ArYAN",             
  prefix: true,         
  category: "",           
  type: "anyone",         
  cooldown: 5,            
  guide: ""  
};

async function onStart({ bot, args, message, msg, usages }) {
  // Command logic here
}

module.exports = { nix, onStart };
```

### Message Handling Methods

1. **Text Messages**
```javascript
// Reply to message
message.reply("Hello World!");

// Send new message
bot.sendMessage(msg.chat.id, "Hello World!");
```

2. **Image Messages**
```javascript
// Send image from URL
bot.sendPhoto(msg.chat.id, "https://example.com/image.jpg", {
  caption: "Optional caption"
});

// Send image from local file
bot.sendPhoto(msg.chat.id, "./path/to/image.jpg", {
  caption: "Optional caption"
});
```

3. **Video Messages**
```javascript
// Send video from URL
bot.sendVideo(msg.chat.id, "https://example.com/video.mp4", {
  caption: "Optional caption"
});

// Send video from local file
bot.sendVideo(msg.chat.id, "./path/to/video.mp4", {
  caption: "Optional caption"
});
```

4. **Audio Messages**
```javascript
// Send audio from URL
bot.sendAudio(msg.chat.id, "https://example.com/audio.mp3", {
  caption: "Now playing"
});

// Send audio from local file
bot.sendAudio(msg.chat.id, "./path/to/audio.mp3", {
  caption: "Now playing"
});
```

5. **Delete Messages**
```javascript
// Delete a specific message
bot.deleteMessage(msg.chat.id, msg.message_id);

// Delete bot's reply after delay (in milliseconds)
const reply = await message.reply("This will be deleted");
setTimeout(() => {
  bot.deleteMessage(msg.chat.id, reply.message_id);
}, 5000); // Deletes after 5 seconds
```

6. **Edit Messages**
```javascript
// Edit Media (e.g., replace photo in a message)
bot.editMessageMedia(
  {
    type: "photo",
    media: "https://example.com/new-neko.jpg",
    caption: "Here's another neko!",
  },
  {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🔁",
            callback_data: JSON.stringify({
              command: "neko",
              gameMessageId: msg.message_id
            }),
          },
        ],
      ],
    },
  }
);
```

7. **callback**
```javascript
//edit your scripts/cmds/aryan/callback.json
[
"cmd name here", "cmd name here2"
]
```

8. **noprefix**
```javascript
 prefix: true enable
 prefix: false disable
 ```

---

## Support 

For issues, open an issue in the repo or contact me on:
- [Facebook](https://www.facebook.com/profile.php?id=100001200784032)
