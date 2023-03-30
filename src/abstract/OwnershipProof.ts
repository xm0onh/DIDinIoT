/*
The EVSP (verifier) send a message to the EV (prover) to request a proof about the Ownership.
The EV will generate a proof and send it back to the EVSP.
The EVSP will verify the proof.
*/

import { GenerateProof } from "../privacy/generate-proof.js";
import { DeployVerifierContract } from "../privacy/deployContract.js";

async function OwnershipProof(EV, EVSP) {
  const start = new Date().getTime();
  let elapsed = 0;
  const owner = [true];
  await GenerateProof("owner", owner);
  const out = await DeployVerifierContract("owner", EV, EVSP).then(() => {
    elapsed = new Date().getTime() - start;
  });
  console.log("------> Elapsed", elapsed / 1000);

  return out;
}

export { OwnershipProof };
