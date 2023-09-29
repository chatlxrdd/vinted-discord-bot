// const puppeteer = require('puppeteer');
const fs = require('fs');
const Discord = require('discord.js');

const Config = require('./modules/config.js');

const vintedUrl = Config.vintedLink;

const itemsPerPage = '1'; // ile itemkow ma sie pojawic w API (mniej = szybciej działający kod)
const catalogIds = '1242'; // id katalogu, łatwo znalezc wystarczy sprawdzic url na stronie
const colorIds = ''; // to samo co wyzej
const brandIds = ''; // jeszcze nie wiem ale sie dowiem ^^
const sizeIds = ''; // to samo co wyzej
const materialIds = ''; // to samo co wyzej
const videoGameRatingIds = '';
const price = '100' //   to samo co wyzej
const currency = 'PLN'; // waluta w jakiej ma byc cena (EUR, PLN, USD)
const order = 'newest_first'; // sposob w jaki przedmioty sa ukladane w api (newest_first = od najnowszych) (oldest_first = od najstarszych)

const dataUrl = `https://www.vinted.pl/api/v2/catalog/items?per_page=${itemsPerPage}&catalog_ids=${catalogIds}&color_ids=${colorIds}&brand_ids=${brandIds}&size_ids=${sizeIds}&material_ids=${materialIds}&video_game_rating_ids=${videoGameRatingIds}&status_ids&price_to=${price}&currency=${currency}&order=${order}`

console.log(dataUrl);
console.log('Starting scraper...');
startScraping();
setInterval(startScraping, Config.refreshTime);


async function getCookie(url = vintedUrl){
    const req = await fetch(url);
    const cookies = await req.headers.get('set-cookie');
    const cookie = /_vinted_fr_session=([^;]+)/.exec(cookies)?.[1]
    return cookie
}

async function getData(url = dataUrl){
    const req = await fetch(url, {
        headers: {
            cookie: `_vinted_fr_session=${await getCookie()}`
        }
    })
    const res = await req.json();
    if (res && res.items) {
        const fetchedOffers = res.items;

        // Add a timestamp to each item in fetchedOffers
        const currentTime = Date.now();
        const offersWithTimestamps = fetchedOffers.map(offer => ({
            ...offer,
            timestamp: currentTime,
        }));

        // Sort the offers by timestamp in descending order
        offersWithTimestamps.sort((a, b) => b.timestamp - a.timestamp);

        // Get the item with the highest timestamp
        const highestTimestampItem = offersWithTimestamps[0];

        // Return only the item with the highest timestamp
        return [highestTimestampItem]
    }

    return null; // No items found
}

async function scrape(){
    const fetchedOffers = await getData();
    const cachedOffers = getCachedOffers();
    const newOffers = getNewOffers(cachedOffers, fetchedOffers);
    const addedOffers = logOffers(cachedOffers, newOffers);
    if(addedOffers.length != 0){
        console.log(`Found ${addedOffers.length}`)
        console.table(addedOffers.map(x => ({
            title: x.title,
            price: x.total_item_price,
            url: x.url,
        })))
    } 

    return addedOffers
}


function startScraping() {
    scrape()
        .then((res) => {
            discordSendMsg(res);
        })
        .catch((error) => {
            console.error('Error:', error)
            console.log('Restarting bot...')
            setTimeout(() => startScraping(), Config.refreshTime);
        })
}

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

function getCachedOffers() {
    const cacheFilePath = './cache/offers.json';
    if (fs.existsSync(cacheFilePath)) {
        const cacheData = fs.readFileSync(cacheFilePath);
        return JSON.parse(cacheData);
    } else {
        return [];
    }
}

function logOffers(cachedOffers, fetchedOffers) {
    const newOffers = getNewOffers(cachedOffers, fetchedOffers);
    const data = JSON.stringify([...cachedOffers, ...newOffers], null, 2);
    const path = './cache/offers.json';
    fs.mkdirSync('./cache', { recursive: true }); // create the cache directory if it does not exist
    fs.writeFileSync(path, data);
    return newOffers;
}

function getNewOffers(cachedOffers, fetchedOffers) {
    if (!cachedOffers || !fetchedOffers) return [];
    const cachedUrls = cachedOffers.map(offer => offer.url);
    const newOffers = fetchedOffers.filter(offer => !cachedUrls.includes(offer.url));
    return newOffers;
}

