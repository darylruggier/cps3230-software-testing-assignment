const { BeforeAll, Given, When, Then } = require('@cucumber/cucumber')
const puppeteer = require('puppeteer');

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

// Test 1: Valid Login
Given(/^I am a (.*) user of marketalertum$/, async function() {
  await page.goto('https://www.marketalertum.com');
  await page.evaluate(async () => {
    const button = await page.waitForXPath("//a[contains(text(), 'My Alerts')]");
    await button[0].click();
  });
  await page.waitForNavigation();
});

When('I login using valid credentials', {timeout: -1}, async function() {
  await page.goto('https://www.marketalertum.com/Alerts/Login');
  await page.$eval('input[name=UserId]', el => el.value = 'd6353e3c-9340-444d-93ee-371dcfeffb27');
  await page.click('input[type="submit"]');
});

Then('I should see my alerts', async function() {
  await page.waitForXPath("/html/body/div/main/h1[contains(text(), 'Latest alerts for')]");
});

