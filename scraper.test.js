const { Scraper } = require('./scraper');
const puppeteer = require('puppeteer');

jest.mock('./scraper');

jest.setTimeout(400000);

describe('Scraper functions operate successfully', () => {
  const amazonScraper = new Scraper('d6353e3c-9340-444d-93ee-371dcfeffb27');
  amazonScraper.id = 'd6353e3c-9340-444d-93ee-371dcfeffb27';

  beforeAll(() => {
    jest.clearAllMocks();
    
    jest.spyOn(Scraper.prototype, 'selectFiveProducts').mockImplementation(async () => {
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
    });

    jest.spyOn(Scraper.prototype, 'scrape').mockImplementation(async (url) => {
      const postedBy = amazonScraper.id;
      
      const browser = await puppeteer.launch(); // launching browser
      const page = await browser.newPage(); // new page

      page.setDefaultNavigationTimeout(0);
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
    });

    jest.spyOn(Scraper.prototype, 'createAlerts').mockImplementation(async (urls) => {
      const alertData = await Promise.all(urls.map(async function(url) {
        const scrapedProduct = await amazonScraper.scrape(url);
        return scrapedProduct;
      }));
      return alertData;
    });

    jest.spyOn(Scraper.prototype, 'sendAlerts').mockImplementation(async (alertData) => {
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
    });

    jest.spyOn(Scraper.prototype, 'scrapeCreateAndSendAlerts').mockImplementation(async (urls) => {
      const productUrls = await Scraper.prototype.selectFiveProducts();
      const alertData = await Scraper.prototype.createAlerts(productUrls);
      const data = await Scraper.prototype.sendAlerts(alertData);
      return data;
    });

    jest.spyOn(Scraper.prototype, 'getAlerts').mockImplementation(async () => {
      const response = await fetch(`https://api.marketalertum.com/Alert?userId=${amazonScraper.id}`);
      // const data = await response.json();
      // console.log(data, response.status);
      return response.status;
    });

    jest.spyOn(Scraper.prototype, 'deleteAlerts').mockImplementation(async () => {
      const response = await fetch(`https://api.marketalertum.com/Alert?userId=${amazonScraper.id}`, {
        method: 'DELETE',
      })
      // const data = await response.json();
      // console.log(data);
      return response.status;
    });
  });

  beforeEach(() => {
    Scraper.mockClear();
  });

  test('selectFiveProducts function works correctly', async () => {
    let productUrls = [];
    productUrls = await amazonScraper.selectFiveProducts();

    expect(productUrls.length).toEqual(5);
  });


  test('scrape function should work', async () => {
    const scrapedProduct = await amazonScraper.scrape('https://www.amazon.com/Manual-Diamond-Crystal-Bubble-Styling/dp/B094ZS285C/ref=sr_1_11?crid=2SIDF4EISBIFS&keywords=shift+knob&qid=1668362254&sprefix=shift+kn%2Caps%2C250&sr=8-11');
    expect(scrapedProduct).toEqual({
      alertType: 1,
      heading: '        6 inch Manual Diamond Crystal Bubble Styling Gear Shift Knob Blue+Purple Color       ',
      description: 'Buy 6 inch Manual Diamond Crystal Bubble Styling Gear Shift Knob Blue+Purple Color: Body - Amazon.com ✓ FREE DELIVERY possible on eligible purchases',
      url: 'https://www.amazon.com/Manual-Diamond-Crystal-Bubble-Styling/dp/B094ZS285C/ref=sr_1_11?crid=2SIDF4EISBIFS&keywords=shift+knob&qid=1668362254&sprefix=shift+kn%2Caps%2C250&sr=8-11',
      imageUrl: 'https://m.media-amazon.com/images/I/51DuSgVBeLS._AC_SX355_.jpg',
      postedBy: 'd6353e3c-9340-444d-93ee-371dcfeffb27',
      priceInCents: 1299
    });
  });

  test('createAlerts function operates successfully', async () => {
    const alertData = await amazonScraper.createAlerts(['https://www.amazon.com/Universal-Shifter-Purple-Automatic-Manual/dp/B077D345ST/ref=sr_1_4?crid=25D62SGOTR3SA&keywords=car+shifter&qid=1666811518&qu=eyJxc2MiOiI1Ljk4IiwicXNhIjoiNC40OCIsInFzcCI6IjEuOTYifQ%3D%3D&sprefix=car+shift%2Caps%2C214&sr=8-4']);
    expect(alertData).toEqual([
      {
        alertType: 1,
        heading: '        Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle       ',
        description: 'Buy Abfer Purple Shift Knob Car Gear Stick Shifter Handle Head Shifting Knobs Fit for Most Automatic Manual Vehicle: Body - Amazon.com ✓ FREE DELIVERY possible on eligible purchases',
        url: 'https://www.amazon.com/Universal-Shifter-Purple-Automatic-Manual/dp/B077D345ST/ref=sr_1_4?crid=25D62SGOTR3SA&keywords=car+shifter&qid=1666811518&qu=eyJxc2MiOiI1Ljk4IiwicXNhIjoiNC40OCIsInFzcCI6IjEuOTYifQ%3D%3D&sprefix=car+shift%2Caps%2C214&sr=8-4',
        imageUrl: 'https://m.media-amazon.com/images/I/61QMDl8jEBL._AC_SY355_.jpg',
        postedBy: 'd6353e3c-9340-444d-93ee-371dcfeffb27',
        priceInCents: 1699
      }
    ]);
  });
  //
  test('sendAlerts function operates successfully', async () => {
    const alertData = await amazonScraper.createAlerts(['https://www.amazon.com/Universal-Shifter-Purple-Automatic-Manual/dp/B077D345ST/ref=sr_1_4?crid=25D62SGOTR3SA&keywords=car+shifter&qid=1666811518&qu=eyJxc2MiOiI1Ljk4IiwicXNhIjoiNC40OCIsInFzcCI6IjEuOTYifQ%3D%3D&sprefix=car+shift%2Caps%2C214&sr=8-4']);
    const returnedStatus = await amazonScraper.sendAlerts(alertData);
    expect(returnedStatus).toEqual([201]);
  });

  test('scrapeCreateAndSendAlerts function operates successfully', async () => {
    const productUrls = await amazonScraper.selectFiveProducts();
    const alertData = await amazonScraper.createAlerts(productUrls);
    const data = await amazonScraper.sendAlerts(alertData);
    expect(data).toEqual([201, 201, 201, 201, 201]);
  });

  test('getAlerts function operates successfully', async () => {
    const response = await amazonScraper.getAlerts();
    expect(response).toEqual(200);
  });

  test('deleteAlerts function operates successfully', async () => {
    const response = await amazonScraper.deleteAlerts();
    expect(response).toEqual(200);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
