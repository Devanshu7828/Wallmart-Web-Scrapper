const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,

    trim: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires:Date
});

UserSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  } catch (error) {
    console.log(error);
  }
  next();
});

UserSchema.methods.validPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    console.log(err);
  }
};



module.exports = Users = mongoose.model("user", UserSchema);
