const passport = require("passport");
const LocalStatergy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/UserModel")
function init(passport) {
  passport.use(
    new LocalStatergy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        // Login
        // Check if email exist in db
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, {
            message: "No user found ",
          });
        }
        const isvalid = await user.validPassword(password);

        if (isvalid) {
          
          return done(null, user, { message: "Logged in succesfully" });
        } else {
          return done(null, false, { message: "Wrong Details" });
        }
      }
    )
  );
  // This method store user id in session after sucessfully logged in
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    // when we do req.user we get login user the user
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}

module.exports = init;