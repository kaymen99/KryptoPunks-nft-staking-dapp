import React, { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.css';
import { useDispatch, useSelector } from "react-redux"
import { updateAccountData, disconnect } from "../features/blockchain"
import { ethers, utils } from "ethers"
import { Modal } from "react-bootstrap"
import Web3Modal from "web3modal"

import networks from "../utils/networksMap.json"
import { ownerAddress } from "../utils/contracts-config"


const eth = window.ethereum
let web3Modal = new Web3Modal()

function Connect() {
    const dispatch = useDispatch()
    const data = useSelector((state) => state.blockchain.value)

    const [injectedProvider, setInjectedProvider] = useState();
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
            console.log({
                account: account,
                balance: utils.formatUnits(balance),
                network: networks[String(chainId.chainId)]
            })
        }
        else {
            console.log("Please install metamask")
            window.alert("Please Install Metamask")
        }
    }

    async function Disconnect() {
        web3Modal.clearCachedProvider();
        if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
            await injectedProvider.provider.disconnect();
            setInjectedProvider(null)
        }
        dispatch(disconnect())
        setShow(false)
    }

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

        <>
            {isConnected ? (
                <>
                    <button className="btn btn-secondary m-2 rounded"
                        onClick={handleShow}
                    >
                        {data.account &&
                            `${data.account.slice(0, 6)}...${data.account.slice(
                                data.account.length - 6,
                                data.account.length
                            )}`}
                    </button>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>User</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Account: {data.account}</p>
                            <p>Balance: {data.balance && parseFloat(data.balance).toFixed(4)} ETH</p>
                            <p>Network: {data.network}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            {data.account === ownerAddress ? (
                                <a className='btn btn-secondary mt-3'
                                    href={"/owner-dashboard"}
                                    role="button">
                                    Dashboard
                                </a>
                            ) : null}
                            <button
                                className="btn btn-danger mt-3"
                                onClick={Disconnect}>
                                Disconnect
                            </button>
                        </Modal.Footer>
                    </Modal>
                </>
            ) : (
                <button className="btn btn-secondary m-2 rounded" onClick={fetchAccountData} src="">
                    Connect Wallet
                </button>
            )}
        </>
    )
}

export default Connect;





