import { agent } from "./veramo/setup.js";

async function main() {
  const identifier = await agent.didManagerGetByAlias({ alias: "EV" });

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      issuer: { id: identifier.did },
      credentialSubject: {
        id: "did:ethr:ganache",
        you: "Raspberry Pi 2",
      },
      type: ["VerifiableCredential", "IOTDeviceCredential"],
      save: true,
    },
    proofFormat: "jwt",
  });

  await agent.dataStoreSaveVerifiableCredential({
    verifiableCredential,
  });

  // const verifiablePresentation = await agent.createVerifiablePresentation({
  //   presentation: {
  //     "@context": ["https://www.w3.org/2018/credentials/v1"],
  //     holder: identifier.did,
  //     type: ["VerifiablePresentation", "IOTDevicePresentation"],
  //     issuanceDate: new Date().toISOString(),
  //     verifiableCredential: [verifiableCredential],
  //   },
  //   proofFormat: "jwt",
  // });

  // await agent.dataStoreSaveVerifiablePresentation({
  //   verifiablePresentation,
  // });

  console.log(`New credential created`);
  console.log(JSON.stringify(verifiableCredential, null, 2));
}

main().catch(console.log);
