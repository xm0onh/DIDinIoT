// import Web3 from "web3";
// const ganacheUrl = "http://10.0.0.98:8545"; // the URL of your Ganache test network
// const web3 = new Web3(ganacheUrl);

// const txHash =
//   "0xed5f7970bbbcaa26d4bd51baf66ea6d6443d696493ba025f1d4d4381c9ff97cd"; // the transaction hash
// web3.eth.getTransaction(txHash, (err: any, tx: any) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log(tx);
//   }
// });

import { createAgent, IDIDManager, IKeyManager } from "@veramo/core";
import { JwtMessageHandler } from "@veramo/did-jwt";
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
import { KeyManagementSystem } from "@veramo/kms-local";
import { DIDStore } from "@veramo/did-store-typeorm";
import { KeyStore } from "@veramo/key-store-typeorm";
import { CredentialIssuer } from "@veramo/credential-w3c";
import { CredentialStore } from "@veramo/credential-store-typeorm";

import { createConnection } from "typeorm";

// Initialize a new database connection
await createConnection({
  type: "sqlite",
  database: "database.sqlite3",
  synchronize: true,
  logging: ["error", "warn"],
  entities: [DIDStore, KeyStore, CredentialIssuer, CredentialStore],
});

// Initialize a new Veramo agent
const agent = createAgent();

// Set up the key management system using local storage
const keyManagementSystem = new KeyManagementSystem({ storage: localStorage });
await agent.setKeyManager(keyManagementSystem);

// Set up the DID provider for the Ethereum network
const ethrDidProvider = new EthrDIDProvider({
  rpcUrl: "http://localhost:8545",
  chainId: 1337,
});

await agent.didManagerAddProvider(ethrDidProvider);

// Set up the DID and key stores
const didStore = new DIDStore();
await agent.didManagerAddPlugin(didStore);

const keyStore = new KeyStore();
await agent.keyManagerAddPlugin(keyStore);

// Set up the JWT message handler
const jwtMessageHandler = new JwtMessageHandler({
  defaultAlgorithm: "ES256K",
  didMethodsSupported: ["did:ethr"],
});

await agent.didManagerAddPlugin(jwtMessageHandler);

// Create a new EV DID
const evDid = await agent.didManagerCreate({
  provider: "did:ethr",
});

console.log("EV DID created:", evDid.did);

// Create a new EVSP DID
const evspDid = await agent.didManagerCreate({
  provider: "did:ethr",
});

console.log("EVSP DID created:", evspDid.did);

// Issue a JWT credential from the EV DID to the EVSP DID
const credential = {
  subject: evspDid.did,
  issuer: evDid.did,
  expirationDate: "2024-03-23T12:00:00Z",
  type: ["VerifiableCredential", "ElectricVehicleService"],
  credentialStatus: "http://example.org/credentialstatus/3",
};

const jwt = await agent.createVerifiableCredentialJwt({
  credential,
  signer: evDid.did,
});

console.log("Credential:", jwt);

// Verify the JWT credential using the EV DID
const verified = await agent.verifyCredentialJwt({
  jwt,
  verify: evDid.did,
});

console.log("Verified:", verified);
