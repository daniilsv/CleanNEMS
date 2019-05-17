const router = require("express").Router();
const app = require("../../../core/webexpress").app;
app.use("/api/phone/auth", router);

const Utils = require("../../../core/utils");

const database = require("../../../core/database").db;
const User = database.model("User");

const md5 = require("crypto-js/md5");

/**
 * Запрос авторизационного смс
 * @route POST /auth/phone/send
 * @group Pauth - Аутентификация
 * @operationId Psend
 * @param {string} phone.formData.required - телефон пользователя
 * @produces application/json
 * @consumes application/x-www-form-urlencoded
 * @returns {string} 200 - смс отправлено
 */
router.post("/send", async function (req, res, next) {
  log.i(req.body.phone);
  let user = await Courier.getByPhone(req.body.phone);
  if (!user) return next([404, "There is no user with this phone"]);
  user.authCode = 100000; //Utils.genCode();
  log.i(user.authCode);
  await user.save();
  res.send(`OK: ${user.authCode}`);
});

/**
 * Проверка смс кода
 * @route POST /auth/phone/verify
 * @group Pauth - Аутентификация
 * @operationId Pverify
 * @param {string} phone.formData.required - телефон пользователя
 * @param {string} code.formData.required - код из смс
 * @produces application/json
 * @consumes application/x-www-form-urlencoded
 * @returns {string} 200 - возвращает токен авторизации
 */
router.post("/verify", async function (req, res, next) {
  let user = await Courier.getByPhone(req.body.phone);
  if (!user) return next([404, "There is no user with this phone"]);
  if (parseInt(req.body.code) !== user.authCode)
    return next([403, "invalid code"]);
  let token = md5(
    Utils.random(0, 999999) + "" + Utils.time() + "" + user.salt
  ).toString();
  user.authCode = null;
  user.auth.push({ token: token });
  await user.save();
  res.send(token);
});

/**
 * Выход
 *
 * Удалит используемый токен из базы. Вход по нему более невозможен
 * @route POST /auth/phone/logout
 * @group Pauth - Аутентификация
 * @operationId Plogout
 * @returns 200 - при успехе
 * @security Token
 */
router.post("/logout", async function (req, res, next) {
  req.user.auth = req.user.auth.filter(
    _ => _.token != req.headers.authorization
  );
  user.authCode = null;
  req.user.save();
  return res.send("OK");
});
