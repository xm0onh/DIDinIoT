// Core interfaces
import {
  createAgent,
  IDIDManager,
  IResolver,
  IDataStore,
  IDataStoreORM,
  IKeyManager,
  ICredentialPlugin,
} from "@veramo/core";

import { Web3Provider } from "@ethersproject/providers";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { EthereumDIDRegistry } from "ethr-did-resolver";
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
import { getResolver as webDidResolver } from "web-did-resolver";
// import { createEthersProvider } from "../utils/ethers-provider";
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

// This will be the name for the local sqlite database for demo purposes
const DATABASE_FILE = "database.sqlite";

// You will need to get a project ID from infura https://www.infura.io
// const INFURA_PROJECT_ID = "20e23d9d432e41d1b01e5fbe33c8c43a";

// This will be the secret key for the KMS
const KMS_SECRET_KEY =
  "6a8e08d87c65354d21116708823aa620e266b860b1b01a0733b7a01a2fab1bcf";

const { provider, registry } = await createGanacheProvider();
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
    ICredentialPlugin
>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection),
      kms: {
        local: new KeyManagementSystem(
          new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))
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
              provider,
              registry,
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
              url: "http://localhost:8545",
              chainId: 1337,
              provider,
              registry,
            },
          ],
        }),
        ...webDidResolver(),
      }),
    }),
    new CredentialPlugin(),
    new DataStore(dbConnection),
    new DataStoreORM(dbConnection),
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
    provider.getSigner(0)
  );
  let registryContract: Contract = await factory.deploy();
  registryContract = await registryContract.deployed();

  await registryContract.deployTransaction.wait();

  const registry = registryContract.address;

  return { provider, registry };
}
