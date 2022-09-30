<div id="top"></div>

<!-- ABOUT THE PROJECT -->

# KryptoPunks NFT Staking Dapp

This is a modern NFT project, the dapp allows users to mint their KryptoPunks items and stake them to receive staking rewards in the form of KryptoPunkToken (KPT).

<p align="center">
  <img alt="Dark" src="https://user-images.githubusercontent.com/83681204/185254772-40163a1d-3481-4519-b936-b5093c71e097.png" width="100%">
</p>

### Built With

* [Solidity](https://docs.soliditylang.org/)
* [Hardhat](https://hardhat.org/getting-started/)
* [React.js](https://reactjs.org/)
* [ethers.js](https://docs.ethers.io/v5/)
* [web3modal](https://github.com/Web3Modal/web3modal)
* [material ui](https://mui.com/getting-started/installation/)

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#project-structure">Project structure</a>
     <ul>
       <li><a href="#smart-contracts">Smart Contracts</a></li>
       <li><a href="#user-interface">User interface</a></li>
      </ul>
    </li>
    <li>
      <a href="#how-to-run">How to Run</a>
      <ul>
       <li><a href="#prerequisites">Prerequisites</a></li>
       <li><a href="#contracts">Contracts</a></li>
       <li><a href="#front-end">Front-end</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- PROJECT STRUCTURE -->

## Project Structure

### Smart contracts

The contracts development and testing is done using the Hardhat framework in the smart_contracts folder, for this project there are 3 main contracts :
      <ul>
       <li><b>KryptoPunks.sol :</b></li>
This is the NFT collection contract, i used the ERC721A standard because it has lower gas usage for multiple NFT mint in the same transaction, the contract will allow user to mint items from the collection which are allowed to be staked in the NFT vault.
       <li><b>KryptoPunksToken.sol :</b></li>
The KryptoPunksToken or KPT is the ERC20 token used for distributing staking rewards, it's completly controlled by the stakingVault contract which is the only address allowed to mint new tokens to stakers.
       <li><b>NFTStakingVault.sol :</b></li>
The staking vault contract is at the center of this application, it allows users to stake their KryptoPunks items and calculate the KPT rewards accumulated for each item based on the staking period. When a user wants to unstake or claim the accrued rewards from his NFTs, the contract is responsible for minting the KPT tokens to the user by calling the KryptoPunksToken contract.
      </ul>

<b>The architecture of the application</b> is illustrated in the diagram below :

![staking](https://user-images.githubusercontent.com/83681204/185807295-76ab7ea9-3f46-49bb-bf26-c43fa9de7002.png)

### User interface
   
The front end is built with React JS, it allows users to mint new KryptoPunks nfts and stake them in the vault for receiving KPT rewards over time, the app also give a simple admin dashboard for setting minting prices and maximum NFTs minted per tx.

The front-end is built using the following libraries:
      <ul>
        <li><b>Ethers.js:</b> used as interface between the UI and the deployed smart contract</li>
        <li><b>Web3modal:</b> for conecting to Metamask</li>
        <li><b>@reduxjs/toolkit & redux-persist:</b> for managing the app states (account, balance, blockchain) </li>
        <li><b>Material UI:</b> used for react components and styles </li>    
      </ul>
      
The home page is a modern NFT landing page that explains the KryptoPunks project and it's progression roadmap :

![Capture d’écran 2022-08-17 à 22 36 18](https://user-images.githubusercontent.com/83681204/185249401-0c9ee430-3e8a-46d7-949f-48113f434ceb.png)

The mint page allows user to mint new KryptoPunks and it contains all the information about the NFT collection (total supply, minting cost,...), and the details about the nfts held by the user (items owned, items staked, total reward accumulated,...).

![Capture d’écran 2022-08-17 à 22 48 18](https://user-images.githubusercontent.com/83681204/185249853-36e1c15f-4f26-4aea-a060-604cb56cc52f.png)

On this page the user also finds a list of all the items he owns, which can be directly staked & unstaked from there and claim the reward that was accrued :

![Capture d’écran 2022-08-17 à 22 48 36](https://user-images.githubusercontent.com/83681204/185250186-07ff0242-0c6b-4ff9-9d7a-f9433b85f70f.png)

The dashboard can only be accessed by the nft contract owner from the account window by clicking on the account button in the top of the page, it gives the owner the possibility of withdraw the contract balance, changing nft minting parametres or changing contract state (paused):

![Capture d’écran 2022-08-17 à 22 49 01](https://user-images.githubusercontent.com/83681204/185250309-9166ae4d-8bbb-422f-99d1-4ed9c41d46a5.png)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE GUIDE -->
## How to Run

### Prerequisites

Please install or have installed the following:
* [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/)
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) Chrome extension installed in your browser
* [Ganache](https://trufflesuite.com/ganache/) for local smart contracts deployement and testing.

Clone this repo with the command :
   ```sh
   git clone https://github.com/kaymen99/KryptoPunks-nft-staking-dapp.git
   cd KryptoPunks-nft-staking-dapp
   ```

### Contracts

As mentioned before the contracts are developed with the Hardhat framework, before deploying them you must first install the required dependancies by running :
   ```sh
   cd smart_contracts
   yarn
   ```
   
Next you need to setup the environement variables in the .env file, this are used when deploying the contracts :

   ```sh
    RINKEBY_ETHERSCAN_API_KEY="your etherscan api key"
    RINKEBY_RPC_URL="Your rinkeby RPC url from alchemy or infura"
    POLYGON_RPC_URL="Your polygon RPC url from alchemy or infura"
    MUMBAI_RPC_URL="Your mumbai RPC url from alchemy or infura"
    PRIVATE_KEY="your private key"
   ```
* <b>NOTE :</b> Only the private key is needed when deploying to the ganache network, the others variables are for deploying to the testnets or real networks and etherscan api key is for verifying your contracts on rinkeby etherscan.

After going through all the configuration step, you'll need to deploy the 3 contracts to the ganache network by running: 
   ```sh
   yarn deploy --network ganache
   ```
This will create a config.js file and an artifacts folder and transfer them to the src folder to enable the interaction between the contract and the UI

* <b>IMPORTANT :</b> I used the ganache network for development purposes only, you can choose another testnet or real network if you want, for that you need to add it to the hardhat.config file for example for the rinkeby testnet  

   ```sh
   rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4,
    }
   ```

If you want to test the vault/NFT contracts or the staking process, you can do it by running:
   ```sh
   yarn test
   ```
### Front end

To start the user interface just run the following commands :
   ```sh
   cd front-end
   yarn
   yarn start
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Contact -->
## Contact

If you have any question or problem running this project just contact me: aymenMir1001@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

