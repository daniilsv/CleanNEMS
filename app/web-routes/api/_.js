const app = require("../../core/webexpress").app;

const database = require("../../core/database").db;
const User = database.model("User");

app.all("/api/*", async function(req, res, next) {
  let path = req.path.replace("/api/", "");
  if (path.startsWith("auth") && path !== "auth/logout") return next();
  req.user = await User.getByToken(req.headers.authorization);
  if (req.user == null) return next([403, "Invalid authorization token"]);
  Log(req.method, req.path, req.body);
  return next();
});
