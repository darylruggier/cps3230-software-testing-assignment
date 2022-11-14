const { BeforeAll, Given, When, Then } = require('@cucumber/cucumber')
const puppeteer = require('puppeteer');

let browser;
let page;

BeforeAll(async () => {
  browser = await puppeteer.launch(); // launching browser
  // creating page and setting its viewport + HTTP headers
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 })
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6'
  })
});


Given('I am an administrator of the website and I upload {int} alerts', async function (int) {

  const alertData = [
    {
      alertType: 1,
      heading: '        Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle       ',
      description: 'Buy Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle: Body - Amazon.com ✓ FREE DELIVERY possible on eligible purchases',
      url: 'https://www.amazon.com/Universal-Shifter-Purple-Automatic-Manual/dp/B077D345ST/ref=sr_1_4?crid=25D62SGOTR3SA&keywords=car+shifter&qid=1666811518&qu=eyJxc2MiOiI1Ljk4IiwicXNhIjoiNC40OCIsInFzcCI6IjEuOTYifQ%3D%3D&sprefix=car+shift%2Caps%2C214&sr=8-4',
      imageUrl: 'https://m.media-amazon.com/images/I/61QMDl8jEBL._AC_SY355_.jpg',
      postedBy: 'd6353e3c-9340-444d-93ee-371dcfeffb27',
      priceInCents: 1699
    },
    {
      alertType: 1,
      heading: '        Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle       ',
      description: 'Buy Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle: Body - Amazon.com ✓ FREE DELIVERY possible on eligible purchases',
      url: 'https://www.amazon.com/Universal-Shifter-Purple-Automatic-Manual/dp/B077D345ST/ref=sr_1_4?crid=25D62SGOTR3SA&keywords=car+shifter&qid=1666811518&qu=eyJxc2MiOiI1Ljk4IiwicXNhIjoiNC40OCIsInFzcCI6IjEuOTYifQ%3D%3D&sprefix=car+shift%2Caps%2C214&sr=8-4',
      imageUrl: 'https://m.media-amazon.com/images/I/61QMDl8jEBL._AC_SY355_.jpg',
      postedBy: 'd6353e3c-9340-444d-93ee-371dcfeffb27',
      priceInCents: 1699
    },
    {
      alertType: 1,
      heading: '        Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle       ',
      description: 'Buy Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle: Body - Amazon.com ✓ FREE DELIVERY possible on eligible purchases',
      url: 'https://www.amazon.com/Universal-Shifter-Purple-Automatic-Manual/dp/B077D345ST/ref=sr_1_4?crid=25D62SGOTR3SA&keywords=car+shifter&qid=1666811518&qu=eyJxc2MiOiI1Ljk4IiwicXNhIjoiNC40OCIsInFzcCI6IjEuOTYifQ%3D%3D&sprefix=car+shift%2Caps%2C214&sr=8-4',
      imageUrl: 'https://m.media-amazon.com/images/I/61QMDl8jEBL._AC_SY355_.jpg',
      postedBy: 'd6353e3c-9340-444d-93ee-371dcfeffb27',
      priceInCents: 1699
    },
  ];

  const returnedStatus = await Promise.all(alertData.map(async function(obj) {
    const response = await fetch('https://api.marketalertum.com/Alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(obj),
    });
    // const data = await response.json();
    return response.status;
  }));
});

Given(/^I am a user of marketalertum$/, async function () {
  await page.goto('https://www.marketalertum.com');
});

When(/^I view a list of alerts$/, {timeout: -1}, async function () {
  await page.goto('https://www.marketalertum.com/Alerts/Login');
  await page.$eval('input[name=UserId]', el => el.value = 'd6353e3c-9340-444d-93ee-371dcfeffb27');
  await page.click('input[type="submit"]');

  [1, 2, 3].forEach(async num => {
    await page.waitForXPath(`/html/body/div/main/table[${num}]`);
  });
});

Then('each alert should contain an icon', function () {
  [1, 2, 3].forEach(async num => {
    await page.waitForXPath(`/html/body/div/main/table[${num}]/tbody/tr[1]/td/h4/img`);
  });
});

Then('each alert should contain a heading', function () {
  [1, 2, 3].forEach(async num => {
    await page.waitForXPath(`/html/body/div/main/table[${num}]/tbody/tr[1]/td/h4`)
  });
});

Then('each alert should contain a description', function () {
  [1, 2, 3].forEach(async num => {
    await page.waitForXPath(`/html/body/div/main/table[${num}]/tbody/tr[3]/td`)
  });
});

Then('each alert should contain an image', function () {
  [1, 2, 3].forEach(async num => {
    await page.waitForXPath(`/html/body/div/main/table[${num}]/tbody/tr[2]/td/img`);
  });
});

Then('each alert should contain a price', function () {
  [1, 2, 3].forEach(async num => {
    await page.waitForXPath(`/html/body/div/main/table[${num}]/tbody/tr[4]/td/b`);
  });
});

Then('each alert should contain a link to the original product website', function () {
  [1, 2, 3].forEach(async num => {
    await page.waitForXPath(`/html/body/div/main/table[${num}]/tbody/tr[5]/td/a`);
  });
});
