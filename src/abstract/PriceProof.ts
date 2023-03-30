/*
The EV (verifier) send a message to the EVSP (prover) to request a proof about the Price.
The EVSP will generate a proof and send it back to the EV.
The EV will verify the proof.
*/

import { GenerateProof } from "../privacy/generate-proof.js";
import { DeployVerifierContract } from "../privacy/deployContract.js";

async function PriceProof(EV, EVSP) {
  //   const price = [
  //     JSON.stringify(EV_VC.desiredPrice * 10),
  //     JSON.stringify(EVSP_VC.price * 10),
  //   ];
  const start = new Date().getTime();
  let elapsed = 0;
  const price = ["4", "16"];
  await GenerateProof("price", price);
  const out = await DeployVerifierContract("price", EV, EVSP).then(() => {
    elapsed = new Date().getTime() - start;
  });
  console.log("------> Elapsed", elapsed / 1000);

  return out;
}

export { PriceProof };
