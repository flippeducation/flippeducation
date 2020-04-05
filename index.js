const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

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
      endpoint, express.static(path.join(__dirname, location))
  );
  else app.get(endpoint, (req, res) => {
      res.sendFile(path.join(__dirname, location));
  });
});

const paths = new Map([
  ["/", "Home"],
  ["/search", "Search"],
  ["/submit", "Submit Videos"]
]);

app.get("/", (req, res) => {
  res.render("index", {
    page: "/",
    paths: paths
  });
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    page: "/404",
    title: "404",
    paths: paths
  });
});
