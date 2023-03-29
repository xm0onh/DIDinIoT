import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import { agent } from "./veramo/setup.js";
import { InsertZKSData, updateZKP } from "./abstract/abstract.js";
import { finder as EVSPFinder } from "./EVSP_Finder/EVSPFinder.js";
import { PriceProof } from "./abstract/PriceProof.js";
const app = express();
const port = 8085;

const db = new sqlite3.Database("database.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the database. server");
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
app.get("/verify/:hash", async (req: Request, res: Response) => {
  try {
    const hash = req.params.hash;
    const verifiableCredential = await agent.dataStoreGetVerifiableCredential({
      hash,
    });
    const result = await agent.verifyCredential({
      credential: {
        ...verifiableCredential,
      },
    });
    res.json({ verified: result.verified });
  } catch (err) {
    res.status(500).send("Verification failed: " + err);
  }
});

app.get("/send-message", async (req: Request, res: Response) => {
  // const fromAlias = req.body.fromAlias;
  // const toAlias = req.body.toAlias;
  // const message = req.body.message;

  try {
    const fromIdentifier = await agent.didManagerGetByAlias({
      alias: "EV",
    });
    const toIdentifier = await agent.didManagerGetByAlias({ alias: "EVSP" });

    const message = {
      type: "test",
      from: fromIdentifier.did,
      to: toIdentifier.did,
      id: "test",
      body: { hello: "world" },
    };

    const packedMessage = await agent.packDIDCommMessage({
      packing: "jws",
      message: message,
    });

    // const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage);
    // console.log("UPDACKED" + JSON.stringify(unpackedMessage));

    res.json(JSON.parse(JSON.stringify(packedMessage)));
  } catch (err) {
    res.status(500).send("Failed to send message: " + err);
  }
});

app.get("/receive-message", async (req: Request, res: Response) => {
  const alias = req.body.alias;
  const packedMessage = req.body.packedMessage;

  try {
    const identifier = await agent.didManagerGetByAlias({ alias: "EVSP" });

    const unpackedMessage = await agent.unpackDIDCommMessage(packedMessage);

    // Process the received message as needed, e.g., store it in a database or trigger some action.
    res.json({ message: "Message received successfully", unpackedMessage });
  } catch (err) {
    res.status(500).send("Failed to receive message: " + err);
  }
});

app.get("/send-sdr", async (req: Request, res: Response) => {
  try {
    const identifier = await agent.didManagerGetByAlias({
      alias: "EV",
    });

    let JWT = await agent.createSelectiveDisclosureRequest({
      data: {
        issuer: identifier.did,
        tag: "sdr-one",
        claims: [
          {
            reason: "We need it",
            claimType: "name",
            essential: true,
          },
        ],
      },
    });

    const message = await agent.handleMessage({
      raw: JWT,
      save: true,
    });
  } catch (err) {
    res.status(500).send("Failed to send message: " + err);
  }
});

app.get("/zkp/:from/:to/:claim", async (req: Request, res: Response) => {
  const from = req.params.from;
  const to = req.params.to;
  const claim = req.params.claim;
  InsertZKSData(from, to, claim, "", "", "");
  res.json("done");
});

app.get(
  "/uzkp/:claim/:from/:to/:input/:proof/:contract",
  async (req: Request, res: Response) => {
    const from = req.params.from;
    const to = req.params.to;
    const claim = req.params.claim;
    const input = req.params.input;
    const proof = req.params.proof;
    const contract = req.params.contract;
    updateZKP(claim, from, to, input, proof, contract);
    res.json("done");
  }
);

app.get("/FindEVSP/:hash", async (req: Request, res: Response) => {
  try {
    const hash = req.params.hash;
    let verifiableCredential = await agent.dataStoreGetVerifiableCredential({
      hash: hash,
    });
    verifiableCredential = JSON.parse(JSON.stringify(verifiableCredential));
    let priority = {
      distance: 5,
      batteryCapacity: 1,
      chargingSpeed: 1,
      price: 1,
      waitingTime: 1,
    };

    let price = {
      ev: 8.5,
    };
    let time = {
      ev: 50,
    };
    const bestEVSP = await EVSPFinder(
      Array(verifiableCredential.credentialSubject),
      priority,
      price,
      time
    );
    res.json(bestEVSP);
  } catch (err) {
    res.status(500).send("Failed: " + err);
  }
});

app.get("/Proof/:claim/:from/:to", async (req: Request, res: Response) => {
  const from = req.params.from;
  const to = req.params.to;
  const claim = req.params.claim;
  InsertZKSData(claim, from, to, "", "", "");
  if (claim == "price") {
    try {
      const out = await PriceProof(from, to);
      res.json(JSON.stringify(out));
    } catch (err) {
      console.error(err);
      res.json("false");
    }
  } else if (claim === "owner") {
  } else {
    res.json("No Action");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
