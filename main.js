// Import nessesary files and modules
const Config = require("./modules/config.js");
const fetch = require("node-fetch");
const fs = require("fs");
const { discordSendMsg } = require("./modules/discordmsg.js");

// Define variables
const vintedUrl = Config.vintedLink;

// parseUrl helps to parse url with parameters from config.js
function parseUrl() {
    const parametersConfig = Config.params;
    const url = "https://www.vinted.pl/api/v2/catalog/items?";

    const parameters = {
        per_page: parametersConfig.per_page,
        catalog_ids: parametersConfig.catalog_ids,
        color_ids: parametersConfig.color_ids,
        brand_ids: parametersConfig.brand_ids,
        size_ids: parametersConfig.size_ids,
        material_ids: parametersConfig.material_ids,
        price: parametersConfig.price,
        currency: parametersConfig.currency,
        order: parametersConfig.order,
        search_text: parametersConfig.search_text,
    };

    const urlParams = new URLSearchParams(parameters).toString();
    console.log(`${url}${urlParams}`); // debug delete befor release
    return `${url}${urlParams}`;
}

// getCookie helps to get cookie from vinted website
function getCookie(url = vintedUrl) {
    return fetch(url)
        .then((req) => req.headers.get("set-cookie"))
        .then((cookies) => /_vinted_fr_session=([^;]+)/.exec(cookies)?.[1]);
}

// getData helps to get data from vinted website
async function getData(url = parseUrl) {
    const req = await fetch(url, {
        headers: {
            cookie: `_vinted_fr_session=${await getCookie()}`,
        },
    });

    const res = await req.json();

    return res;
}

// scrape helps to scrape data from vinted website
function scrape() {
    const fetchedOffers = getData(parseUrl());
    return fetchedOffers;
}

// startScraping helps to start scraping data from vinted website
function startScraping() {
    scrape()
        .then((res) => {
            const newesPost = res.items[0];
            fs.writeFile(
                "cache.json",
                JSON.stringify(newesPost, null, 4),
                (err) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }

                    discordInit();
                }
            );
        })
        .catch((error) => {
            console.error(error);
        });
}

// discordInit helps to initialize discord bot when new offer occures
function discordInit() {
    fs.readFile("./cache.json", "utf8", function (err, data) {
        if (err) {
            console.error(err.message);
            return;
        }
        const parsedData = JSON.parse(data);
        //console.log("id", JSON.parse(data)); // debug

        if (parsedData.id !== lastItemId) {
            //console.log("ID się zmieniło. Wysyłam wiadomość."); // debug
            discordSendMsg();
            lastItemId = parsedData.id;
            //console.log("lastItemId", parsedData.id); // debug
        } else {
            //console.log("ID nie zmieniło się. Nie wysyłam wiadomości."); // debug
        }
    });
}

let lastItemId = null;

const frequency = 2 * 1000; // 2 seconds
setInterval(function () {
    // console.log(`Frequency set to: ${frequency}`); // debug message
    startScraping();
}, frequency);
