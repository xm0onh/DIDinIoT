import { initialize } from "zokrates-js";
import chalk from "chalk";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

function runCommand(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        reject(error);
      }
      if (stderr) {
        console.warn(stderr);
        reject(stderr);
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function GenerateProof(type, input) {
  const zokratesProvider = await initialize();

  const __filename = fileURLToPath(import.meta.url);
  const parentFolder = path.dirname(__filename);
  let rawdata;
  if (type === "price") {
    rawdata = fs.readFileSync(parentFolder + "/price.zok");
  } else if (type === "owner") {
    console.log("owner is running");
    rawdata = fs.readFileSync(parentFolder + "/ownership.zok");
  }

  const source = rawdata.toString();

  // compilation
  const artifacts = zokratesProvider.compile(source);

  // The number of Constraints
  console.log("Constraint Count ->>>>", artifacts.constraintCount);

  // computation
  const { witness, output } = zokratesProvider.computeWitness(artifacts, input);

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

  try {
    await runCommand("yarn prsmart");
    console.log("Command executed successfully");
  } catch (error) {
    console.error("Error executing command:", error);
  }
}

export { GenerateProof };
