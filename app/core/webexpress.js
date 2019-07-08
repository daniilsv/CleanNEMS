const glob = require("glob");
const path = require("path");
const join = path.join;
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const config = require("../configs");

let app = null;

function _config() {
  const expressSwagger = require("express-swagger-generator")(app);
  expressSwagger({
    swaggerDefinition: {
      info: {
        title: "__PROJECT_TITLE__",
        version: "1.0.0",
        description: ""
      },
      host: config.web_host,
      basePath: "/api",
      produces: ["application/json"],
      schemes: [config.web_scheme],
      securityDefinitions: {
        Token: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "Токен получается после авторизации"
        }
      }
    },
    basedir: __dirname,
    files: ["../web-routes/api/**/*.js", "../models/**/*.js"]
  });


  app.use(cors());

  const routes = join(__dirname, "../web-routes");
  glob.sync(routes + "/**/*.js").forEach(function (file) {
    require(path.resolve(file));
  });

  app.use("/", express.static("public"));
  app.use("/uploads", express.static("uploads"));

  app.use(function (req, res, next) {
    next(require("http-errors")(404, "Not found"));
  });

  app.use(function (err, req, res, next) {
    if (err instanceof Error) {
      if (!err.statusCode) err.statusCode = 500;
      res.status(err.statusCode);
      var public = join(__dirname, "../../public");
      res.sendFile(join(public, "index.html"));
    } else if (err instanceof Array) {
      if (err[0] instanceof String || err[0] == null)
        (err[1] = err[0]), (err[0] = 500);
      res.status(err[0]).send({
        code: err[0],
        message: err[1].toString()
      });
    }
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
