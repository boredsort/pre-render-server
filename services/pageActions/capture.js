const utils = require('../../utils/utils')
const logger = require("../logger");
const fs = require('fs');

const capture = async (page, pageNo, page_type='pageview') => {

    const url = page.url()
    const uuid = utils.urlto_uuid(url);

    const dir = global.root_id;

    const capturesDir = `./captures/${dir}`
    if (!fs.existsSync(capturesDir)){
        fs.mkdirSync(capturesDir, { recursive: true });
    }
    

    logger.info(dir)

    await page
    .screenshot({ path: `${capturesDir}/${page_type}-${pageNo}-${uuid}}.png`, fullPage: true })
    .then(() => {
      logger.info("Webpage screen capture success");
    })
    .catch((err) => {
      logger.error(`Failed to capture screen due to: ${err}`);
    });

}

module.exports = capture