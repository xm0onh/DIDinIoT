import { agent } from "./veramo/setup.js";

async function main() {
  const EVSP_IDEN = await agent.didManagerGetByAlias({ alias: "EVSP" });
  const EVSP_VC = await agent.createVerifiableCredential({
    credential: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      issuer: { id: EVSP_IDEN.did },
      id: "urn:uuid:9322e2b1-5451-4488-9896-9e6d59d6e960",
      type: ["VerifiableCredential", "EVSPOfflineCredential"],
      save: true,
      credentialSubject: {
        type: "EVSPOfflineIdentity",
        make: "Station 1",
        model: "Model 1",
        year: "2022",
        battery: "100 kWh",
        range: "402 miles",
        color: "blue",
        vin: "5YJSA1E48HF189279",
        licensePlate: "EVSP001",
        availability: true,
        location: {
          latitude: "37.7749",
          longitude: "-122.4194",
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
