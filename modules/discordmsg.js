const Discord = require("discord.js");
const Config = require("./config.js");
const fs = require("fs");
const { parse } = require("path");

function discordSendMsg() {
    const client = new Discord.Client({
        intents: [
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
        ],
    });

    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
        const channelId = Config.discord.channelID;
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            fs.readFile("./cache.json", (err, data) => {
                if (err) throw err;
                let parseJSON = JSON.parse(data);
                channel.send({
                    embeds: [
                        {
                            title: parseJSON.title,
                            url: parseJSON.url,
                            fields: [
                                {
                                    name: "**``💶`` Cena**",
                                    value:
                                        `\`\`\`YAML\n${parseJSON.price} PLN\`\`\`` ??
                                        "Aucun",
                                    inline: true,
                                },
                                {
                                    name: "**``📏`` Rozmiar**",
                                    value:
                                        `\`\`\`YAML\n${parseJSON.size_title}\`\`\`` ??
                                        "Aucune",
                                    inline: true,
                                },
                                {
                                    name: "**``🔖`` Marka**",
                                    value:
                                        `\`\`\`YAML\n${parseJSON.brand_title}\`\`\`` ??
                                        "Aucune",
                                    inline: true,
                                },
                                {
                                    name: "**``👨`` Użytkownik**",
                                    value:
                                        `\`\`\`YAML\n${parseJSON.user.login}\`\`\`` ??
                                        "Aucune",
                                    inline: true,
                                },
                            ],
                            image: { url: parseJSON.photo?.url },
                            timestamp: new Date(
                                parseJSON.photo.high_resolution.timestamp * 1000
                            ),
                            color: "#09b1ba",
                        },
                    ],
                    components: [
                        new Discord.MessageActionRow().addComponents([
                            new Discord.MessageButton()
                                .setLabel("Link")
                                .setURL(parseJSON.url)
                                .setEmoji("🗄️")
                                .setStyle("LINK"),
                            new Discord.MessageButton()
                                .setLabel("Kup Teraz")
                                .setURL(
                                    `https://www.vinted.pl/transaction/buy/new?source_screen=item&transaction%5Bitem_id%5D=${parseJSON.id}`
                                )
                                .setEmoji("🪐")
                                .setStyle("LINK"),
                        ]),
                    ],
                });
                console.log(parseJSON);
            });
        }
    });

    client.login(Config.discord.token);
}

module.exports = { discordSendMsg };
