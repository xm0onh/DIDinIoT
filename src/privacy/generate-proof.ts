import { initialize } from "zokrates-js";
import chalk from "chalk";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

async function main() {
  const zokratesProvider = await initialize();

  const __filename = fileURLToPath(import.meta.url);

  const parentFolder = path.dirname(__filename);

  const rawdata = fs.readFileSync(parentFolder + "/zk.zok");

  const source = rawdata.toString();

  // compilation
  const artifacts = zokratesProvider.compile(source);

  // computation
  const { witness, output } = zokratesProvider.computeWitness(artifacts, [
    "16",
    "4",
  ]);

  // run setup
  const keypair = zokratesProvider.setup(artifacts.program);

  // generate proof
  console.log("\nGenerating proofs...");
  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    keypair.pk
  );
  await fse.outputFile(
    parentFolder + "/proofs/proof.json",
    JSON.stringify(proof)
  );
  console.log("\nProofs generated successfully");

  // export solidity verifier
  console.log("\nGenerating Solidity verifier contract...");
  const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
  await fse.outputFile(parentFolder + "/contracts/verifier.sol", verifier);
  console.log(chalk.green("\nContracts generated successfully"));
}

main();
