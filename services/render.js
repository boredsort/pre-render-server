require("dotenv").config();
const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { v5: uuidv5 } = require("uuid");

const customActionsHandler = require("./pageActions/customActions");
const autoScroll = require("./pageActions/autoScroll");
const logger = require("./logger");

const render = async (page, customActions = {}, nextPage, alternateViews) => {
  try {
    logger.info("Rendering");

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    // await customActionsHandler(page, customActions)

    // await autoScroll(page);

    // // await page.screenshot({path:'./test.png', fullPage: true}).then(
    // //     () => { logger.info('Webpage screen capture success')}
    // // ).catch( (err) => {
    // //     logger.error(`Failed to capture screen due to: ${err}`)
    // // });

    // const html = await page.content().then( (res) => {
    //     logger.info('Html source exctraction success')
    //     return res
    // }).catch( (err) => {
    //     logger.error(`Failed to extract HTML source due to: ${err}`)
    // });
    let html = await executeActionsAndGetContent(page, customActions);
    logger.info("alternateview: " + JSON.stringify(alternateViews));
    let altViewsHtml = await Promise.all(
      alternateViews.map(async (view) => {
        let resultHtml = await executeActionsAndGetContent(page, view.action);
        let result = {
          view_name: view.name,
          html: resultHtml,
        };
        return result;
      })
    );

    const hasNext = await page.$(nextPage).catch((err) => {
      logger.info(`No next page element '${nextPage}'`);
      return false;
    });

    // logger.info(util.inspect(nano.db, {showHidden: false, depth: null, colors: true}))
    let results = {
      html: !!html ? html : "",
      hasNext: !!hasNext,
    };

    return results;
  } catch (er) {
    logger.error(er);
  }
};

const execute = async (
  url,
  customActions = {},
  nextPage = { nextPageElement: "", maxStep: 1 },
  alternateViews = []
) => {
  logger.info(`Browser is closed and ${alternateViews}`);
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  let { nextPageElement, maxStep } = nextPage;

  browser.on("disconnected", async () => {
    try {
      if (browser) {
        await browser.close();
        logger.info("Browser is closed and disconnected");
      }
    } catch (err) {
      logger.error("Failed to close the browser");
    }
  });

  await page
    .goto(url, { waitUntil: "networkidle2" })
    .then(() => {
      logger.info(`Connected to url ${url}`);
    })
    .catch((err) => {
      logger.error(`Failed to connect due to: ${err}`);
    });

  // await page.waitForNavigation({
  //     waitUntil: 'networkidle0',
  //   });

  try {
    let currentPage = 1;
    let htmlPages = [];
    do {
      let { html, hasNext } = await render(
        page,
        customActions,
        nextPageElement,
        alternateViews
      )
        .then((results) => {
          logger.info(`Rendered page ${currentPage}`);
          return results;
        })
        .catch((err) => {
          logger.error(`Failed to render due to: ${err}`);
        });

      if (html) {
        let htmlpage = { page: currentPage, html };
        htmlPages.push(htmlpage);
      }

      if (hasNext) {
        currentPage++;
        if (currentPage < maxStep) {
          await Promise.all([
            page.waitForNavigation(),
            logger.info(`Navigating to page ${currentPage}`),
            page.click(nextPageElement),
          ]);
        }
      } else {
        break;
      }
    } while (currentPage <= maxStep);

    return htmlPages;
  } catch (er) {
    logger.error(er);
  } finally {
    browser.close();
  }
};

const executeActionsAndGetContent = async (page, actions) => {
  logger.info(`execute actions:${JSON.stringify(actions)}`);

  await customActionsHandler(page, actions);

  await autoScroll.scrollDown(page);

  await page.waitForTimeout(2000).then(async () => {
    await autoScroll.scrollUp(page);
  });

  // temp
  let randomNumber = Math.random();
  await page
    .screenshot({ path: `./test-${randomNumber}.png`, fullPage: true })
    .then(() => {
      logger.info("Webpage screen capture success");
    })
    .catch((err) => {
      logger.error(`Failed to capture screen due to: ${err}`);
    });

  const html = await page
    .content()
    .then((res) => {
      logger.info("Html source exctraction success");
      return res;
    })
    .catch((err) => {
      logger.error(`Failed to extract HTML source due to: ${err}`);
      return "";
    });

  return html;
};

const preRenderServer = {
  render: render,
  execute: execute,
};

module.exports = preRenderServer;
