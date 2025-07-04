// Import nessesary files and modules
const Config = require("./modules/config.js");
const fetch = require("node-fetch");
const fs = require("fs");
const { discordSendMsg } = require("./modules/discordmsg.js");
const { readConfigFile } = require("./modules/readConfigFile.js");
const { parse } = require("path");

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
async function getCookie(url = "https://www.vinted.pl/") {
    try {
        const response = await fetch(url, { 
            redirect: 'follow',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none'
            }
        });

        // Get all 'set-cookie' headers
        const setCookieHeaders = response.headers.raw()['set-cookie'];
        console.log("Set-Cookie headers:", setCookieHeaders);

        // Extract all necessary cookies
        let cookies = {};
        if (setCookieHeaders) {
            for (const cookieHeader of setCookieHeaders) {
                const cookieParts = cookieHeader.split(';')[0].split('=');
                if (cookieParts.length === 2) {
                    const [name, value] = cookieParts;
                    cookies[name] = value;
                }
            }
        }

        // Build cookie string with all necessary cookies
        let cookieString = Object.entries(cookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');

        console.log("All cookies:", cookies);
        console.log("Cookie string:", cookieString);
        return cookieString;
    } catch (error) {
        console.error("Error getting cookie:", error);
        return null;
    }
}

// getData helps to get data from vinted website
async function getData(url = parseUrl()) {
    const cookieString = await getCookie();
    
    if (!cookieString) {
        throw new Error("Failed to get cookies");
    }

    const req = await fetch(url, {
        headers: {
            'Cookie': cookieString,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.vinted.pl/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'X-Requested-With': 'XMLHttpRequest'
        },
    });

    let res;
    try {
        res = await req.json();
    } catch (err) {
        const text = await req.text();
        console.error("Failed to parse JSON. Response was:", text);
        console.error("Status:", req.status);
        console.error("Headers:", req.headers.raw());
        throw err;
    }

    console.log("API Response status:", req.status);
    console.log("API Response data:", res);
    return res;
}

// scrape helps to scrape data from vinted website
async function scrape() {
    try {
        const fetchedOffers = await getData(parseUrl());
        return fetchedOffers;
    } catch (error) {
        console.error("Error during scraping:", error);
        throw error;
    }
}

// startScraping helps to start scraping data from vinted website
async function startScraping() {
    try {
        const res = await scrape();
        
        if (!res || !res.items || res.items.length === 0) {
            console.log("No items found in response");
            return;
        }
        
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
    } catch (error) {
        console.error("Error in startScraping:", error);
    }
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
