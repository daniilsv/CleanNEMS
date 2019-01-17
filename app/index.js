#!/usr/bin/env node
"use strict";

process.title = "choolo";
process.on("SIGINT", function() {
  process.exit();
});

const http = require("http");
const app = require("express")();
const config = require("./configs");
let database = require("./services/database");
const connection = require("./services/connection");
const webexpress = require("./services/webexpress");

database
  .init()
  .once("open", listen)
  .once("open", stdin);

function listen() {
  let server = http.createServer(app);
  webexpress.init(app);
  connection.init(server);
  server.listen(config.web_port, () => {
    console.log("Listening on port " + config.web_port);
  });
}

function stdin() {
  let last = null;
  process.openStdin().addListener("data", async function(d) {
    if (d.toString().trim().length !== 0) last = d.toString().trim();
    switch (last) {
      case "#sock":
        break;
    }
  });
}
