import { agent } from "./veramo/setup.js";

async function main() {
  const fromIdentifier = await agent.didManagerGetByAlias({ alias: "EV" });
  const toIdentifier = await agent.didManagerGetByAlias({ alias: "EVSP" });

  const message = {
    type: "basicmessage",
    content: "Hello, World!",
  };

  const encryptedMessage = await agent.sendMessage({
    from: fromIdentifier.did,
    to: toIdentifier.did,
    message,
  });

  console.log(`Message sent`);
  console.log(JSON.stringify(encryptedMessage, null, 2));
}

main().catch(console.log);
