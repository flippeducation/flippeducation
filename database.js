'use strict';
const mariadb = require("mariadb");

// Allow environment variables to be passed from a file called ".env"---
// this is so that database credentials (DB_USER and DB_PWD)
// can be stored for convenience.
// The file .env is in .gitignore and so should not be committed.
require("dotenv").config();

// Whether or not a database connection has been established
let enabled = false;

// Database connection pool
let pool;

// Create database connection pool
async function init() {
  if (!(process.env.DB_USER && process.env.DB_PWD)) {
    throw "No database credentials provided";
  }
  let conn;
  try {
    pool = mariadb.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_DATABASE || "flippeducation",
      connectionLimit: 5,
      namedPlaceholders: true
    });
    conn = await pool.getConnection();
    enabled = true;
  }
  catch (err) {
    throw `Error connecting to database.\n${err}`;
  }
  finally {
    if (conn) conn.release();
  }
}

async function recordSubmission(body) {
  if (!enabled) {
    throw "No database connection";
  }
  if (body.phone_number) {
    throw "Spam detected";
  }
  // Check if all required fields are filled in
  if (!([
    "name", "language", "lecturer_display_name", "url"
  ].every(key => body[key]))) {
    throw "Not all required fields are filled in";
  }
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("SET sql_mode=EMPTY_STRING_IS_NULL;")
    await conn.query(
      `INSERT INTO submissions (name, language, lecturer_name,
      lecturer_display_name, topics, subjects, url, grade_level, notes)
      VALUES (:name, :language, :lecturer_name, :lecturer_display_name,
      :topics, :subjects, :url, :grade_level, :notes);`,
      body
    );
  }
  catch (err) {
    throw "Error connecting to database";
  }
  finally {
    if (conn) conn.release();
  }
}

module.exports = {
  get enabled() { return enabled; },
  init,
  recordSubmission
};
