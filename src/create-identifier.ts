import { agent } from "./veramo/setup.js";

async function main() {
  const identifier = await agent.didManagerCreate({
    alias: "UBC",
    provider: "did:ethr:goerli",
    options: {
      // This is the private key of the account that will be used to sign the
      // transactions. It is not recommended to use a private key directly
      // in the code. Instead, use an environment variable or a configuration
      // file to store the private key.
      // This is the address of the account that will be used to sign the
      // transactions. It is not recommended to use an address directly
      // in the code. Instead, use an environment variable or a configuration
      // file to store the address.
    },
    kms: "local",
  });
  console.log(`New identifier created`);
  console.log(JSON.stringify(identifier, null, 2));
}

main().catch(console.log);
