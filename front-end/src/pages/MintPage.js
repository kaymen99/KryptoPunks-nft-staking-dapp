import React, { useState, useEffect } from 'react';
import "../assets/styles.css";
import image1 from "../assets/img/mint-punk.png";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useSelector } from "react-redux";
import { ethers } from "ethers";
import axios from "axios"
import { Table } from "react-bootstrap";
import { CircularProgress } from "@mui/material"

import stakingContract from "../artifacts/NFTStakingVault.sol/NFTStakingVault.json";
import nftContract from "../artifacts/KryptoPunks.sol/KryptoPunks.json";
import { stakingContractAddress, nftContractAddress, ownerAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

function MintPage() {
    const data = useSelector((state) => state.blockchain.value)

    const [mintAmount, setMintAmount] = useState(1)
    const [userNfts, setUserNfts] = useState([])
    const [info, setInfo] = useState({
        currentSupply: 0,
        maxSupply: 0,
        maxMintAmountPerTx: 5,
        mintCost: 0,
        paused: 1,
        userNftIds: [],
        stakedNftIds: [],
        totalReward: 0
    })
    const [loading, setLoading] = useState(false)

    const getInfo = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, provider);
            const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, provider);

            const signer = provider.getSigner()
            const user = await signer.getAddress()

            const stakedTokens = Array.from((await staking_contract.tokensOfOwner(user)), x => Number(x))
            const reward = await staking_contract.getTotalRewardEarned(user)

            const paused = await nft_contract.paused()
            var userTokens = Array.from((await nft_contract.tokensOfOwner(user)), x => Number(x))
            const maxMintAmountPerTx = await nft_contract.maxMintAmountPerTx()
            const cost = await nft_contract.cost()
            const baseURI = await nft_contract.baseURI()
            const baseExtension = await nft_contract.baseExtension()
            const totalSupply = await nft_contract.totalSupply()
            const maxSupply = await nft_contract.maxSupply()

            userTokens = userTokens.concat(stakedTokens).sort()

            setInfo({
                currentSupply: Number(totalSupply),
                maxSupply: Number(maxSupply),
                maxMintAmountPerTx: Number(maxMintAmountPerTx),
                mintCost: Number(ethers.utils.formatUnits(cost, "ether")),
                paused: Number(paused),
                userNftIds: userTokens,
                stakedNftIds: stakedTokens,
                totalReward: Number(ethers.utils.formatUnits(reward, "ether"))
            })

            const _userNfts = await Promise.all(userTokens.map(async (nft) => {
                const metadata = await axios.get(
                    baseURI.replace("ipfs://", "https://ipfs.io/ipfs/") + "/" + nft.toString() + baseExtension
                )
                return {
                    id: nft,
                    uri: metadata.data.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                }
            }))

            setUserNfts(_userNfts)
        }
    }

    const mint = async () => {
        if (data.network === networksMap[networkDeployedTo] && info.paused == 2) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                if (data.account === ownerAddress) {
                    const mint_tx = await nft_contract.mint(mintAmount)
                    await mint_tx.wait()
                } else {
                    const totalMintCost = ethers.utils.parseEther(String(info.mintCost * mintAmount), "ether")
                    const mint_tx = await nft_contract.mint(mintAmount, { value: totalMintCost })
                    await mint_tx.wait()
                }
                setLoading(false)
                getInfo()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured, Please Try Again")
                console.log(error)
            }
        }
    }

    const stakeItem = async (id) => {
        console.log([id])
        if (data.network === networksMap[networkDeployedTo]) {
            console.log([id])
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer);

                const approve_tx = await nft_contract.approve(stakingContractAddress, id)
                await approve_tx.wait()

                console.log([id])
                const stake_tx = await staking_contract.stake([id])
                await stake_tx.wait()

                setLoading(false)
                getInfo()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured, Please Try Again")
                console.log(error)
            }
        }
    }

    const unstakeItem = async (id) => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer);

                const unstake_tx = await staking_contract.unstake([id])
                await unstake_tx.wait()

                setLoading(false)
                getInfo()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured, Please Try Again")
                console.log(error)
            }
        }
    }

    const unstakeAll = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer);

                const unstake_tx = await staking_contract.unstake(info.stakedNftIds)
                await unstake_tx.wait()

                setLoading(false)
                getInfo()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured, Please Try Again")
                console.log(error)
            }
        }
    }

    const claim = async () => {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const staking_contract = new ethers.Contract(stakingContractAddress, stakingContract.abi, signer);

                const claim_tx = await staking_contract.claim(info.stakedNftIds)
                await claim_tx.wait()

                setLoading(false)
                getInfo()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured, Please Try Again")
                console.log(error)
            }
        }
    }

    useEffect(() => {
        getInfo()
    }, [data.account])

    return (
        <section>
            <NavBar />
            <br />
            <section className="claim" id="claim">
                <div className="roadmap-container"  >
                    <div className='info-container'>
                        <h3 className='text-center p-2'>Minting Info</h3>
                        <Table responsive>
                            <tbody>
                                <tr>
                                    <td className='p-2'>Total Collection Supply</td>
                                    <td>{info.maxSupply}</td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Minted NFT Count</td>
                                    <td>{info.currentSupply}</td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Mint Cost</td>
                                    <td>{info.mintCost} ETH</td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Max Mint Amount Per TX </td>
                                    <td>{info.maxMintAmountPerTx} </td>
                                </tr>
                            </tbody>
                        </Table >
                    </div>
                    <div className='info-container'>
                        <h3 className='text-center p-2'>Staking Info</h3>
                        <Table responsive>
                            <tbody>
                                <tr>
                                    <td className='p-2'>Your KryptoPunks </td>
                                    <td>[{info.userNftIds.join(" ")}]</td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Items Count</td>
                                    <td>{info.userNftIds.length}</td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Items Staked</td>
                                    <td>[{info.stakedNftIds.join(" ")}]</td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Earned Reward</td>
                                    <td>
                                        {info.totalReward !== 0 ?
                                            parseFloat(info.totalReward).toFixed(6) : 0
                                        }
                                    </td>
                                </tr>
                            </tbody>
                        </Table >
                        <div style={{ textAlign: "center" }} >
                            <button className="btn btn-info m-3" src="" onClick={claim}>
                                {loading ? <CircularProgress color="inherit" size={18} /> : "Claim"}
                            </button>
                            <button className="btn btn-info m-3" src="" onClick={unstakeAll}>
                                {loading ? <CircularProgress color="inherit" size={18} /> : "Unstake All"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="roadmap-container" >
                    <div className='mint-container'>
                        <div className="row" style={{ justifyContent: "center" }}>
                            <div className="col-md-7">
                                <div className="text-center">
                                    <h2 className="minttitle title">
                                        Claim Your KryptoPunk
                                    </h2>
                                    <img src={image1} className="mint-img" alt="" />
                                    <p className="lead" style={{ marginBottom: "30px" }}>A KryptoPunk is a character that is part of an 10000 algorithmically generated collection consisting of extremely unique features ranging from faces, eyes, mouths, skins, hats, and backgrounds.</p>
                                    <div className="form-group" >
                                        <div className="d-flex justify-content-center">
                                            <button type="button"
                                                className="minus btn btn-info rounded-circle"
                                                disabled={mintAmount === 1}
                                                onClick={() => { setMintAmount(mintAmount - 1) }}>-</button>
                                            <input type="number" className="mintnum text-center" readOnly value={mintAmount} />
                                            <button type="button"
                                                className="plus btn btn-info rounded-circle"
                                                disabled={mintAmount === info.maxMintAmountPerTx}
                                                onClick={() => { setMintAmount(mintAmount + 1) }}>+</button>
                                        </div>
                                        <div>
                                            <button className="btn btn-info mt-3" onClick={mint}>
                                                {loading ? <CircularProgress color="inherit" size={18} /> : "MINT"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className='my-items'>
                {userNfts.length !== 0 ? (
                    <>
                        <h2 className="minttitle title text-center">My KryptoPunks</h2>
                        <div className='items container'>
                            {userNfts.map((nft, index) => {
                                return (
                                    <div className='item-box' key={index}>
                                        <img src={nft.uri} className="item-img" />
                                        <div className='text-center'>
                                            {info.stakedNftIds.includes(nft.id) ? (
                                                <button className="btn btn-info m-3" role="button" onClick={() => { unstakeItem(nft.id) }}>
                                                    {loading ? <CircularProgress color="inherit" size={18} /> : "UNSTAKE"}
                                                </button>
                                            ) : (
                                                <button className="btn btn-info m-3" role="button"
                                                    onClick={() => { stakeItem(nft.id) }}>
                                                    {loading ? <CircularProgress color="inherit" size={18} /> : "STAKE"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : null}
            </section>
            <Footer />
        </section>
    )
}

export default MintPage;
