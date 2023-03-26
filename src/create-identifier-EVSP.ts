import { agent } from "./veramo/setup.js";

async function main() {
  const identifier = await agent
    .didManagerCreate({
      alias: "EVSP",
      provider: "did:ethr:ganache",
      options: {
        sign: true,
      },
      kms: "local",
    })
    .catch((err) => {
      console.log(err);
    });
  console.log(`New identifier created`);
  console.log(JSON.stringify(identifier, null, 2));
}

main().catch(console.log);
