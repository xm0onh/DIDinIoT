import sqlite3 from "sqlite3";
const { Database } = sqlite3;
// Open a SQLite database, stored in the file db.sqlite
const db = new Database("database.sqlite");
let claims: any[] = [];
// Fetch a random integer between -99 and +99

// get all the rows in the table named "claim" and print them
db.all("SELECT * FROM claim", (_, res) => {
  claims.push(res);
  console.log(claims);
});
console.log(claims);
