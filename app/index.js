#!/usr/bin/env node

process.title = "__PROCESS_NAME__";

require("./core/log");

const http = require("http");
const app = require("express")();
const config = require("./configs");
const database = require("./core/database");
const webexpress = require("./core/webexpress");
__SOCKET__

function listen() {
  let server = http.createServer(app);
  webexpress.init(app);
  __SOCKET_INIT__
  server.listen(config.web_port, () => {
    log.i("Listening on port", config.web_port);
  });
}


database
  .init()
  .once("open", listen)
  .once("open", require("./runtime/console").stdin);
