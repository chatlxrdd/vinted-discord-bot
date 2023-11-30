const Discord = require("discord.js");
const Config = require("./config.js");
const fs = require("fs");

function discordSendMsg() {
    const client = new Discord.Client({
        intents: ["MessageContent", "Guilds", "GuildMessages"],
    });

    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
        const channelId = Config.discord.channelID;
        const channel = client.channels.cache.get(channelId);

        if (channel) {
            fs.readFile("./cache.json", (err, data) => {
                if (err) throw err;
                let _msgs = JSON.stringify(JSON.parse(data), null, 2);
                channel.send("```json\n" + _msgs + "\n```");
                console.log(_msgs);
            });
        }

        client.login(Config.discord.token);
    });
}

module.exports = { discordSendMsg };
