require("dotenv").config();
const express = require("express");
const app = express();
const ejs = require("ejs");
const ejsLayouts = require("express-ejs-layouts");
const port = process.env.PORT || 3000;
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();
const session = require("express-session");
const connectflash = require("express-flash");
const passport = require("passport");
const MongoDbStore = require("connect-mongo");
const methodOVeride=require("method-override")
// show routes
app.use(morgan("dev"));
// DB
require("./database/db");
// INIT SESSION
app.use(
  session({
    secret: process.env.SESSION,
    resave: false,
    //TO STORE SESSION IN DB
    store: MongoDbStore.create({ mongoUrl: process.env.MONGO_URL }),
    collection: "sessions",
    saveUninitialized: false,
    cookie: {
      // secure: true,
      httpOnly: true,
    },
  })
);

// passport authentication
const passportInit = require("./passportConfig/passport");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

// // global middleware
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(methodOVeride('_method'))
// flash
app.use(connectflash());

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Guest MIDDLEWARE

// ROUTES
app.use("/", require("./routers/route"));
app.use("/", require("./routers/adminRoutes"));

app.use('*', (req, res) => {
  res.render('admin/notfound')
})

// listen port on port
app.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
