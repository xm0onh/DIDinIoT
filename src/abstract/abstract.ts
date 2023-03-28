import { ethers } from "ethers";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { agent } from "../veramo/setup.js";

const db = new sqlite3.Database("database.sqlite", (err) => {
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

async function getAllEVSPVCs(EVSP_DID) {
  try {
    const row = await new Promise<any>((resolve, reject) => {
      db.all(
        "SELECT raw FROM credential WHERE issuerDid = ?",
        [
          "did:ethr:ganache:0x032e8e361b0cf4d6aeb2ce45e5f244521aa61e1c98b4b47578b7105d5832392845",
        ],
        (err, row) => {
          if (err) {
            reject(err);
          }
          resolve(row);
        }
      );
    });

    if (row) {
      return JSON.parse(JSON.stringify(row));
    }
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}
export { InsertZKSData, updateZKP, getAllEVSPVCs };
