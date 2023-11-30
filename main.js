const Config = require("./modules/config.js");
const fetch = require("node-fetch");

const fs = require("fs");
const { discordSendMsg } = require("./modules/discordmsg.js");

const vintedUrl = Config.vintedLink;

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
    console.log(`${url}${urlParams}`);
    return `${url}${urlParams}`;
}

function getCookie(url = vintedUrl) {
    return fetch(url)
        .then((req) => req.headers.get("set-cookie"))
        .then((cookies) => /_vinted_fr_session=([^;]+)/.exec(cookies)?.[1]);
}

async function getData(url = parseUrl) {
    const req = await fetch(url, {
        headers: {
            cookie: `_vinted_fr_session=${await getCookie()}`,
        },
    });

    const res = await req.json();

    return res;
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
    // const cachedOffers = discordInit();
    // const offers = getNewOffers(fetchedOffers, cachedOffers);
    // console.log(offers);
    return fetchedOffers;
}

function startScraping() {
    // Trzeba dodac cos w momencie ktorym oferta sie powtarza, zeby nie wysylac tego samego posta na discorda

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
                    console.log("Post added successfully.");
                }
            );
        })
        .catch((error) => {
            console.error(error);
        });
}

function discordInit() {
    fs.readFile("./cache.json", "utf8", function (err, data) {
        if (err) {
            console.error(err.message);
            return;
        }
        const parsedData = JSON.parse(data);
        console.log("id", JSON.parse(data));

        if (parsedData.itemId !== lastItemId) {
            console.log("ID się zmieniło. Wysyłam wiadomość.");
            discordSendMsg();
            lastItemId = parsedData.itemId;
        } else {
            console.log("ID nie zmieniło się. Nie wysyłam wiadomości.");
        }
    });
}

let lastItemId = null;

const frequency = 2 * 1000; // 2 seconds
setInterval(function () {
    console.log(`Frequency set to: ${frequency}`); // debug message
    startScraping();
}, frequency);
