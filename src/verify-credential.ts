import { agent } from "./veramo/setup.js";

async function main() {
  const credential = await agent.dataStoreORMGetVerifiableCredentials();
  // console.log(credential[0].verifiableCredential);
  const cred = credential[0].verifiableCredential;
  const result = await agent.verifyCredential({
    credential: {
      ...cred,
    },
  });
  console.log(`Credential verified`, result.verified);
}

main().catch(console.log);
