const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

/**
 * @typedef UserName
 * @property {string} first.required - имя
 * @property {string} second - фамилия
 */
/**
 * @typedef User
 * @property {string} _id.required - id
 * @property {string} email - E-mail
 * @property {string} phone - телефон
 * @property {UserName} name - имя
 */
const UserSchema = new Schema(
  {
    email: String,
    phone: String,
    password: String,
    passSalt: String,
    authCode: Number,
    auth: [
      {
        token: String,
        time: { type: Date, default: Date.now }
      }
    ],
    name: {
      first: String,
      second: String,
    },
  },
  {
    toObject: {
      transform: function (doc, ret, options) {
        if (!options["with_auth"]) delete ret.auth;
        if (!options["with_pass"]) {
          delete ret.password;
          delete ret.passSalt;
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

UserSchema.methods = {};

UserSchema.statics = {
  getByToken: function (token) {
    return this.findOne({ "auth.token": token }).exec();
  },

  getById: function (id) {
    if (id instanceof String) id = Mongoose.Types.ObjectId(id.toString());
    return this.findOne({ _id: id }).exec();
  },

  getByEmail: function (email) {
    return this.findOne({ email: email }).exec();
  }
};

Mongoose.model("User", UserSchema);
