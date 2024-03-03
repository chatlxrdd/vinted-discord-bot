const puppeteer = require("puppeteer");

// get html from vinted website in console
async function main() {
    try {
        const browser = await puppeteer.launch();
        const [page] = await browser.pages();

        await page.goto(
            "https://nl.hideproxy.me/go.php?u=cGGJko8BPPC8hhzRQThea%2Fd8&b=5&f=norefer"
        );
        const data = await page.evaluate(
            () => document.querySelector("*").outerHTML
        );

        console.log(data);

        await browser.close();
    } catch (err) {
        console.error(err);
    }
}
main();
