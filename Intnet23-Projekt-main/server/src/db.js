import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { resolvePath } from "./util.js";

sqlite3.verbose();

// Open and initialize the database
const db = await open({
  filename: resolvePath("listingsdb"),
  driver: sqlite3.Database,
});

await db.run(
  "CREATE TABLE IF NOT EXISTS users(email TEXT, username TEXT, password TEXT)"
);
await db.run(
  "CREATE TABLE IF NOT EXISTS listings(id INTEGER, name TEXT, email TEXT, username TEXT, description TEXT, price INTEGER, img INTEGER, buyerid TEXT)"
);

export default db;
