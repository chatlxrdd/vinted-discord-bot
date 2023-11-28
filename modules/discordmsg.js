const Discord = require('discord.js');
const Config = require('./config.js');

function discordSendMsg(newOffers){
    if(newOffers.length == 0) return;

    const client = new Discord.Client({
        intents: ['MessageContent', 'Guilds', 'GuildMessages']
    });


    client.on('ready', () => {

        console.log(`Logged in as ${client.user.tag}`);
        const channelId = Config.discord.channelID;
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            newOffers.map(offer => channel.send({
                embeds: [
                    {
                        title: offer.title,
                        url: offer.url,
                        color: 0x008000, // Green color
                        thumbnail: {
                            url: offer?.photo?.url,
                        },
                        fields: [
                            {
                                name: "Price",
                                value: `**${offer.total_item_price}** ${offer.currency}`,
                                inline: true, // Display inline with other fields
                            },
                            {
                                name: "Brand",
                                value: offer.brand_title || "Not specified",
                                inline: true,
                            },
                        ],
                        footer: {
                            text: "Offer details",
                        },
                    },
                ],
            }))
        } else {
            console.error(`Unable to find channel ${channelId}`);
        }
    });

    client.login(Config.discord.token);
}

module.exports = { discordSendMsg }