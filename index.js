require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");

const db = require("./services/connections/connect");
const execute = require("./app");
const utils = require("./utils/utils");
const { Validator, pageSchema} = require("./utils/validator");

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

	let body = req.body
	let { errors } = Validator.validate(body, pageSchema)

  if (errors && errors.length > 0) {
    return res.send(errors)
  }
  
  let url = req.body.url;
  let action = req.body.actions;
  let page = req.body.nextPage;
  let altView = req.body.alternateViews

  let result = await connectRender(url, action, page, altView);

  // result = await db.get('90e156a47e4576371159c291e2006e88')

  res.send(result);
});

const connectRender = async (url, action, page, altView) => {
  if (!url || url.length < 0) {
    throw new Error("No target URL to render");
  }
  let result = await execute(url, action, page, altView);
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
