const User = require("../models/UserModel");
const passport = require("passport");
const bcrypt = require("bcrypt");
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if email alredy exist
    User.exists({ email }, async (err, result) => {
      if (result) {
        req.flash("error", "Email alredy taken!");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }
    });

    //   save user to database
    const user = await new User({
      name,
      email,
      password,
    });
    await user.save();
    req.flash("success", "Register Succesfully");
    return res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      req.flash("error", info.message);
      return next(err);
    }
    if (!user) {
      req.flash("error", info.message);

      return res.redirect("/login");
    }

    req.login(user, (err) => {
      if (err) {
        req.flash("error", info.message);
      }

      return res.redirect("/");
    });
  })(req, res, next);
};

const logout = (req, res) => {
  req.logout();
  req.flash("success", "Logged Out Sucessfullly");
  return res.redirect("/login");
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.updateOne(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
        },
      }
    );

    req.flash('success', 'User Details updated successfully');
    return res.redirect("/allusers")
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.deleteOne({ _id: id });
  res.redirect("/allUsers");
};
module.exports = { registerUser, loginUser, logout, deleteUser,updateUser };
