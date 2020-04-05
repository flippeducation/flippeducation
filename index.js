const express = require("express");
const pathLib = require("path");

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", pathLib.join(__dirname, "views"));

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
  app.get(path, (req, res) => {
    res.render(view, {
      page: path,
      title: title,
      pages: pages
    });
  });
}

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    page: "/404",
    title: "404",
    pages: pages
  });
});
