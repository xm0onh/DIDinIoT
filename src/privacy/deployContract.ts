import { ethers } from "ethers";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { updateZKP } from "../abstract/abstract.js";

async function DeployVerifierContract(claim, from, to) {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://10.0.0.98:8545"
  );

  const wallet = new ethers.Wallet(
    "5151216846c0c2d1f9cd6b9ad20a531c17858b66cd08ddf6be96570f62c2516b",
    provider
  );

  const abi = fs.readFileSync(
    "src/privacy/contracts/src_privacy_contracts_verifier_sol_Verifier.abi",
    "utf8"
  );
  const binary = fs.readFileSync(
    "src/privacy/contracts/src_privacy_contracts_verifier_sol_Verifier.bin",
    "utf8"
  );

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Contract is deploying...");
  const contract = await contractFactory.deploy();

  console.log(contract.address);

  const __filename = fileURLToPath(import.meta.url);
  const parentFolder = path.dirname(__filename);
  let rawdata = await fs.readFileSync(parentFolder + "/proofs/proof.json");
  let data = JSON.parse(rawdata.toString());

  let proof = data.proof;
  let input = data.inputs;

  await updateZKP(claim, from, to, input, proof, contract.address);
  const out = await contract.verifyTx(proof, input);
  console.log(out);
}

export { DeployVerifierContract };
