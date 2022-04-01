require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");

const db = require("./services/connections/connect");
const execute = require("./app");
const utils = require("./utils/utils");
const validator = require("./utils/validator");

// for debuggin onlye
const util = require("util");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* /post */
app.post("/get", async (req, res) => {
  let url = req.body.url;
  result = await getCached(url);
  res.send(result);
});

/* /run */
app.post("/run", async (req, res) => {
  /*
        Require a URL;
        Optional screen types
        Could also receive customActions
        ** should require a token to only allow the server to trigger the run;

    */

  let url = req.body.url;
  let action = req.body.action;
  let page = req.body.page;

  let result = await connectRender(url, action, page);

  // result = await db.get('90e156a47e4576371159c291e2006e88')

  res.send(result);
});

const connectRender = async (url, action, page) => {
  if (!url || url.length < 0) {
    throw new Error("No target URL to render");
  }
  let result = await execute(url, action, page);
  return result;
};

const getCached = async (url) => {
  let today = utils.today();
  let uuid = utils.urlto_uuid(url);
  result = await getItem(`${today}@${uuid}`);
  return result;
};

const getItem = async (id, params = {}) => {
  const nano = require("./services/connections/connect");
  try {
    let result = await nano.get(id);
    return result;
  } catch {
    return false;
  }
};

app.listen(3000, () => {
  console.log("Server running at PORT: 3000");
});
