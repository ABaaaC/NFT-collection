const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const {WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require("../constants");

async function main() {
    /*
    A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
    so whitelistContract here is a factory for instances of our Whitelist contract.
    */
    const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
    const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
    const metadataURL = METADATA_URL;

  
    // here we deploy the contract
    const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
      metadataURL,
      whitelistContract
    );
    // 10 is the Maximum number of whitelisted addresses allowed
  
    // Wait for it to finish deploying
    await deployedCryptoDevsContract.deployed();
  
    // print the address of the deployed contract
    console.log("CryptoDevs Contract Address:", deployedCryptoDevsContract.address);
  }
  
  // Call the main function and catch if there is any error
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });