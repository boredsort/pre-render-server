require("dotenv").config();
const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { v5: uuidv5 } = require("uuid");

const customActionsHandler = require("./pageActions/customActions");
const autoScroll = require("./pageActions/autoScroll");
const capture = require("./pageActions/capture");
const logger = require("./logger");

const render = async (page, customActions = {}, nextPage, alternateViews, pageNo) => {
  try {
    logger.info("Rendering");

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    let html = await executeActionsAndGetContent(page, customActions, pageNo);

    logger.info("alternateview: " + JSON.stringify(alternateViews));

    let altViewsHtml = await executeAlternateViews(page, alternateViews);

    const hasNext = await page.$(nextPage).catch((err) => {
      logger.info(`No next page element '${nextPage}'`);
      return false;
    });

    // logger.info(util.inspect(nano.db, {showHidden: false, depth: null, colors: true}))
    let results = {
      html: !!html ? html : "",
      alternateViewsHTML: !!altViewsHtml ? altViewsHtml : [],
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
  nextPage = {
    nextPageElement: "",
    maxStep: 1,
    persistActions: false,
    persistAltViews: false,
  },
  alternateViews = []
) => {
  logger.info(`Executing alternateviews ${alternateViews}`);
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  let { nextPageElement, maxStep, persistActions, persistAltViews } = nextPage;

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
      if (currentPage > 1) {
        customActions = persistActions ? customActions : {};
        alternateViews = persistAltViews ? alternateViews : [];
      }

      let { html, hasNext, alternateViewsHTML } = await render(
        page,
        customActions,
        nextPageElement,
        alternateViews,
        currentPage
      )
        .then((results) => {
          logger.info(`Rendered page ${currentPage}`);
          return results;
        })
        .catch((err) => {
          logger.error(`Failed to render due to: ${err}`);
        });

      if (html) {
        let htmlpage = { page: currentPage, html, alternateViewsHTML };
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

const executeActionsAndGetContent = async (page, actions, pageNo) => {
  logger.info(`execute actions:${JSON.stringify(actions)}`);

  await customActionsHandler(page, actions);

  await autoScroll.scrollDown(page);

  await page.waitForTimeout(1000).then(async () => {
    await autoScroll.scrollUp(page);
  });

  // temp
  let randomNumber = Math.random();
  // await page
  //   .screenshot({ path: `./test-${randomNumber}.png`, fullPage: true })
  //   .then(() => {
  //     logger.info("Webpage screen capture success");
  //   })
  //   .catch((err) => {
  //     logger.error(`Failed to capture screen due to: ${err}`);
  //   });

  await capture(page, pageNo)

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

const executeAlternateViews = async (page, alternateViews) => {
  try {
    const altViewsHTML = [];
    let index = 1;
    for (const view of alternateViews) {
      let resultHtml = await executeActionsAndGetContent(page, view.actions,'altview', index);
      let result = {
        view_name: view.viewName,
        html: resultHtml,
      };
      altViewsHTML.push(result);

      if (altViewsHTML.length == alternateViews.length) {
        return Promise.resolve(altViewsHTML);
      }
      index++;
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

const preRenderServer = {
  render: render,
  execute: execute,
};

module.exports = preRenderServer;
