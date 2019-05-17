const multer = require("multer");
const path = require("path");

module.exports = fileFilter =>
  multer({
    storage: multer.diskStorage({
      destination: function(req, file, callback) {
        callback(null, "./uploads");
      },
      filename: function(req, file, callback) {
        let rand = Date.now() + path.extname(file.originalname);
        callback(null, file.fieldname + "-" + rand);
      }
    }),
    fileFilter: function(req, file, cb) {
      cb(null, fileFilter === undefined ? true : fileFilter(req, file));
    }
  });
