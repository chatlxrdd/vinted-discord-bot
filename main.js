const Config = require('./modules/config.js');
const prompt = require('prompt-sync')();
const fs = require('fs');

const vintedUrl = Config.vintedLink;

function parseUrl() {
    const url = `https://www.vinted.pl/api/v2/catalog/items?`
    const itemsPerPage = prompt('Items per page: ');
    const catalogIds = prompt('Catalog IDs: ');
    const colorIds = prompt('Color IDs: ');
    const brandIds = prompt('Brand IDs: ');
    const sizeIds = prompt('Size IDs: ');
    const materialIds = prompt('Material IDs: ');
    const videoGameRatingIds = prompt('Video game rating IDs: ');
    const price = prompt('Price: ');
    const currency = prompt('Currency: ');
    const order = 'newest_first';
    return `${url}items_per_page=${itemsPerPage}&catalog_ids=${catalogIds}&color_ids=${colorIds}&brand_ids=${brandIds}&size_ids=${sizeIds}&material_ids=${materialIds}&video_game_rating_ids=${videoGameRatingIds}&price=${price}&currency=${currency}&order=${order}`;
}
const dataUrl = parseUrl();

console.log(dataUrl);
console.log('Starting scraper...');
startScraping();



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
    
    return res;
}

async function scrape(){
    const fetchedOffers = await getData();
    return fetchedOffers
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



