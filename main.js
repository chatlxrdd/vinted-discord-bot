// Import nessesary files and modules
const Config = require("./modules/config.js");
const fetch = require("node-fetch");
const fs = require("fs");
const { discordSendMsg } = require("./modules/discordmsg.js");
const { readConfigFile } = require("./modules/readConfigFile.js");
const { parse } = require("path");
const puppeteer = require("puppeteer");

async function startBrowser() {
    const browser = await puppeteer.launch({
        headless: false,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(Config.vintedLink);
    return page;
}
startBrowser();

// Define variables
const vintedUrl = Config.vintedLink;

// parseUrl helps to parse url with parameters from config.js
function parseUrl() {
    const parametersConfig = readConfigFile();
    const url = "https://www.vinted.pl/api/v2/catalog/items?";

    const parameters = {
        per_page: parametersConfig.params.per_page,
        catalog_ids: parametersConfig.params.catalog_ids,
        color_ids: parametersConfig.params.color_ids,
        brand_ids: parametersConfig.params.brand_ids,
        size_ids: parametersConfig.params.size_ids,
        material_ids: parametersConfig.params.material_ids,
        total_item_price: parametersConfig.params.total_item_price,
        currency: parametersConfig.params.currency,
        order: parametersConfig.params.order,
        search_text: parametersConfig.params.search_text,
    };

    const urlParams = new URLSearchParams(parameters).toString();
    //console.log(`${url}${urlParams}`); // debug delete befor release
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
    console.log(res); // debug
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
            console.log("ID się zmieniło. Wysyłam wiadomość."); // debug
            discordSendMsg();
            lastItemId = parsedData.id;
            //console.log("lastItemId", parsedData.id); // debug
        }
    });
}

let lastItemId = null;

const frequency = 5 * 1000; // 2 seconds

setInterval(function () {
    const newConfigParams = readConfigFile();

    if (newConfigParams) {
        // Jeżeli plik konfiguracyjny został zmieniony, użyj nowych parametrów
        parseUrl(newConfigParams.params);
        startScraping();
    }
}, frequency);
