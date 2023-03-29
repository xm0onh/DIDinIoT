import { agent } from "./veramo/setup.js";

async function main() {
  const EVSP_IDEN = await agent.didManagerGetByAlias({ alias: "EVSP" });
  const EVSP_VC = await agent.createVerifiableCredential({
    credential: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      issuer: { id: EVSP_IDEN.did },
      type: ["VerifiableCredential", "EVSPOfflineCredential"],
      save: true,
      credentialSubject: {
        name: "EVSP Tajrish",
        type: "EVSPOfflineIdentity",
        make: "Station 1",
        model: "Model 1",
        year: "2022",
        batteryCapacity: 100, // kWh
        chargingSpeed: 100, // X miles per hour
        range: 402, // miles
        price: 0.5,
        availability: true,
        location: {
          latitude: 35.806977,
          longitude: 51.428818,
        },
      },
      issuanceDate: new Date().toISOString(),
    },
    proofFormat: "jwt",
  });

  await agent.dataStoreSaveVerifiableCredential({
    verifiableCredential: EVSP_VC,
  });
}

main().catch(console.log);
