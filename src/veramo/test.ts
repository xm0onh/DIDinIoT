import Web3 from "web3";

// Create a new instance of Web3
const web3 = new Web3("http://10.0.0.98:8545");

// Get the list of accounts on the local blockchain
web3.eth
  .getAccounts()
  .then((accounts) => {
    console.log("Accounts:", accounts);
  })
  .catch((error) => {
    console.error("Error getting accounts:", error);
  });
