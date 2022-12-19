const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const helpers = require("@nomicfoundation/hardhat-network-helpers");

  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");

  require("dotenv").config({ path: ".env" });
  const {WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require("../constants");

  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  const metadataURL = METADATA_URL;
  
  describe("CryptoDevs", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
  
    describe("Deployment", function () {

    
      it("URI test", async function () {
        const CryptoDevs = await ethers.getContractFactory("CryptoDevs");
        const deployedCryptoDevsContract = await CryptoDevs.deploy(
            metadataURL,
            whitelistContract
          );
        await deployedCryptoDevsContract.deployed();

        const [owner] = await ethers.getSigners();
        const ownerBalance = await deployedCryptoDevsContract.balanceOf(owner.address);
        console.log(ownerBalance);

        const minter_address = owner.address;
        console.log(minter_address);


        await helpers.setBalance(minter_address, 100n ** 18n);

        await deployedCryptoDevsContract.startPresale();
        await helpers.time.increase(3600);
        const tmp = await deployedCryptoDevsContract.mint({value: ethers.utils.parseEther("0.01")});
        await tmp.wait();

        const minted = await deployedCryptoDevsContract.tokenIds();
        console.log(minted);

        const uri = await deployedCryptoDevsContract.tokenURI(1);
        console.log(uri);
        expect(uri).to.be.equal("https://nft-collection-abaaac.vercel.app/api/1");
      });
    });

  });
  