const puppeteer = require('puppeteer');

class Scraper {
  id;

  constructor(id) {
    this.id = id;
  }

  async selectFiveProducts() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0); 


    await page.goto("https://www.amazon.com/s?k=shift+knob&crid=2SIDF4EISBIFS&sprefix=shift+kn%2Caps%2C250&ref=nb_sb_noss_2");
    await page.waitForXPath("/html/body/div[1]/div[2]/div[1]/div[1]/div/span[1]/div[1]/div[4]/div/div/div/div/div/div[2]/div/div/div[1]/h2/a");

    let productUrls = [];
    let xpathNumbers = [12, 14, 15, 17, 18];

    for (let i = 0; i < 5; i++) {
      const [productAnchorTag] = await page.$x(`/html/body/div[1]/div[2]/div[1]/div[1]/div/span[1]/div[1]/div[${xpathNumbers[i]}]/div/div/div/div/div/div[2]/div/div/div[1]/h2/a`);
      let productUrl = await productAnchorTag.getProperty('href');
      productUrl = await productUrl.jsonValue();
      productUrls.push(productUrl);
    }
    return productUrls;
  }

  async scrape(url) {
    const postedBy = amazonScraper.id;
    
    const browser = await puppeteer.launch(); // launching browser
    const page = await browser.newPage(); // new page

    page.setDefaultNavigationTimeout(0)
    await page.goto(url); // going to the specified url

    const [pageTitle] = await page.$x('//*[@id="a-page"]/title');
    const titleText = await pageTitle.getProperty('textContent');
    const rawTitleText = await titleText.jsonValue();

    // get alert id depending on title ?
    const alertType = 1;

    const [productTitle] = await page.$x('//*[@id="productTitle"]'); // scraping the product title, taking the text content and converting it to json value
    const text = await productTitle.getProperty('textContent');
    const heading = await text.jsonValue();

    const [documentTitle] = await page.$x('//*[@id="a-page"]/meta[2]');
    const productDescription = await documentTitle.getProperty('content');
    const description = await productDescription.jsonValue();

    const [productImage] = await page.$x('//*[@id="landingImage"]');
    // const [productImage] = await page.$x('/html/body/div[1]/div[2]/div[7]/div[5]/div[3]/div[1]/div[1]/div/div/div[2]/div[1]/div[1]/ul/li[1]/span/span/div/img');
    const imgSrc = await productImage.getProperty('src')
    const imageUrl = await imgSrc.jsonValue();

    let [productPrice] = await page.$x('//*[@id="corePriceDisplay_desktop_feature_div"]/div[1]/span/span[1]')
    // if (![productPrice]) {
    //  [productPrice] = await page.$x('/html/body/div[1]/div[2]/div[10]/div[6]/div[1]/div[4]/div/div/div/div/form/div/div/div/div/div[2]/div[1]/div/span/span[2]') 
    // }

    const rawPrice = await productPrice.getProperty('textContent');
    let priceInCents = await rawPrice.jsonValue();
    priceInCents = parseInt((parseFloat(priceInCents.substring(1, priceInCents.length)) * 100).toFixed(2));
    
    const scrapedProduct = { alertType, heading, description, url, imageUrl, postedBy, priceInCents };
    // console.log(scrapedProduct);
    browser.close();
    return scrapedProduct;
  }

  async createAlerts(urls) {
    const alertData = await Promise.all(urls.map(async function(url) {
      const scrapedProduct = await amazonScraper.scrape(url);
      return scrapedProduct;
    }));
    return alertData;
  }
  
  async sendAlerts(alertData) {
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
    return returnedStatus;
  };

  async scrapeCreateAndSendAlerts() {
    const productUrls = await this.selectFiveProducts();
    const alertData = await this.createAlerts(productUrls);
    const data = await this.sendAlerts(alertData);
    return data;
  }

  async getAlerts() {
    const response = await fetch(`https://api.marketalertum.com/Alert?userId=${amazonScraper.id}`);
    // const data = await response.json();
    // console.log(data, response.status);
    return response.status;
  }

  async deleteAlerts() {
    const response = await fetch(`https://api.marketalertum.com/Alert?userId=${amazonScraper.id}`, {
      method: 'DELETE',
    })
    // const data = await response.json();
    // console.log(data);
    return response.status;
  }
}

const amazonScraper = new Scraper('d6353e3c-9340-444d-93ee-371dcfeffb27');
amazonScraper.scrapeCreateAndSendAlerts();
// amazonScraper.selectFiveProducts();
// console.log(amazonScraper.getScraper());
// amazonScraper.scrape('https://www.amazon.com/Pokeball-Shift-Inches-Models-Adapters/dp/B089N2VYLY/ref=sr_1_10?crid=2SIDF4EISBIFS&keywords=shift+knob&qid=1668360858&sprefix=shift+kn%2Caps%2C250&sr=8-10');
amazonScraper.getAlerts();
amazonScraper.deleteAlerts();

// testGetAlerts();
module.exports = {
  Scraper,
};
