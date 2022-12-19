import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import styles from '../styles/Home.module.css'
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from '../constants'

export default function Home() {

  const [isOwner, setIsOwner] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEndeded, setPresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numTokensMinted, setNumTokensMinted] = useState("");

  const web3ModalRef = useRef();

  const presaleMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.presaleMint({
        value: ethers.utils.parseEther("0.01")
      });
      await txn.wait();

      window.alert("You successfully minted NFT!");

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  const publicMint = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.mint({
        value: ethers.utils.parseEther("0.01")
      });
      await txn.wait();

      window.alert("You successfully minted NFT!");

    } catch (error) {
      console.error(error);
    }
    setLoading(false);

  }

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const numTokenIds = await nftContract.tokenIds();
      setNumTokensMinted(numTokenIds.toString());

    } catch (error) {
      console.error(error);
    }
  }

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      )

      const owner = await nftContract.owner();
      const userAddress = await signer.getAddress();

      if (owner.toLowerCase() == userAddress.toLowerCase()) {
        setIsOwner(true);
      }

    } catch (error) {
      console.error(error);
    }
  }

  const startPresale = async () => {
    setLoading(true);
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();
      await txn.wait();

      setPresaleStarted(true);

    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const isPresaleStarted = await nftContract.presaleStarted();
      setPresaleStarted(isPresaleStarted);
      return isPresaleStarted;

    } catch (err) {
      console.error(err);
      return false;
    }

  }

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const presaleEndTime = await nftContract.presaleEnded();
      const currentTimeInSeconds = Math.floor(Date.now() / 1000);
      const hasPresaleEnded = presaleEndTime.lt(currentTimeInSeconds);

      setPresaleEnded(hasPresaleEnded);

    } catch (err) {
      console.error(err);
    }

  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (e) {
      console.error(e.message);
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Please, change the network to the Goerli!");
        throw new Error("Incorrect network");
      }

      if (needSigner) {
        return web3Provider.getSigner();
      }
      return web3Provider;
    } catch (e) {
      console.log('kek');
      console.error(e);
    }
  }

  const onPageLoaded = async () => {
    try {
      connectWallet();
      await getOwner();
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }
    } catch (error) {
      console.error(error);
    }
    await getNumMintedTokens();

    setInterval(async () => {
      await getNumMintedTokens();
    }, 5 * 1000);
    
    setInterval(async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        await checkIfPresaleEnded();
      }    }, 5 * 1000);

    
  }

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false
      });
    }
    onPageLoaded();


  }, [walletConnected])

  function renderButton() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }

    if (loading) {
      return (
        <div className={styles.description}>
          Loading...
        </div>
      );
    }

    if (isOwner && !presaleStarted) {
      return (
        <button onClick={startPresale} className={styles.button}>
          Start Presale
        </button>
      );
    }

    if (!presaleStarted) {
      return (
        <div className={styles.description}>
          Presale is not started.
        </div>
      )
    }

    if (presaleStarted && !presaleEndeded) {
      return (
        <div>
          <div className={styles.description}> 
            Presale has started!
            You can mint only if you are whitelisted.
          </div>
          <button onClick={presaleMint} className={styles.button}>
            Presale Mint
          </button>
        </div>
      );
    }

    if (presaleEndeded) {
      return (
        <div>
          <div className={styles.description}> 
            Presale has ended!
            You can mint even if you are not whitelisted.
          </div>
          <button onClick={publicMint} className={styles.button}>
            Public Mint
          </button>
        </div>
      );
    }

  }


  return (
    <div>
      <Head>
        <title>
          Crypto Dev Collection
        </title>
        <meta name="description" content="NFT-collection" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>

          <h1 className={styles.title}>
            Welcome to Crypto Devs!
          </h1>
          <div className={styles.description}>
            {numTokensMinted}/20 have been minted already.
          </div>
          {renderButton()}
        </div>
        <img className={styles.image} src="/cryptodevs/0.svg" />

      </div>
      <footer className={styles.footer}>
        From ABaaaC with &#9829;
      </footer>
    </div>

  )
}
