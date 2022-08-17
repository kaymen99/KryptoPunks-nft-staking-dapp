import React, { useState, useEffect } from "react";
import NavBar from '../components/NavBar';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import { ethers } from "ethers";
import { Form } from "react-bootstrap";
import { CircularProgress } from "@mui/material";

import nftContract from "../artifacts/KryptoPunks.sol/KryptoPunks.json";
import { nftContractAddress, ownerAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Dashboard = () => {
    let navigate = useNavigate();
    const data = useSelector((state) => state.blockchain.value)
    const [appInfo, setAppInfo] = useState({
        nftContractBalance: 0,
        nftContractPaused: 1,
        maxMintAmountPerTx: 5,
        mintCost: 0
    })

    const [loading, setLoading] = useState(false)

    async function getAppInfo() {
        if (data.network === networksMap[networkDeployedTo] & data.account !== "") {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, provider);

            if (ownerAddress !== data.account) {
                navigate("/")
            }

            const balance = await provider.getBalance(nftContractAddress);
            const ispaused = await nft_contract.callStatic.paused()
            const _fee = await nft_contract.callStatic.cost()
            const _maxMintAmount = await nft_contract.callStatic.maxMintAmountPerTx()

            setAppInfo({
                nftContractBalance: Number(ethers.utils.formatUnits(balance, "ether")),
                nftContractPaused: Number(ispaused),
                maxMintAmountPerTx: _maxMintAmount,
                mintCost: Number(ethers.utils.formatUnits(_fee, "ether")),
            })
        } else {
            navigate("/")
        }
    }

    async function changeMintCost() {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                const change_tx = await nft_contract.setCost(
                    ethers.utils.parseEther(String(appInfo.mintCost), "ether")
                )
                await change_tx.wait();
                setLoading(false)
                window.location.reload()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured")
                console.log(error)
            }
        }
    }

    async function changeMintAmount() {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                const change_tx = await nft_contract.setMaxMintAmountPerTx(appInfo.maxMintAmountPerTx)
                await change_tx.wait();
                setLoading(false)
                window.location.reload()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured")
                console.log(error)
            }
        }
    }

    async function withdraw() {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                const withdraw_tx = await nft_contract.withdraw()
                await withdraw_tx.wait();
                setLoading(false)
                window.location.reload()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured")
                console.log(error)
            }
        }
    }

    async function changeContractState() {
        if (data.network === networksMap[networkDeployedTo]) {
            if (appInfo.nftContractPaused == 1) {
                try {
                    setLoading(true)
                    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                    const signer = provider.getSigner()
                    const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                    const unpause_tx = await nft_contract.pause(2)
                    await unpause_tx.wait();
                    setLoading(false)
                    window.location.reload()
                } catch (error) {
                    setLoading(false)
                    window.alert("An error has occured")
                    console.log(error)
                }
            } else {
                try {
                    setLoading(true)
                    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                    const signer = provider.getSigner()
                    const nft_contract = new ethers.Contract(nftContractAddress, nftContract.abi, signer);
                    const pause_tx = await nft_contract.pause(1)
                    await pause_tx.wait();
                    setLoading(false)
                    window.location.reload()
                } catch (error) {
                    setLoading(false)
                    window.alert("An error has occured")
                    console.log(error)
                }
            }

        }
    }

    useEffect(() => {
        if (window.ethereum !== undefined) {
            getAppInfo()
        }
    }, [data.account])


    return (
        <>
            <NavBar />
            <br />
            <div className="dashboard-section">
                <h1 className="text-center" style={{ paddingTop: "30px" }}>
                    Owner Dashboard
                </h1>
                <div className="dashboard-container">
                    <div className="dashboard-content">
                        <div className='dashboard-row' >
                            <div className='dashboard-left'>
                                <label>Current contract balance : {appInfo.nftContractBalance} ETH</label>
                            </div>
                            <div className='dashboard-button-up'>
                                <button className='btn btn-info' onClick={withdraw}>
                                    {loading ? <CircularProgress color="inherit" size={18} /> : "withdraw"}
                                </button>
                            </div>
                        </div>
                        <br />
                        <div className='dashboard-row'>
                            <div className='dashboard-left'>
                                <label>Max NFT minted per transaction : </label>
                                <Form.Control type="Number"
                                    value={appInfo.maxMintAmountPerTx}
                                    onChange={(e) => setAppInfo({ ...appInfo, maxMintAmountPerTx: e.target.value })}
                                />
                            </div>
                            <div className='dashboard-button' >
                                <button className='btn btn-info' onClick={changeMintAmount}>
                                    {loading ? <CircularProgress color="inherit" size={18} /> : "Change"}
                                </button>
                            </div>
                        </div>
                        <br />
                        <div className='dashboard-row'>
                            <div className='dashboard-left'>
                                <label>NFT mint cost (ETH) : </label>
                                <Form.Control type="Number"
                                    value={appInfo.mintCost}
                                    onChange={(e) => setAppInfo({ ...appInfo, mintCost: e.target.value })}
                                />
                            </div>
                            <div className='dashboard-button' >
                                <button className='btn btn-info' onClick={changeMintCost}>
                                    {loading ? <CircularProgress color="inherit" size={18} /> : "Change"}
                                </button>
                            </div>
                        </div>
                        <br />
                        <br />
                        <div className='dashboard-row'>
                            <div className='dashboard-left'>
                                <label>
                                    {appInfo.nftContractPaused == 1 ? (
                                        "Nft Contract is paused"
                                    ) : (
                                        "Nft Contract is active"
                                    )}
                                </label>
                            </div>
                            <div className='dashboard-button-up'>
                                <button className='btn btn-info' onClick={changeContractState}>
                                    {appInfo.nftContractPaused == 1 ? (
                                        loading ? <CircularProgress color="inherit" size={18} /> : "Activate"
                                    ) : (
                                        loading ? <CircularProgress color="inherit" size={18} /> : "Pause"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
