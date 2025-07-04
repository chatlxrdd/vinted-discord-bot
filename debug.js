const fetch = require('node-fetch');

async function getCookies(url = "https://www.vinted.pl/") {
    const response = await fetch(url, { redirect: 'manual' });
    // Get all 'set-cookie' headers
    const rawCookies = response.headers.raw()['set-cookie'];
    console.log("Set-Cookie headers:", rawCookies);

    // Parse cookies into an object
    const cookies = {};
    if (rawCookies) {
        rawCookies.forEach(cookieStr => {
            const [cookiePair] = cookieStr.split(';');
            const [key, value] = cookiePair.split('=');
            cookies[key.trim()] = value.trim();
        });
    }
    console.log("All cookies:", cookies);
}

getCookies();
