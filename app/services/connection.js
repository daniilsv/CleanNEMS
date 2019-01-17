"use strict";
const fs = require("fs");
const join = require("path").join;

const users = new (require("./user-bimap"))();

let io = null;
function _config() {
  const routes = join(__dirname, "../sio-routes");
  fs.readdirSync(routes)
    .filter(file => ~file.search(/^[^\.].*\.js$/))
    .forEach(file => require(join(routes, file)));
}

module.exports.init = function(server) {
  io = require("socket.io")(server);
  io.sockets.setMaxListeners(0);
  io.on("connection", function(socket) {
    console.log("connect", socket.id);
    socket.on("disconnect", () => {
      const userSocket = users.bySocket(socket.id);
      users.deleteBySocket(socket.id);
      console.log(
        "disconnect",
        userSocket === undefined ? socket.id : userSocket
      );
    });
  });
  _config();
};

module.exports.on = function(event, callback, without_token) {
  if (io === undefined) return;
  io.on("connection", function(socket) {
    socket.on(event, function(msg, cb) {
      const cbask = cb === undefined ? function() {} : cb;
      if (without_token === true) {
        callback(socket.id, msg, cbask);
        return;
      }
      const userSocket = users.bySocket(socket.id);
      if (userSocket === undefined) return;
      callback(userSocket, msg, cbask);
    });
  });
};

module.exports.send = function(user_id, event, msg) {
  if (io === undefined) return;
  const userSocket = users.byUser(user_id);
  if (userSocket === undefined) return;
  for (let socket_id of userSocket) {
    let socket = io.sockets.connected[socket_id];
    if (socket === undefined) {
      users.removeVal(socket_id);
      return;
    }
    socket.emit(event, msg);
  }
};

module.exports.broadcast = function(event, msg) {
  if (io === undefined) return;
  let keys = Object.keys(io.sockets.connected);
  let socket_id = keys[0];
  let socket = io.sockets.connected[socket_id];
  socket.broadcast.emit(event, msg);
  socket.emit(event, msg);
};

module.exports.setUser = function(user_id, socket_id) {
  console.log(user_id, socket_id);
  users.add(user_id, socket_id);
};

module.exports.disconnect = function(socket_id) {
  users.deleteBySocket(socket_id);
};
