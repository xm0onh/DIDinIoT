import { ethers } from "ethers";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { agent } from "../veramo/setup.js";

const db = new sqlite3.Database("database1.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

async function InsertZKSData(claim, sender, receiver, proof, input, contract) {
  try {
    // insert new data into the privacy table
    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO privacy (claim, "from", "to", proof, input, contract) VALUES (?, ?, ?, ?, ?, ?)`,
        [claim, sender, receiver, proof, input, contract],
        (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

async function updateZKP(
  claim,
  sender,
  receiver,
  newInput,
  newProof,
  newContract
) {
  try {
    // Update the specific row with new information for input, proof, or contract
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE privacy SET input = ?, proof = ?, contract = ? WHERE claim = ? AND "from" = ? AND "to" = ?`,
        [newInput, newProof, newContract, claim, sender, receiver],
        (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        }
      );
    });

    console.log("Data updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
  }
}

export { InsertZKSData, updateZKP };
