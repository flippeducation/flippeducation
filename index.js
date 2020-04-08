const express = require("express");
const bodyParser = require("body-parser");
const pathLib = require("path");
const fsp = require("fs").promises;

const database = require("./database.js");

const logfile = pathLib.join(__dirname, "flippeducation.log");

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", pathLib.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
// https://stackoverflow.com/a/38763341

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

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
  else app.get(endpoint, (req, res) => {
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

database.init().catch(err => console.error(err));

async function logSpam(body) {
  try {
    await fsp.appendFile(logfile,
      `SPAM DETECTED at ${new Date()}:\n` +
      `${JSON.stringify(body)}\n`
    );
  }
  catch (err) {
    console.error(`Error writing data to logfile:\n${err}`);
  }
}

app.post("/submit", async (req, res) => {
  try {
    await database.recordSubmission(req.body);
    res.redirect("/?success=true");
  }
  catch (err) {
    if (err === "Spam detected") {
      await logSpam(req.body);
      res.redirect("/?success=true");
    }
    else {
      res.redirect(`/?success=${err}`);
    }
  }
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    page: "/404",
    title: "404",
    pages: pages
  });
});
