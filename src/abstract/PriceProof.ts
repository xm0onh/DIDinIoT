/*
The EV (verifier) send a message to the EVSP (prover) to request a proof about the Price.
The EVSP will generate a proof and send it back to the EV.
The EV will verify the proof.
*/

import { GenerateProof } from "../privacy/generate-proof.js";
import { DeployVerifierContract } from "../privacy/deployContract.js";
import { agent } from "../veramo/setup.js";

async function PriceProof(EV, EVSP) {
  let EV_VC = (await agent.dataStoreGetVerifiableCredential({ hash: EV }))
    .credentialSubject;
  let EVSP_VC = (await agent.dataStoreGetVerifiableCredential({ hash: EVSP }))
    .credentialSubject;
  //   const price = [
  //     JSON.stringify(EV_VC.desiredPrice * 10),
  //     JSON.stringify(EVSP_VC.price * 10),
  //   ];
  const price = ["4", "16"];
  await GenerateProof(price);
  const out = await DeployVerifierContract("price", EV, EVSP);
  return out;
}

export { PriceProof };
