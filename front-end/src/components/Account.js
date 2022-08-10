import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { updateAccountData, disconnect } from "../features/blockchain"
import { ethers, utils } from "ethers"
import Web3Modal from "web3modal"

import networks from "../utils/networksMap.json"


const eth = window.ethereum
let web3Modal = new Web3Modal()

function Account({ mint }) {
    const dispatch = useDispatch()
    const data = useSelector((state) => state.blockchain.value)

    const [injectedProvider, setInjectedProvider] = useState();

    async function fetchAccountData() {
        if (typeof window.ethereum !== 'undefined') {
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)

            setInjectedProvider(provider);

            const signer = provider.getSigner()
            const chainId = await provider.getNetwork()
            const account = await signer.getAddress()
            const balance = await signer.getBalance()

            dispatch(updateAccountData(
                {
                    account: account,
                    balance: utils.formatUnits(balance),
                    network: networks[String(chainId.chainId)]
                }
            ))
        }
        else {
            console.log("Please install metamask")
            window.alert("Please Install Metamask")
        }
    }

    // async function Disconnect() {
    //     web3Modal.clearCachedProvider();
    //     if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
    //         await injectedProvider.provider.disconnect();
    //         setInjectedProvider(null)
    //     }
    //     dispatch(disconnect())
    // }

    useEffect(() => {
        if (eth) {
            eth.on('chainChanged', (chainId) => {
                fetchAccountData()
            })
            eth.on('accountsChanged', (accounts) => {
                fetchAccountData()
            })
        }
    }, [])

    const isConnected = data.account !== ""

    return (

        <div>
            {isConnected ? (
                <>
                    <button className="btn btn-info mt-3" onClick={mint} src="">
                        MINT
                    </button>
                </>
            ) : (
                <button className="btn btn-info mt-3" onClick={fetchAccountData} src="">
                    CONNECT WALLET
                </button>
            )}
        </div>
    )
}

export default Account;
