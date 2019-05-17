module.exports = class {
  constructor() {
    this.userToSockets = {};
    this.socketToUser = {};
  }
  byUser(user_id) {
    let ret = this.userToSockets[user_id];
    if (ret === undefined) return undefined;
    return { user_id: user_id, socket_id: ret };
  }
  bySocket(socket_id) {
    let ret = this.socketToUser[socket_id];
    if (ret === undefined) return undefined;
    return { user_id: ret, socket_id: [socket_id] };
  }
  add(user_id, socket_id) {
    if (this.userToSockets[user_id] === undefined)
      this.userToSockets[user_id] = [];
    if (this.userToSockets[user_id] !== undefined)
      this.userToSockets[user_id] = this.userToSockets[user_id].filter(
        _ => _ !== socket_id
      );
    this.userToSockets[user_id].push(socket_id);
    this.socketToUser[socket_id] = user_id;
  }
  deleteByUser(user_id) {
    let sockets_id = this.userToSockets[user_id];
    for (let socket_id of sockets_id) delete this.socketToUser[socket_id];
    delete this.userToSockets[user_id];
  }
  deleteBySocket(socket_id) {
    let user_id = this.socketToUser[socket_id];
    if (this.userToSockets[user_id] !== undefined)
      this.userToSockets[user_id] = this.userToSockets[user_id].filter(
        _ => _ !== socket_id
      );
    delete this.socketToUser[socket_id];
  }
};
