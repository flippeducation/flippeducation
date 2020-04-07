const express = require("express");
const pathLib = require("path");
const mariadb = require("mariadb");
const bodyParser = require("body-parser");

// Allow environment variables to be passed from a file called ".env"---
// this is so that database credentials (DB_USER and DB_PWD)
// can be stored for convenience.
// The file .env is in .gitignore and so should not be committed.
require("dotenv").config();

// Global variable to store whether or not a database connection
// has been established
let database = false;

// Database connection pool
let pool;

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", pathLib.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
// https://stackoverflow.com/a/38763341

app.listen(port, async () => console.log(`App listening at http://localhost:${port}`));

// Expose frontend dependencies from node-modules
// https://stackoverflow.com/a/27464258
new Map([
  [
    "/",
    "/public/"
  ],
  [
    "/css/pure-min.css",
    "/node_modules/purecss/build/pure-min.css"
  ],
  [
    "/css/grids-responsive-min.css",
    "/node_modules/purecss/build/grids-responsive-min.css"
  ],
]).forEach((location, endpoint) => {
  if (location.slice(-1) === "/") app.use(
      endpoint, express.static(pathLib.join(__dirname, location))
  );
  else app.get(endpoint, async (req, res) => {
      res.sendFile(pathLib.join(__dirname, location));
  });
});

const pages = new Map([
  ["/", {
    view: "index",
    title: "",
    navbar: true,
    navbarTitle: "Home",
  }],
  ["/search", {
    view: "search",
    title: "Search",
    navbar: true
  }],
  ["/submit", {
    view: "submit",
    title: "Submit Videos",
    navbar: true
  }],
  ["/license", {
    view: "license",
    title: "License",
    navbar: false
  }],
  ["/privacy", {
    view: "privacy",
    title: "Privacy Policy",
    navbar: false
  }],
]);

for (const [path, {view, title,}] of pages) {
  app.get(path, async (req, res) => {
    res.render(view, {
      page: path,
      title: title,
      pages: pages,
      success: req.query.success || ""
    });
  });
}

// Create database connection pool if username and password are given.
// Async IIFE is used so that await can be used
(async () => {
  let conn;
  try {
    if (!(process.env.DB_USER && process.env.DB_PWD)) {
      throw "No credentials provided";
    }
    pool = mariadb.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      connectionLimit: 5
    });
    conn = await pool.getConnection();
    database = true;
  }
  catch (err) {
    console.error("Proceeding without database connection");
  }
  finally {
    if (conn) conn.release();
  }
})();

app.post("/submit", async (req, res) => {
  let success = "No database connection";
  if (database) {
    let conn;
    try {
      conn = await pool.getConnection();
      console.log(req.body);
      success = "true";
    }
    catch (err) {
      success = "Error connecting to database";
    }
    finally {
      if (conn) conn.release();
    }
  }
  res.redirect(`/?success=${success}`);
});

app.use(async (req, res) => {
  res.status(404);
  res.render("404", {
    page: "/404",
    title: "404",
    pages: pages
  });
});
