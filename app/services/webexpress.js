const fs = require("fs");
const join = require("path").join;
const express = require("express");
const bodyParser = require("body-parser");
const config = require("../configs");

let app = null;

function _config() {
  const routes = join(__dirname, "../web-routes");
  fs.readdirSync(routes)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(routes, file)));

  app.use("/public", express.static("public"));
  app.use("/uploads", express.static("uploads"));

  app.use(function(req, res, next) {
    next(require("http-errors")(404, "Not found"));
  });

  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.send({
      error: true,
      response: err.message || "Unexpected server error"
    });
  });
}

module.exports = class {
  static init(_app) {
    app = _app;
    app.set("port", config.web_port);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    _config();
  }

  static get app() {
    return app;
  }
};
