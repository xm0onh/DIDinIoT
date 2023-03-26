import { agent } from "./veramo/setup.js";

async function main() {
  const identifiers = await agent.didManagerFind();

  // console.log(`There are ${identifiers.length} identifiers`);
  const didUrl =
    "did:ethr:ganache:0x02380caec8da9d67bab48fcf719798f617674483e54d8d2b29196c9cb818d127d0";
  const didDoc = (await agent.resolveDid({ didUrl })).didDocument;
  console.log(didDoc);
}

main().catch(console.log);
