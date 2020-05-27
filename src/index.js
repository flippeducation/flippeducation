const express = require("express");
const bodyParser = require("body-parser");
const pathLib = require("path");
const fsp = require("fs").promises;
const querystring = require("querystring");
const i18n = require("i18n");

const database = require("./database.js");

/**
 * @typedef {import("./types").Page} Page
 * @typedef {import("./types").PageCallback} PageCallback
 * @typedef {import("./types").SubmissionBody} SubmissionBody
 * @typedef {import("./types").Submission} Submission
 */

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

/** @type {Map<string, Page>} */
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
  ["/submissions", {
    view: "submissions",
    title: "Submissions",
    navbar: true,
    callback: submissionsCallback
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

for (const [path, {view, title, localized, callback}] of pages) {
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
  else if (callback) {
    app.get(path, callback(path, view, title));
  }
  else {
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
}

database.init().catch(err => console.error(err));

/**
 * @param {SubmissionBody} body
 */
async function logSpam(body) {
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

/** @type {PageCallback} */
function submissionsCallback(path, view, title) {
  return async (req, res) => {
    // TODO: require authentication

    /** @type {Submission[]} */
    let submissions;
    try {
      submissions = await database.listSubmissions(
        req.query.language,
        parseInt(req.query.itemsPerPage) || undefined,
        parseInt(req.query.startId) || undefined
      );
    }
    catch (err) {
       submissions = [];
    }
    res.render(view, {
      page: path,
      title: title,
      pages: pages,
      query: req.query,
      __: req.__,
      submissions: submissions
    });
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
