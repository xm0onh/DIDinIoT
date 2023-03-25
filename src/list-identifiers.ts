import { agent } from "./veramo/setup.js";

async function main() {
  const identifiers = await agent.didManagerFind();

  // console.log(`There are ${identifiers.length} identifiers`);
  const didUrl =
    "did:ethr:ganache:0x022861ba7a9e348f60ccf53f23d4ed0d620cb69ca7b2f78b2f11a4d69c8962fbdf";
  const didDoc = (await agent.resolveDid({ didUrl })).didDocument;
  console.log(didDoc);
}

main().catch(console.log);
