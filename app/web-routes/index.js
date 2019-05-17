
const router = require("express").Router();
const app = require("../core/webexpress").app;
app.use("/", router);

router.get("/", async function(req, res, next) {
  res.status(200).send({
    error: false
  });
});
