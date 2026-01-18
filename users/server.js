if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const SQLiteStore = require("connect-sqlite3")(session);
const db = require("./views/db");

const intializePassport = require("./passport-config");
const initializePassportGoogle = require("./passport-google-config");

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

// Wrapper functions for database queries
const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

intializePassport(passport, getUserByEmail, getUserById);
initializePassportGoogle();

// Change this to redirect to your desired page after login
const REDIRECT_AFTER_LOGIN = "/?wasredirected"; // or wherever you want users to go

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: REDIRECT_AFTER_LOGIN,
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const id = Date.now().toString();
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const name = req.body.name;
    const email = req.body.email;

    db.run("INSERT INTO users (id, hashed_password, name, email) VALUES (?, ?, ?, ?)", [id, hashedPassword, name, email], (err) => {
      if (err) {
        // tell user that the email is already registered
        req.flash("error", "That email is already registered");
        return res.redirect("/register");
      }
      res.redirect("/login");
    });
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});

app.get("/register/google", checkNotAuthenticated, passport.authenticate("google", { scope: ["profile"] }));

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: REDIRECT_AFTER_LOGIN,
    failureRedirect: "/login",
  }),
);

app.delete("/logout", (req, res) => {
  req.logout((e) => {
    if (e) {
      return e;
    }
  });
  res.redirect("/login");
});

// Middleware functions
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(4000);
