// const puppeteer = require('puppeteer');
//
// async function test() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//
//   await page.goto('https://www.marketalertum.com');
//   console.log(page.url());
//
// }
//
// test();
//
const puppeteer = require("puppeteer");

async function test() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0); 

  await page.goto("https://www.amazon.com/s?k=shift+knob&crid=2SIDF4EISBIFS&sprefix=shift+kn%2Caps%2C250&ref=nb_sb_noss_2");
  await page.waitForXPath("/html/body/div[1]/div[2]/div[1]/div[1]/div/span[1]/div[1]/div[4]/div/div/div/div/div/div[2]/div/div/div[1]/h2/a");
}

test();
