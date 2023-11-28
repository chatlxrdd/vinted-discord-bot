const Config = require("./modules/config.js");
const prompt = require("prompt-sync")();
const fetch = require("node-fetch");
const fs = require("fs");

const vintedUrl = Config.vintedLink;

function parseUrl() {
    const url = `https://www.vinted.pl/api/v2/catalog/items?`;
    const itemsPerPage = prompt("Items per page: ");
    const catalogIds = prompt("Catalog IDs: ");
    const colorIds = prompt("Color IDs: ");
    const brandIds = prompt("Brand IDs: ");
    const sizeIds = prompt("Size IDs: ");
    const materialIds = prompt("Material IDs: ");
    const videoGameRatingIds = prompt("Video game rating IDs: ");
    const price = prompt("Price: ");
    const currency = prompt("Currency: ");
    const order = "newest_first";
    return `${url}per_page=${itemsPerPage}&catalog_ids=${catalogIds}&color_ids=${colorIds}&brand_ids=${brandIds}&size_ids=${sizeIds}&material_ids=${materialIds}&video_game_rating_ids=${videoGameRatingIds}&price=${price}&currency=${currency}&order=${order}`;
}

// next updates: Figure ou how to set up a discord bot and send the data to a channel
// next updates: Make it run indefinitely every 1 minute

function getCookie(url = vintedUrl) {
    return fetch(url)
        .then((req) => req.headers.get("set-cookie"))
        .then((cookies) => /_vinted_fr_session=([^;]+)/.exec(cookies)?.[1]);
}

function getData(url) {
    return getCookie().then((cookie) =>
        fetch(url, {
            headers: {
                cookie: `_vinted_fr_session=${cookie}`,
            },
        }).then((req) => req.json())
    );
}

function scrape() {
    const fetchedOffers = getData(parseUrl());
    return fetchedOffers;
}

function startScraping() {
    scrape()
        .then((res) => {
            console.log(res);
        })
        .catch((error) => {
            console.error(error);
        });
}

// Run the scraping function every 1 minute
setInterval(startScraping, 3000);
