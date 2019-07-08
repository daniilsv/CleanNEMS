const router = require("express").Router();
const app = require("../../../core/webexpress").app;
app.use("/api/phone/auth", router);

const Utils = require("../../../core/utils");

const database = require("../../../core/database").db;
const User = database.model("User");

const md5 = require("crypto-js/md5");

/**
 * Запрос авторизационного смс
 * @route POST /phone/auth/send
 * @group auth - Аутентификация
 * @operationId send_phone
 * @param {string} phone.formData.required - телефон пользователя
 * @produces application/json
 * @consumes application/x-www-form-urlencoded
 * @returns {string} 200 - смс отправлено
 */
router.post("/send", async function (req, res, next) {
  log.i(req.body.phone);
  let user = await User.getByPhone(req.body.phone);
  if (!user) {
    user = new User({
      phone: req.body.phone,
    });
  }
  if (req.body.phone == "+79999999999") {
    user.authCode = 100000;
    log.i(user.authCode);
    await user.save();
    return res.send(`OK: ${user.authCode}`);
  }
  user.authCode = Utils.genCode();
  log.i(user.authCode);
  await user.save();

  // const phone = user.phone.slice(1);
  // const text = "&lt;#&gt; HouseCook: Your code is " + user.authCode + "\nAs0AKDr1IwO";
  // const sender = "mytestsms";
  // const xml = `<?xml version="1.0" encoding="utf-8" ?>\n` +
  //   `<request>\n` +
  //   `   <message type="sms">\n` +
  //   `    <sender>${sender}</sender>\n` +
  //   `    <text>${text}</text>\n` +
  //   `    <abonent phone="${phone}"/>\n` +
  //   `   </message>\n` +
  //   `   <security>\n` +
  //   `       <login value="daniilsv" />\n` +
  //   `       <token value="0f5bd3040e5408fbc8545de9cb2a5aa645677fd5" />\n` +
  //   `   </security>\n` +
  //   `</request>\n`;
  // request.post({
  //   url: "http://xml.sms16.ru/xml/",
  //   method: "POST",
  //   headers: { 'Content-Type': 'text/xml' },
  //   body: xml
  // },
  //   function (error, response, body) {
  //     log.e(response.statusCode);
  //     log.e(body);
  //     log.e(error);
  //   });

  res.send(`OK: ${user.authCode}`);
});

/**
 * Проверка смс кода
 * @route POST /phone/auth/verify
 * @group auth - Аутентификация
 * @operationId verify_phone
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
  let token = md5(Utils.random(0, 999999) + "" + Utils.time()).toString();
  user.authCode = null;
  user.auth.push({ token: token });
  await user.save();
  res.send(token);
});

/**
 * Выход
 *
 * Удалит используемый токен из базы. Вход по нему более невозможен
 * @route POST /phone/auth/logout
 * @group auth - Аутентификация
 * @operationId logout_phone
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
