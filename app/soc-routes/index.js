
const Connection = require("../core/socket");

const database = require("../core/database").db;
const User = database.model("User");

Connection.on(
  "tokenless",
  async function (socket_id, params, cb) {
    log.i(socket_id, params);
    cb({ errors: false });
  },
  true
);

Connection.on("withtoken", async function (socket_id, params, cb) {
  log.i(socket_id, params);
  cb({ errors: false });
});
