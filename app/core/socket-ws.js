const glob = require("glob");
const path = require("path");
const join = path.join;

const users = new (require("./user-bimap"))();
const events = {};
const sockets = {};

const Utils = require("./utils");

let ws = null;

function _config() {
  const routes = join(__dirname, "../soc-routes");
  glob.sync(routes + "/**/*.js").forEach(function (file) {
    require(path.resolve(file));
  });
}

module.exports.init = function (server) {
  ws = new (require("websocket").server)({ httpServer: server });
  ws.on("request", function (socket) {
    var socket = socket.accept(null, socket.origin);
    socket.id = Utils.random(0, 1000000);
    sockets[socket.id] = socket;
    log.s("connect", socket.id);
    socket.on('message', function (msg) {
      if (msg.type !== 'utf8') return;
      msg = JSON.parse(msg.utf8Data);
      events[msg.type](socket)(msg.data);
    });
    socket.on("close", () => {
      const userSocket = users.bySocket(socket.id);
      users.deleteBySocket(socket.id);
      log.w("disconnect", userSocket === undefined ? socket.id : userSocket);
    });
  });
  _config();
};

module.exports.on = function (event, callback, without_token) {
  events[event] = function (socket) {
    return function (msg) {
      if (without_token === true) {
        callback(socket.id, msg, (_) => { socket.sendUTF(JSON.stringify({ type: event, data: _ })); });
        return;
      }
      const userSocket = users.bySocket(socket.id);
      if (userSocket === undefined) return;
      callback(userSocket, msg, (_) => { socket.sendUTF(JSON.stringify({ type: event, data: _ })); });
    };
  };
};

module.exports.send = function (user_id, event, msg) {
  if (ws === undefined) return;
  const userSocket = users.byUser(user_id);
  if (userSocket === undefined) return;

  for (let socket_id of userSocket) {
    let socket = sockets[socket_id];
    if (socket === undefined) {
      users.removeVal(socket_id);
      return;
    }
    socket.sendUTF(JSON.stringify({ type: event, data: msg }));
  }
};

module.exports.broadcast = function (event, msg) {
  if (ws === undefined) return;
  for (let socket of Object.values(sockets)) {
    socket.sendUTF(JSON.stringify({ type: event, data: msg }));
  }
};

module.exports.setUser = function (user_id, socket_id) {
  log.i(user_id, socket_id);
  users.add(user_id, socket_id);
};

module.exports.disconnect = function (socket_id) {
  users.deleteBySocket(socket_id);
};
