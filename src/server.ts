import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import { agent } from "./veramo/setup";

const app = express();
const port = 8085;

const db = new sqlite3.Database("database.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database.");
});

app.use(express.json());
app.set("json spaces", 2);
// Get EV credential by hash
app.get("/EV/:hash", async (req: Request, res: Response) => {
  const hash = req.params.hash;
  const row = await new Promise<any>((resolve, reject) => {
    db.get("SELECT raw FROM credential WHERE hash = ?", [hash], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });

  if (row) {
    res.json(JSON.parse(row.raw));
  } else {
    res.status(404).send("Credential not found");
  }
});

// Get EVSP credential by hash
app.get("/EVSP/:hash", async (req: Request, res: Response) => {
  const hash = req.params.hash;
  const row = await new Promise<any>((resolve, reject) => {
    db.get("SELECT raw FROM credential WHERE hash = ?", [hash], (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });

  if (row) {
    res.json(JSON.parse(row.raw));
  } else {
    res.status(404).send("Credential not found");
  }
});

// Verify VC
// app.post("/verify", async (req: Request, res: Response) => {
//   try {
//     const credential = req.body as VerifiableCredential;
//     const result = await agent.verifyCredential({
//       verifiableCredential: credential,
//     });
//     res.json({ verified: result.verified });
//   } catch (err) {
//     res.status(500).send("Verification failed: " + err.message);
//   }
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
