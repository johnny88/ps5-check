import dotenv from 'dotenv';
dotenv.config();

import puppeteer from 'puppeteer';
import axios from 'axios';

const webhallenURL =
  'https://www.webhallen.com/se/product/320479-Playstation-5-Digital-Edition';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(webhallenURL, { waitUntil: 'networkidle0' });
  const title = await page.$eval(
    '#add-product-to-cart button',
    (el) => el.title
  );
  await axios.post(
    process.env.SLACK_HOOK_URL ? process.env.SLACK_HOOK_URL : '',
    { text: `Webhallen: ${title}` }
  );
  await browser.close();
})();
