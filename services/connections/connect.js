



// need to add function here to initial database.
// make console logs 



const protocol = process.env.COUCH_PROTOCOL;
const host = process.env.COUCH_HOST;
const port = process.env.COUCH_PORT;
const db_name = process.env.COUCH_DB_NAME;
const pass = process.env.COUCH_AUTH_PWD;
const user = process.env.COUCH_AUTH_USER;

let url = `${protocol}://${user}:${pass}@${host}:${port}/${db_name}`;

const nano = require("nano")(url);

// module.exports.db = db;

module.exports = nano;