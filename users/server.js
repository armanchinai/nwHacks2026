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
app.use(passport.initialize());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var/db" }),
  }),
);

intializePassport(
  passport,
  (email) => {
    if (sql.run(`SELECT ${email} FROM users`) == email) {
      return true;
    }
    // return users.find((user) => user.email === email);
  },
  (id) => {
    if (sql.run(`SELECT ${id} FROM users`) == id) {
      return true;
    }
    // users.find((user) => user.id === id),
  }
);

initializePassportGoogle();

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
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    let id = Date.now.toString();
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    let name = req.body.name;
    let email = req.body.email;
    // db.serialize(() => {
    //   db.run(`INSERT INTO users (id, hashed_password, salt, name, email) VALUES (${id}, ${hashedPassword}, 10, ${name}, ${email}) \\`);
    // });
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});

app.get("/register/google", checkNotAuthenticated, passport.authenticate("google"));

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login"
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

// middleware function
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

app.listen(3000);
