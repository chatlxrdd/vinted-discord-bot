const puppeteer = require("puppeteer");

// get html from vinted website
async function getHtml() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://www.vinted.pl/");
    const html = await page.content();
    return html;
}
console.log(getHtml()); // debug
