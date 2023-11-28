const Config = require("./modules/config.js");
const prompt = require("prompt-sync")();
const fetch = require("node-fetch");
const fs = require("fs");
const { discordSendMsg } = require("./modules/discordmsg.js");

const vintedUrl = Config.vintedLink;

function parseUrl() {
    const url = `https://www.vinted.pl/api/v2/catalog/items?`;

    const params = {
        items_per_page: prompt("Items per page: "),
        catalog_ids: prompt("Catalog IDs: "),
        color_ids: prompt("Color IDs: "),
        brand_ids: prompt("Brand IDs: "),
        size_ids: prompt("Size IDs: "),
        material_ids: prompt("Material IDs: "),
        video_game_rating_ids: prompt("Video game rating IDs: "),
        price: prompt("Price: "),
        currency: prompt("Currency: "),
        order: "newest_first",
    };

    for (const param of Object.keys(params)) {
        params[param];
    }
    const urlParams = new URLSearchParams(params).toString();

    return `${url}${urlParams}`;

    // const itemsPerPage = prompt("Items per page: ");
    // const catalogIds = prompt("Catalog IDs: ");
    // const colorIds = prompt("Color IDs: ");
    // const brandIds = prompt("Brand IDs: ");
    // const sizeIds = prompt("Size IDs: ");
    // const materialIds = prompt("Material IDs: ");
    // const videoGameRatingIds = prompt("Video game rating IDs: ");
    // const price = prompt("Price: ");
    // const currency = prompt("Currency: ");
    // const order = "newest_first";
    // return `${url}items_per_page=${itemsPerPage}&catalog_ids=${catalogIds}&color_ids=${colorIds}&brand_ids=${brandIds}&size_ids=${sizeIds}&material_ids=${materialIds}&video_game_rating_ids=${videoGameRatingIds}&price=${price}&currency=${currency}&order=${order}`;
}

// next updates: Figure ou how to set up a discord bot and send the data to a channel
// next updates: Make it run indefinitely every 1 minute

function getCookie(url = vintedUrl) {
    return fetch(url)
        .then((req) => req.headers.get("set-cookie"))
        .then((cookies) => /_vinted_fr_session=([^;]+)/.exec(cookies)?.[1]);
}


async function getData(url = dataUrl) {
    const req = await fetch(url, {
        headers: {
            cookie: `_vinted_fr_session=${await getCookie()}`,
        },
    });

    const res = await req.json();

    return res;

    // const highestTimestampItem = res.reduce((highest, current) => {
    //     return current.timestamp > highest.timestamp ? current : highest;
    // });

    // return highestTimestampItem;
    // const res = await req.json();

    // return res;

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
    fs.readFile("./cache.json", "utf8", function (err, data) {
        if (err) {
            console.error(err.message);
            return;
        }

        console.log("data", JSON.parse(data));

        discordSendMsg(JSON.parse(data));
    });
}
=======
// Run the scraping function every 1 minute
setInterval(startScraping, 3000);

