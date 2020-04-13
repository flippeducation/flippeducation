import express = require("express");
import bodyParser = require("body-parser");
import pathLib = require("path");
import fs = require("fs");
const fsp = fs.promises;
import querystring = require("querystring");
import i18n = require("i18n");

import database = require("./database");
import { Pages, SubmissionBody } from "./types";

const rootdir = pathLib.dirname(__dirname);

const logfile = pathLib.join(rootdir, "flippeducation.log");

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", pathLib.join(rootdir, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
// https://stackoverflow.com/a/38763341

i18n.configure({ directory: pathLib.join(rootdir, "locales") });
app.use(i18n.init);

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
      endpoint, express.static(pathLib.join(rootdir, location))
  );
  else app.get(endpoint, (req, res) => {
      res.sendFile(pathLib.join(rootdir, location));
  });
});

const pages: Pages = new Map([
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
    navbar: false,
    localized: true
  }],
  ["/privacy", {
    view: "privacy",
    title: "Privacy Policy",
    navbar: false,
    localized: true
  }],
]);

for (const [path, {view, title, localized}] of pages) {
  if (localized) {
    app.get(path, async (req, res) => {
      try {
        // Check if localized view file is accessible
        await fsp.access(pathLib.join(rootdir,
          `views/${view}_${req.getLocale()}.pug`
        ));
        res.render(`${view}_${req.getLocale()}`, {
          page: path,
          title: title,
          pages: pages,
          query: req.query
        });
      }
      catch (err) {
        // Render English version (fallback)
        res.render(`${view}_en`, {
          page: path,
          title: title,
          pages: pages,
          query: req.query
        });
      }
    });
  }
  app.get(path, async (req, res) => {
    res.render(view, {
      page: path,
      title: title,
      pages: pages,
      query: req.query,
      __: req.__
    });
  });
}

database.init().catch(err => console.error(err));

async function logSpam(body: SubmissionBody) {
  try {
    await fsp.appendFile(logfile,
      `SPAM DETECTED at ${new Date()}:\n`
      + `${JSON.stringify(body)}\n`
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
    if (err.includes("Spam")) {
      await logSpam(req.body);
      res.redirect("/?success=true");
    }
    else if (err.includes("Not all required")) {
      res.redirect(`/submit?success=${err}&${
        querystring.stringify(req.body)
      }`);
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
