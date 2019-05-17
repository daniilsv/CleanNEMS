const glob = require("glob");
const path = require("path");
const join = path.join;

const users = new (require("./user-bimap"))();
const events = {};

let io = null;
function _config() {
  const routes = join(__dirname, "../soc-routes");
  glob.sync(routes + "/**/*.js").forEach(function (file) {
    require(path.resolve(file));
  });
}

module.exports.init = function (server) {
  io = require("socket.io")(server);
  io.on("connection", function (socket) {
    log.s("connect", socket.id);
    for (let event in events) {
      socket.on(event, events[event](socket));
    }
    socket.on("disconnect", () => {
      const userSocket = users.bySocket(socket.id);
      users.deleteBySocket(socket.id);
      log.w("disconnect", userSocket === undefined ? socket.id : userSocket);
    });
  });
  _config();
};

module.exports.on = function (event, callback, without_token) {
  events[event] = function (socket) {
    return function (msg, cb) {
      const cbask = cb === undefined ? function () { } : cb;
      if (without_token === true) {
        callback(socket.id, msg, cbask);
        return;
      }
      const userSocket = users.bySocket(socket.id);
      if (userSocket === undefined) return;
      callback(userSocket, msg, cbask);
    }
  };
};

module.exports.send = function (user_id, event, msg) {
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

module.exports.broadcast = function (event, msg) {
  if (io === undefined) return;
  let keys = Object.keys(io.sockets.connected);
  let socket_id = keys[0];
  let socket = io.sockets.connected[socket_id];
  socket.broadcast.emit(event, msg);
  socket.emit(event, msg);
};

module.exports.setUser = function (user_id, socket_id) {
  log.i(user_id, socket_id);
  users.add(user_id, socket_id);
};

module.exports.disconnect = function (socket_id) {
  users.deleteBySocket(socket_id);
};
