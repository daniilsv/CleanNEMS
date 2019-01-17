"use strict";

const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const UserSchema = new Schema(
  {
    email: String,
    password: String,
    pass_salt: String,
    auth: [
      {
        token: String,
        time: { type: Date, default: Date.now }
      }
    ]
  },
  {
    toObject: {
      transform: function(doc, ret, options) {
        if (!options["with_auth"]) delete ret.auth;
        if (!options["with_pass"]) {
          delete ret.password;
          delete ret.pass_salt;
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

UserSchema.methods = {};

UserSchema.statics = {
  getByToken: function(token) {
    return this.findOne({ "auth.token": token }).exec();
  },

  getById: function(id) {
    if (id instanceof String) id = Mongoose.Types.ObjectId(id.toString());
    return this.findOne({ _id: id }).exec();
  },

  getByEmail: function(email) {
    return this.findOne({ email: email }).exec();
  }
};

Mongoose.model("User", UserSchema);
