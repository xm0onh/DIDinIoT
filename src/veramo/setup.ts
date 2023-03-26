// Core interfaces
import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IDataStoreORM,
  IKeyManager,
  ICredentialPlugin,
  IMessageHandler,
} from "@veramo/core";

import {
  DIDComm,
  DIDCommHttpTransport,
  DIDCommMessageHandler,
  IDIDComm,
} from "@veramo/did-comm";

import {
  CredentialIssuerEIP712,
  ICredentialIssuerEIP712,
} from "@veramo/credential-eip712";

import { Web3Provider } from "@ethersproject/providers";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { EthereumDIDRegistry } from "ethr-did-resolver";
import { W3cMessageHandler } from "@veramo/credential-w3c";
import { JwtMessageHandler } from "@veramo/did-jwt";
import { MessageHandler } from "@veramo/message-handler";
import {
  SdrMessageHandler,
  ISelectiveDisclosure,
  SelectiveDisclosure,
} from "@veramo/selective-disclosure";

import Web3 from "web3";

// Core identity manager plugin
import { DIDManager } from "@veramo/did-manager";
// import { createGanacheProvider } from "../utils/ganache-provider.js";
// Ethr did identity provider
import { EthrDIDProvider } from "@veramo/did-provider-ethr";

// Core key manager plugin
import { KeyManager } from "@veramo/key-manager";

// Custom key management system for RN
import { KeyManagementSystem, SecretBox } from "@veramo/kms-local";

// W3C Verifiable Credential plugin
import { CredentialPlugin } from "@veramo/credential-w3c";

// Custom resolvers
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import { getResolver as ethrDidResolver } from "ethr-did-resolver";

// Storage plugin using TypeOrm
import {
  Entities,
  KeyStore,
  DIDStore,
  PrivateKeyStore,
  migrations,
  DataStoreORM,
  DataStore,
} from "@veramo/data-store";

// TypeORM is installed with `@veramo/data-store`
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();
// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = "database.sqlite";

// You will need to get a project ID from infura https://www.infura.io
// const INFURA_PROJECT_ID = "20e23d9d432e41d1b01e5fbe33c8c43a";

// This will be the secret key for the KMS

const registryAddress = process.env.REGISTRY_ADDRESS;

let provider, registry;
if (!registryAddress) {
  ({ provider, registry } = await createGanacheProvider());
  updateRegistryAddressInEnvFile(registry);
} else {
  // If registry address exists, use the existing provider and registry
  provider = new Web3Provider(
    new Web3("http://10.0.0.98:8545").currentProvider as any
  );
  registry = registryAddress;
}

// const ethersProvider = createEthersProvider();

const dbConnection = new DataSource({
  type: "sqlite",
  database: DATABASE_FILE,
  synchronize: false,
  migrations,
  migrationsRun: true,
  logging: ["error", "info", "warn"],
  entities: Entities,
}).initialize();

export const agent = createAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    ICredentialPlugin &
    ICredentialIssuerEIP712 &
    IMessageHandler &
    ISelectiveDisclosure &
    IDIDComm
>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(
          new PrivateKeyStore(
            dbConnection,
            new SecretBox(process.env.KMS_SECRET_KEY ?? "none")
          )
        ),
      },
    }),
    new DIDManager({
      store: new DIDStore(dbConnection),
      defaultProvider: "did:ethr:ganache",
      providers: {
        "did:ethr": new EthrDIDProvider({
          defaultKms: "local",
          networks: [
            {
              name: "ganache",
              chainId: 1337,
              provider: provider,
              registry: registry, // set the `registry` property to the address of the deployed contract
            },
          ],
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({
          networks: [
            {
              name: "ganache",
              url: "http://10.0.0.98:8545",
              chainId: 1337,
              provider: provider,
              registry: registry,
            },
          ],
        }),
      }),
    }),
    new CredentialPlugin(),
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
    new CredentialIssuerEIP712(),
    new SelectiveDisclosure(),
    new DIDComm([new DIDCommHttpTransport()]),
    new MessageHandler({
      messageHandlers: [
        new W3cMessageHandler(),
        new SdrMessageHandler(),
        new DIDCommMessageHandler(),
        new JwtMessageHandler(),
      ],
    }),
  ],
});

async function createGanacheProvider(): Promise<{
  provider: Web3Provider;
  registry: string;
}> {
  const pr = new Web3("http://10.0.0.98:8545");
  const provider = new Web3Provider(pr.currentProvider as any);
  await provider.ready;
  const factory = ContractFactory.fromSolidity(EthereumDIDRegistry).connect(
    provider.getSigner(1)
  );
  let registryContract: Contract = await factory.deploy();
  registryContract = await registryContract.deployed();

  await registryContract.deployTransaction.wait();
  const registry = registryContract.address;

  return { provider, registry };
}

function updateRegistryAddressInEnvFile(address: any) {
  const envFilePath = path.resolve(process.cwd(), ".env");
  const content = fs.readFileSync(envFilePath, "utf-8");
  const newContent = content.replace(
    /(REGISTRY_ADDRESS=)(.*)/g,
    `$1${address}`
  );
  fs.writeFileSync(envFilePath, newContent, "utf-8");
}
