import { agent } from "./veramo/setup.js";

async function main() {
  const EV_IDEN = await agent.didManagerGetByAlias({ alias: "EV" });
  const EV_VC = await agent.createVerifiableCredential({
    credential: {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      issuer: { id: EV_IDEN.did },
      type: ["VerifiableCredential", "EVCredential"],
      save: true,
      credentialSubject: {
        id: "did:example:456",
        type: "ElectricVehicle",
        make: "Tesla",
        model: "Model S",
        year: "2022",
        VIN: "5YJSA1E11MF413982",
        batteryCapacity: "75 kWh",
        chargingRate: "150 kW",
        currentCharge: "70%",
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
    verifiableCredential: EV_VC,
  });
}

main().catch(console.log);
