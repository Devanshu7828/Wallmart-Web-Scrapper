function guest(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/");
}
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please Login first.");
  return res.redirect("/login");
}

module.exports = { guest, isAuthenticated };
