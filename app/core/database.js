const glob = require("glob");
const path = require("path");
const join = path.join;
const mongoose = require("mongoose");
const config = require("../configs");

let connection = null;

function connect() {
  let options = { keepAlive: 1, useNewUrlParser: true, useCreateIndex: true };
  mongoose.set("useFindAndModify", false);
  return (connection = mongoose.createConnection(
    config.mongo_connection_string,
    options
  ));
}

function _config() {
  const models = join(__dirname, "../models");
  glob.sync(models + "/**/*.js").forEach(function (file) {
    require(path.resolve(file));
  });
}

module.exports = class {
  static init() {
    return connect()
      .on("error", log.e)
      .on("disconnected", connect)
      .on("close", connect)
      .once("open", _config);
  }

  static get db() {
    return connection;
  }
};
