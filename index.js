const puppeteer = require('puppeteer');
const Airtable = require('airtable');
const functions = require('firebase-functions')


     const checkBB = functions.pubsub
    .topic('checkBB')
    .onPublish(async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    await page.goto('https://bigbasket.com');

    // Get the "viewport" of the page, as reported by the page.
    const slotValue = await page.evaluate(() => {
        const slotValue = document.querySelector("div.owl-stage-outer > div > div:nth-child(1) > div > div > product-template-in-container > div.owl-pd.clearfix > div:nth-child(4) > div.col-sm-12.col-xs-12.add-bskt > div > div.delivery-opt > span > div:nth-child(1) > p > span.ng-binding").innerText;
        return slotValue;
    });

    const fullSlotText = 'All Slots Full. Please Try Again Later';
    const isSlotFull = slotValue === fullSlotText;


    const base = new Airtable({apiKey: 'keyGvfBga5UEEcprP'}).base('appJ8ht6UBXvHVXON');

    base('Table 1').create([
        {
            "fields": {Time: new Date(), "Is Available?": !isSlotFull}
        }
    ], {typecast: true}, function (err, records) {
        if (err) {
            console.error(err);
            return;
        }

    });

    await browser.close();
});
module.exports = {checkBB}