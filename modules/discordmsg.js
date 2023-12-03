const Discord = require("discord.js");
const Config = require("./config.js");
const { readConfigFile } = require("./readConfigFile.js");
const fs = require("fs");

function writeConfigFile(configData) {
    try {
        fs.writeFileSync(
            "./modules/configParms.json",
            JSON.stringify(configData, null, 4)
        );
        console.log("Plik konfiguracyjny został zaktualizowany.");
    } catch (error) {
        console.error(
            "Błąd podczas zapisywania pliku konfiguracyjnego:",
            error.message
        );
    }
}

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
            });
        }
    });

    client.login(Config.discord.token);
}
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
    ],
});
client.on("message", (message) => {
    if (message.author.bot) return; // Ignoruj wiadomości od botów
    if (!message.content.startsWith("!")) return; // Komendy zaczynają się od !

    const args = message.content.slice(1).split(" ");
    const command = args.shift().toLowerCase();

    if (command === "zmien") {
        // Komenda !zmienparametr per_page 10 (przykład)
        const paramName = args[0];
        const paramValue = args[1];

        if (!paramName || !paramValue) {
            message.reply("Użycie: !zmien <nazwa_parametru> <nowa_wartość>");
            return;
        }

        const configData = readConfigFile();

        if (configData) {
            configData.params[paramName] = paramValue;
            writeConfigFile(configData);
            message.reply(`Zmieniono parametr ${paramName} na ${paramValue}`);
        } else {
            message.reply(
                "Wystąpił błąd podczas odczytu pliku konfiguracyjnego."
            );
        }
    }
    if (command === "lista") {
        message.reply(
            "Lista parametrów:\nsearch_text - Zmiana szukanej frazy \nprice - Zmiana maksymalnej ceny \ncurrency - Zmiana waluty\ncatalog_ids - Zmiana katalogu (użyj !katalog aby otrzymać liste dostępnych katalogów)\ncolor_ids - Zmiana id koloru \nbrand_ids - Zmiana marki (id marki znajduje sie pod komendą !brand)\nsize_ids - Zmiana rozmiaru (id rozmiaru znajduje sie pod komendą !size)\nmaterial_ids - Zmiana materiału (id materiału znajduje sie pod komendą !fabric)"
        );
    }
    if (command === "pomoc") {
        message.reply(
            "Lista komend:\n!zmien <nazwa_parametru> <nowa_wartość> - zmiana parametru\n!pomoc - wyświetla listę komend\n!lista - wyświetla listę parametrów\n!katalog - wyświetla listę katalogów\n!brand - wyświetla listę marek\n!size - wyświetla listę rozmiarów\n!fabric - wyświetla listę materiałów"
        );
    }
    if (command === "katalog") {
        message.reply(
            "Lista katalogów:\nMezczyzni Ubrania\n1206 - Okrycie wierzchne\n32 - garnitury i marynarki\n34 - spodnie\n85 - bielizna i skarpetki'\n30 - odziez sportowa\n83 - inne\n257 - jeans\n76 - tshierty i topy\n79 - swetry bluzy\n80 - szorty\n84 - stroje kompielowe\n92 - przebrania i stroje tematyczne"
        );
    }
    if (command === "ustawienia") {
        const configData = readConfigFile();

        if (configData) {
            message.reply(
                `Aktualne ustawienia:\nsearch_text - ${configData.params.search_text}\nprice - ${configData.params.price}\ncurrency - ${configData.params.currency}\ncatalog_ids - ${configData.params.catalog_ids}\ncolor_ids - ${configData.params.color_ids}\nbrand_ids - ${configData.params.brand_ids}\nsize_ids - ${configData.params.size_ids}\nmaterial_ids - ${configData.params.material_ids}`
            );
        } else {
            message.reply(
                "Wystąpił błąd podczas odczytu pliku konfiguracyjnego."
            );
        }
    }
});

module.exports = { discordSendMsg };
