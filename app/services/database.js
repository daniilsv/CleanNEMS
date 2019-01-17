const fs = require("fs");
const join = require("path").join;
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
  fs.readdirSync(models)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(models, file)));
}

module.exports = class {
  static init() {
    return connect()
      .on("error", console.log)
      .on("disconnected", connect)
      .on("close", connect)
      .once("open", _config);
  }

  static get db() {
    return connection;
  }
};
