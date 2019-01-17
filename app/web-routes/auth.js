"use strict";
const router = require("express").Router();
const app = require("../services/webexpress").app;
app.use("/auth", router);

const Utils = require("../services/utils");

const database = require("../services/database").db;
const User = database.model("User");

const md5 = require("crypto-js/md5");

router.post("/login", async function(req, res, next) {
  let user = await User.getByEmail(req.body.email);
  if (!user)
    return res.send({
      error: true,
      response: "There is no user with this email"
    });

  let password = md5(
    user.pass_salt + "" + md5(params.password).toString()
  ).toString();
  if (password !== user.password)
    return res.send({
      error: true,
      response: "Password incorrect"
    });

  let token = md5(
    Utils.random(0, 999999) + "" + Utils.time() + "" + user.salt
  ).toString();

  user.auth.push({ token: token });
  await user.save();

  res.send({
    error: false,
    response: { token: token, user: user }
  });
});

router.post("/register", async function(req, res, next) {
  let userExist = await User.getByEmail(req.body.email);
  if (userExist !== null)
    return res.send({
      error: true,
      response: "User with same Email is already registered"
    });

  let salt = md5(Utils.random(0, 999999) + "" + Utils.time()).toString();
  let password = md5(salt + "" + md5(req.body.password).toString()).toString();

  let token = md5(
    Utils.random(0, 999999) + "" + Utils.time() + "" + salt
  ).toString();

  let user = new User({
    email: req.body.email,
    password: password,
    pass_salt: salt,
    auth: [{ token: token }]
  });
  await user.save();

  res.send({
    error: false,
    response: {
      token: token,
      user: user
    }
  });
});
