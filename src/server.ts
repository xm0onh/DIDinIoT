import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import { agent } from "./veramo/setup.js";

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
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
