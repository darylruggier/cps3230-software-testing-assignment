const { BeforeAll, Given, When, Then } = require('@cucumber/cucumber')
const puppeteer = require('puppeteer');
const assert = require ('assert');

let browser;
let page;

BeforeAll(async () => {
  // let launchProperties = { 
  //   headless: constants.headlessMode, 
  //   ignoreHTTPSErrors: true,
  //   args: [ '--no-sandbox',
  //           '--disable-setuid-sandbox'
  //         ],
  //  }

  browser = await puppeteer.launch(); // launching browser
  // creating page and setting its viewport + HTTP headers
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 })
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6'
  })
});

Given(/^I am (.*) a user of marketalertum$/, async function () {
  await page.goto('https://www.marketalertum.com');
  await page.evaluate(async () => {
    const button = await page.waitForXPath("//a[contains(text(), 'My Alerts')]");
    await button[0].click();
  });
  await page.waitForNavigation();
});

When('I login using invalid credentials', async function () {
  await page.goto('https://www.marketalertum.com/Alerts/Login');
  await page.$eval('input[name=UserId]', el => el.value = 'incorreeeecttt');
  await page.click('input[type="submit"]');
  await page.waitForNavigation();
});

Then('I should see the login screen again', async function () {
  assert.equal(await page.url(), "https://www.marketalertum.com/Alerts/Login");
});
