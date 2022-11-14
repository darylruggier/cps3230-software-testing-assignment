const { BeforeAll, Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

const puppeteer = require('puppeteer');

let browser;
let page;
let alertData = {};

BeforeAll(async () => {
  browser = await puppeteer.launch(); // launching browser
  // creating page and setting its viewport + HTTP headers
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 })
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6'
  })
});

Given('I am an administrator of the website and I upload an alert of type <alert-type>', async function () {
  alertData = {
      alertType: 1,
      heading: '        Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle       ',
      description: 'Buy Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle: Body - Amazon.com ✓ FREE DELIVERY possible on eligible purchases',
      url: 'https://www.amazon.com/Universal-Shifter-Purple-Automatic-Manual/dp/B077D345ST/ref=sr_1_4?crid=25D62SGOTR3SA&keywords=car+shifter&qid=1666811518&qu=eyJxc2MiOiI1Ljk4IiwicXNhIjoiNC40OCIsInFzcCI6IjEuOTYifQ%3D%3D&sprefix=car+shift%2Caps%2C214&sr=8-4',
      imageUrl: 'https://m.media-amazon.com/images/I/61QMDl8jEBL._AC_SY355_.jpg',
      postedBy: 'd6353e3c-9340-444d-93ee-371dcfeffb27',
      priceInCents: 1699
  };

  const response = await fetch('https://api.marketalertum.com/Alert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(alertData),
  });
});

Given(/^I am a user (.*) of marketalertum$/, async function () {
  await page.goto('https://www.marketalertum.com');
});

When(/^I view a list (.*) of alerts$/, async function () {
  await page.goto('https://www.marketalertum.com/Alerts/Login');
  await page.$eval('input[name=UserId]', el => el.value = 'd6353e3c-9340-444d-93ee-371dcfeffb27');
  await page.click('input[type="submit"]');
});

Then('I should see {int} alert', async function (int) {
  await page.goto('https://www.marketalertum.com/Alerts/Login');
  await page.$eval('input[name=UserId]', el => el.value = 'd6353e3c-9340-444d-93ee-371dcfeffb27');
  await page.click('input[type="submit"]');
  await page.waitForXPath('/html/body/div/main/table[1]');
});

Then('the icon displayed should be <icon file name>', async function () {
  const [alertImage] = await page.$x('/html/body/div/main/table[1]/tbody/tr[1]/td/h4/img');
  let alertImgSrc = await alertImage.getProperty('src');
  alertImgSrc = await alertImgSrc.jsonValue();

  switch(alertData.alertType) {
    case 1:
      assert.equal(alertImgSrc, "https://www.marketalertum.com/images/icon-car.png");
      break;
    case 2:
      assert.equal(alertImgSrc, "https://www.marketalertum.com/images/icon-boat.png");
      break;
    case 3:
      assert.equal(alertImgSrc, "https://www.marketalertum.com/images/icon-property-rent.png");
      break;
    case 4:
      assert.equal(alertImgSrc, "https://www.marketalertum.com/images/icon-propert-sale.png");
      break;
    case 5:
      assert.equal(alertImgSrc, "https://www.marketalertum.com/images/icon-toys.png");
      break;
    case 6:
      assert.equal(alertImgSrc, "https://www.marketalertum.com/images/icon-electronics.png");
      break;
    default:
      throw "Unsupported Alert Type";
  }
});
