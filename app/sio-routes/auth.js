"use strict";

const Connection = require("../services/connection");

const database = require("../services/database").db;
const User = database.model("User");

const md5 = require("crypto-js/md5");

const Utils = require("../services/utils");

Connection.on(
  "auth.token",
  async function(socket_id, params, cb) {
    if (params.token === undefined) return cb({ error: "Token is required" });
    let user = await User.getByToken(params.token);
    if (user === null) return cb({ error: "User not found" });
    Connection.setUser(user._id, socket_id);
    cb({ success: user });
  },
  true
);

Connection.on("auth.logout", async function(userSocket, params, cb) {
  let user = await User.getById(userSocket.user_id);
  if (user === null) return;
  user.auth = user.auth.filter(_ => _.token !== params.token);
  user.save();
  Connection.disconnect(userSocket.socket_id);
});

Connection.on(
  "auth.login",
  async function(socket_id, params, cb) {
    if (params.email === undefined || params.password === undefined)
      return cb({ error: "Email and Password is required" });
    let user = await User.getByEmail(params.email);
    if (user === null)
      return cb({ error: "User with this Email still not registered" });

    let password = md5(
      user.pass_salt + "" + md5(params.password).toString()
    ).toString();
    if (password !== user.password) {
      return cb({ error: "Password invalid" });
    }

    let token = md5(
      Utils.random(0, 999999) + "" + Utils.time() + "" + user.salt
    ).toString();

    user.auth.push({ token: token });
    await user.save();
    Connection.setUser(user._id, socket_id);
    cb({ success: { token: token, user: user } });
  },
  true
);

Connection.on(
  "auth.register",
  async function(socket_id, params, cb) {
    if (params.email === undefined || params.password === undefined)
      return cb({ error: "Email and Password is required" });
    let userExist = await User.getByEmail(params.email);
    if (userExist !== null)
      return cb({ error: "User with same Email is already registered" });

    let salt = md5(Utils.random(0, 999999) + "" + Utils.time()).toString();
    let password = md5(salt + "" + md5(params.password).toString()).toString();

    let token = md5(
      Utils.random(0, 999999) + "" + Utils.time() + "" + salt
    ).toString();

    let user = new User({
      email: params.email,
      password: password,
      pass_salt: salt,
      name: {
        first: params.name_first,
        second: params.name_second || ""
      },
      auth: [{ token: token }]
    });
    await user.save();
    Connection.setUser(user._id, socket_id);
    cb({ success: token });
  },
  true
);
