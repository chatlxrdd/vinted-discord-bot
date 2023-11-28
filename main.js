const Config = require("./modules/config.js");
const prompt = require("prompt-sync")();
const fetch = require("node-fetch");
const catalogcfg = require("./modules/catalogscfg.jons");
const fs = require("fs");
const { discordSendMsg } = require("./modules/discordmsg.js");

const vintedUrl = Config.vintedLink;
const dataUrl = null;

function parseUrl() {
    const url = "https://www.vinted.pl/api/v2/catalog/items?";
    const storedParams = catalogcfg.params;

    const params = {
        per_page:
            prompt(`Items per page (${storedParams.per_page}): `) ||
            storedParams.per_page,
        catalog_ids:
            prompt(`Catalog IDs (${storedParams.catalog_ids}): `) ||
            storedParams.catalog_ids,
        color_ids:
            prompt(`Color IDs (${storedParams.color_ids}): `) ||
            storedParams.color_ids,
        brand_ids:
            prompt(`Brand IDs (${storedParams.brand_ids}): `) ||
            storedParams.brand_ids,
        size_ids:
            prompt(`Size IDs (${storedParams.size_ids}): `) ||
            storedParams.size_ids,
        material_ids:
            prompt(`Material IDs (${storedParams.material_ids}): `) ||
            storedParams.material_ids,
        video_game_rating_ids:
            prompt(
                `Video game rating IDs (${storedParams.video_game_rating_ids}): `
            ) || storedParams.video_game_rating_ids,
        price: prompt(`Price (${storedParams.price}): `) || storedParams.price,
        currency:
            prompt(`Currency (${storedParams.currency}): `) ||
            storedParams.currency,
        order: "newest_first",
    };

    config.params = params;
    fs.writeFileSync("./catalogs/config.json", JSON.stringify(config, null, 4));

    const urlParams = new URLSearchParams(params).toString();
    return `${url}${urlParams}`;
}

// next updates: Figure ou how to set up a discord bot and send the data to a channel
// next updates: Make it run indefinitely every 1 minute

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
    return fetchedOffers;
}

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
                    console.log("Post added successfully.");
                }
            );
        })
        .catch((error) => {
            console.error(error);
        });
}

function discordInit() {
    fs.readFile("./cache/cache.json", "utf8", function (err, data) {
        if (err) {
            console.error(err.message);
            return;
        }

        console.log("data", JSON.parse(data));

        //discordSendMsg(JSON.parse(data));
    });
}

if (dataUrl == null) {
    parseUrl();
} else {
    startScraping();
}
