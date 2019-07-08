const router = require("express").Router();
const app = require("../../../core/webexpress").app;
app.use("/api/email/auth", router);

const Utils = require("../../../core/utils");

const database = require("../../../core/database").db;
const User = database.model("User");

const md5 = require("crypto-js/md5");

/**
 * Авторизация
 * @route POST /email/auth/login
 * @group auth - Аутентификация
 * @operationId login_email
 * @param {string} email.formData.required - email пользователя
 * @param {string} password.formData.required - пароль пользователя
 * @produces application/json
 * @consumes application/x-www-form-urlencoded
 * @returns {string} 200 - возвращает токен авторизации
 */

router.post("/login", async function (req, res, next) {
  let user = await User.getByEmail(req.body.email);
  if (!user)
    return res.send({
      error: true,
      response: "There is no user with this email"
    });

  let password = md5(user.passSalt + "" + md5(req.body.password).toString()).toString();
  if (password !== user.password)
    return res.send({
      error: true,
      response: "Password incorrect"
    });

  let token = md5(Utils.random(0, 999999) + "" + Utils.time() + "" + user.passSalt).toString();

  user.auth.push({ token: token });
  await user.save();

  res.send({
    error: false,
    response: { token: token, user: user }
  });
});

/**
 * Регистрация
 * @route POST /email/auth/register
 * @group auth - Аутентификация
 * @operationId register_email
 * @param {string} email.formData.required - email пользователя
 * @param {string} password.formData.required - пароль пользователя
 * @produces application/json
 * @consumes application/x-www-form-urlencoded
 * @returns {string} 200 - возвращает токен авторизации
 */

router.post("/register", async function (req, res, next) {
  let userExist = await User.getByEmail(req.body.email);
  if (userExist !== null)
    return res.send({
      error: true,
      response: "User with same Email is already registered"
    });

  let salt = md5(Utils.random(0, 999999) + "" + Utils.time()).toString();
  let password = md5(salt + "" + md5(req.body.password).toString()).toString();

  let token = md5(Utils.random(0, 999999) + "" + Utils.time() + "" + salt).toString();

  let user = new User({
    email: req.body.email,
    password: password,
    passSalt: salt,
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

/**
 * Выход
 * Удалит используемый токен из базы. Вход по нему более невозможен
 * @route POST /email/auth/logout
 * @group auth - Аутентификация
 * @operationId logout_email
 * @returns 200 - при успехе
 * @security Token
 */
router.post("/logout", async function (req, res, next) {
  req.user.auth = req.user.auth.filter(
    _ => _.token != req.headers.authorization
  );
  req.user.save();
  return res.send("OK");
});

