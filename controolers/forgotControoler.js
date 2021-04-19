const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/UserModel");
const async = require("async");
const sendEmail = require("../middlewares/sendEmail");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const forgotPassword = async (req, res, next) => {
  try {
    let recoveryPassword = "";

    const token = crypto.randomBytes(20).toString("hex");

    // find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "User does not exist with this email.");
      return res.redirect("/forgot");
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1800000;

    await user.save();
    // send email
    const msg = {
      to: user.email, // Change to your recipient
      from: "devanshurajak23@gmail.com", // Change to your verified sender
      subject: "Recovery Email",
      text:
        "Please click to revoer your password:\n\n" +
        "http://" +
        req.headers.host +
        "/reset/" +
        token +
        "\n\n" +
        "if you did not request please ignore this email",
    };
    sgMail
      .send(msg)
      .then(() => {
        req.flash("success", "Email sent succesfully");
        console.log('email sent');
        res.redirect("/forgot");
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;

  // check token exist in our database
  User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Password reset token expired");
        return res.redirect("/forgot");
      }
      res.render("users/newpassword", { token: token });
    })
    .catch((err) => {
      req.flash("error", "Error:" + err);
      return res.redirect("/forgot");
    });
};

const changePassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    req.flash("error", "invalid token");
    return res.redirect("/forgot");
  }

  // check confirm password
  if (req.body.password != req.body.confirmpassword) {
    req.flash("error", "passowrd dont match!");
    return res.redirect("/forgot");
  }
  // set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  try {
    // send email
    const msg = {
      to: user.email, // Change to your recipient
      from: "devanshurajak23@gmail.com", // Change to your verified sender
      subject: "Your password is changed",
      text:
        "Hello, " +
        user.name +
        "\n\n" +
        "This is the confirmation that the password for your account " +
        user.email +
        " has been changed.",
    };
    sgMail
      .send(msg)
      .then(() => {
        req.flash("success", "Your password has been changed succesfully");
        res.redirect("/login");
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const newPassword = async (req, res) => {
  try {
    if (req.body.password !== req.body.confirmpassword) {
      req.flash("error", "Password dont match Type again");
      return res.redirect("/password/change");
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      req.flash("error", "NO usr found");
      return res.redirect("/password/change");
    }

    // set new password
    user.password = req.body.password;
    await user.save();
    req.flash("success", "Password updated successfully");
    return res.redirect("/");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { forgotPassword, resetPassword, changePassword, newPassword };
