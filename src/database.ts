import mariadb = require("mariadb");
import { SubmissionBody, Submission } from "./types";

// Allow environment variables to be passed from a file called ".env"---
// this is so that database credentials (DB_USER and DB_PWD)
// can be stored for convenience.
// The file .env is in .gitignore and so should not be committed.
require("dotenv").config();

// Holds all global mutable variables
const state = {
  // Whether or not a database connection has been established
  isEstablished: false
};

// Database connection pool
let pool: mariadb.Pool;

// Create database connection pool
async function init() {
  if (!(process.env.DB_USER && process.env.DB_PWD)) {
    throw "No database credentials provided";
  }
  let conn: mariadb.PoolConnection | undefined;
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
    state.isEstablished = true;
  }
  catch (err) {
    throw `Error connecting to database.\n${err}`;
  }
  finally {
    if (conn) conn.release();
  }
}

async function recordSubmission(body: SubmissionBody): Promise<void> {
  if (!state.isEstablished) {
    throw "No database connection";
  }
  if (body.phone_number) {
    throw "Spam detected";
  }
  // Check if all required fields are filled in
  const requiredFields: (keyof SubmissionBody)[] = [
    "name", "language", "lecturer_display_name", "url"
  ];
  if (!(requiredFields.every(key => body[key]))) {
    throw "Not all required fields are filled in";
  }
  let conn: mariadb.PoolConnection | undefined;
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

/**
 * List submissions in the database in a paginated fashion.
 *
 * @param language - language to use (ISO code)
 * @param itemsPerPage - number of submissions per page
 * @param startId - the first submission ID to check
 */
async function listSubmissions(
  language: string = "en", itemsPerPage: number = 10, startId: number = 0
): Promise<Submission[]>
{
  if (!state.isEstablished) {
    throw "No database connection";
  }
  let conn: mariadb.PoolConnection | undefined;
  try {
    conn = await pool.getConnection();
    await conn.query("SET sql_mode=EMPTY_STRING_IS_NULL;");
    let queryResult: any = await conn.query(
      `SELECT * FROM submissions
      WHERE language = :language AND id >= :startId
      LIMIT :itemsPerPage;`,
      { language, startId, itemsPerPage }
    );

    // Convert query result to a Submission[] and return it
    return Object.entries(queryResult)
      .filter(([k, v]) => !isNaN(parseInt(k)))
      .map(([k, v]) => {
        let sub = v as Submission;
        return {
          id: sub.id,
          name: sub.name,
          language: sub.language,
          lecturer_name: sub.lecturer_name,
          lecturer_display_name: sub.lecturer_display_name,
          topics: sub.topics,
          subjects: sub.subjects,
          url: sub.url,
          grade_level: sub.grade_level,
          notes: sub.notes
        };
      });
  }
  catch (err) {
    throw "Error connecting to database";
  }
  finally {
    if (conn) conn.release();
  }
}

export = {
  get enabled() { return state.isEstablished; },
  init,
  recordSubmission,
  listSubmissions,
};
