import { ethers } from "ethers";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://10.0.0.98:8545"
  );

  const wallet = new ethers.Wallet(
    "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d",
    provider
  );

  const abi = fs.readFileSync(
    "src/privacy/contracts/_src_privacy_contracts_verifier_sol_Verifier.abi",
    "utf8"
  );
  const binary = fs.readFileSync(
    "src/privacy/contracts/_src_privacy_contracts_verifier_sol_Verifier.bin",
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

  const test = await contract.verifyTx(proof, input);
  console.log(test);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
