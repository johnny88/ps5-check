import { Handler, Context } from 'aws-lambda';
import puppeteer from 'puppeteer';
import axios from 'axios';
import chromium from 'chrome-aws-lambda';

const webhallenURL =
  'https://www.webhallen.com/se/product/320479-Playstation-5-Digital-Edition';
const slackURL = process.env.SLACK_HOOK_URL ? process.env.SLACK_HOOK_URL : '';

export const run: Handler = async () => {
  let browser;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    await page.goto(webhallenURL, { waitUntil: 'networkidle0' });

    const title = await page.$eval<string>(
      '#add-product-to-cart button',
      (el) => el.title
    );

    console.log(`Status: ${title}`);

    if (title.toString() != 'Tillfälligt fullbokad') {
      await axios.post(slackURL, {
        text: `Time to buy at <${webhallenURL}|Webhallen>`,
      });
    }
  } catch (err) {
    console.error(err);
    await axios.post(slackURL, { text: ':warning: Error check logs' });
  } finally {
    await browser?.close();
  }
};
