const User = require("../models/UserModel");

const dashboardsPage = (req, res) => {
  res.render("admin/dashboard");
};

const loginPage = (req, res) => {
  res.render("users/login");
};

const registerPage = (req, res) => {
  res.render("users/signup");
};

const forgotPasswordPage = (req, res) => {
  res.render("users/forgot");
};
const changePasswordPage = (req, res) => {
  res.render("users/changepassword");
};
const newPasswordPage = (req, res) => {
  res.render("users/newpassword");
};
const allusersPage = async (req, res) => {
  const user = await User.find();
  if (!user) {
     res.render("users/alluser", { users: "" });
  }
  res.render("users/alluser", { users: user });
};

const editPage = (req, res) => {
  res.render('users/edituser')
}
// ADMIN PAGES
const newProductsPage = async (req, res) => {
  res.render('admin/newproduct',{prdoduct:''})
}


module.exports = {
  dashboardsPage,
  loginPage,
  registerPage,
  forgotPasswordPage,
  changePasswordPage,
  newPasswordPage,
  allusersPage,
  editPage,
  newProductsPage
};
