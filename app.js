const preRenderServer = require("./services/render");
const nano = require("./services/connections/connect");
const utils = require("./utils/utils");
const logger = require("./services/logger");

const execute = async (url, actions, nextPage, altView) => {
  let htmlPages = await preRenderServer
    .execute(url, actions, nextPage, altView)
    .then((result) => {
      logger.info("Successfully Rendered page(s)");
      return result;
    });

  const uuid = utils.urlto_uuid(url);
  const id = `${utils.today()}@${uuid}`;
  const item = {
    _id: id,
    source_url: url,
    createdAt: new Date().toISOString(),
    pages: htmlPages,
    uuid: uuid,
  };

  const response = await nano
    .insert(item)
    .then((res) => {
      logger.info("Cached the url successfully.");
      return res;
    })
    .catch((err) => {
      logger.error(`Failed to cache the URL an error occured: ${err}`);
    });

  // fs.writeFileSync("./file.txt", String(html));

  return (result = {
    success: !!response,
    cache_id: response ? id : "",
  });
};

module.exports = execute;
