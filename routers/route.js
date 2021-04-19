const express = require("express");
const router = express.Router();
const pageController = require("../controolers/pageControoler");
const authController = require("../controolers/authContooler");
const forgotController = require("../controolers/forgotControoler")
// middleware
const {guest,isAuthenticated} = require("../middlewares/guestMiddleware");
// Page routes
// router.get("/", pageController.dashboardsPage);
router.get("/login",guest, pageController.loginPage);
router.get("/register",guest, pageController.registerPage);
router.get("/password/change", isAuthenticated,pageController.changePasswordPage);
router.get("/forgot",pageController.forgotPasswordPage);
// router.get("/forgot",pageController.forgotPasswordPage);
router.get("/allusers", isAuthenticated,pageController.allusersPage);
router.get("/edit/:id", isAuthenticated,pageController.editPage);
// updateUser
router.put("/edit/:id", authController.updateUser);

// Delete user
router.post("/delete/user/:id", authController.deleteUser);

// auth routes
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/logout", authController.logout);
// forgot route
router.post('/forgot', forgotController.forgotPassword)
// change password page
router.get('/reset/:token', forgotController.resetPassword)
// change password
router.post('/reset/:token', forgotController.changePassword)
// new password
router.post('/password/change', forgotController.newPassword)

module.exports = router;
