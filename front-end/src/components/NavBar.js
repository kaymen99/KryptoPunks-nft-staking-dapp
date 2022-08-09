import React, { useState, useEffect } from 'react'
import "../assets/styles.css";
import menu from "../assets/img/menu.png"
import close from "../assets/img/cancel.png"

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"
import { updateAccountData, disconnect } from "../features/blockchain"
import { ethers, utils } from "ethers";
import Web3Modal from "web3modal"

import networks from "../utils/networksMap.json"



const eth = window.ethereum
let web3Modal = new Web3Modal()

function NavBar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const data = useSelector((state) => state.blockchain.value)

    const [isNavExpanded, setIsNavExpanded] = useState(false)

    const [injectedProvider, setInjectedProvider] = useState();
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [color, setColor] = useState(false)
    const changeColor = () => {
        if (window.scrollY >= 100) {
            setColor(true)
        } else {
            setColor(false)
        }
    }
    window.addEventListener("scroll", changeColor)

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

    async function Disconnect() {
        web3Modal.clearCachedProvider();
        if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
            await injectedProvider.provider.disconnect();
            setInjectedProvider(null)
        }
        dispatch(disconnect())
        setShow(false)
        navigate("/")
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
        <header class="header">
            <div class="brand">
                <a href="/" class="brand-logo">
                    KryptoPunks
                </a>
                <div class="nav-burger" id="nav-burger">
                    <img src={menu} alt="Menu" onClick={() => {
                        setIsNavExpanded(true);
                    }} />
                </div>
            </div>
            <nav className={isNavExpanded ? "nav-custom open-menu" : "nav-custom is-active"} >
                <div className={isNavExpanded ? "nav-cancel" : "nav-cancel is-active"}>
                    <img src={close} onClick={() => {
                        setIsNavExpanded(false);
                    }} alt="Cancel" />
                </div>
                <div className='nav-links_div'>
                    <a href="/" class="nav-link_ref">Home</a>
                    <a href="/mint-page" class="nav-link_ref">Mint</a>
                    <a href="/#about" class="nav-link_ref">About</a>
                    <a href="/#roadmap" class="nav-link_ref">Roadmap</a>
                </div>
            </nav>
        </header>
    );
}


export default NavBar





