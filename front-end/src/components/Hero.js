import React from 'react';
import "../assets/styles.css";
import NavBar from './NavBar';
import { AiOutlineGithub } from "react-icons/ai";

function Hero() {
    return (
        <section className='hero'>
            <NavBar />
            <div class="caption">
                <div class="caption-inner">
                    <a href="/mint-page" class="">
                        <button class="btn btn-warning">
                            Move to Mint Section
                        </button>
                    </a>
                    <a href="https://github.com/Aymen1001/NFT-Staking-dapp.git" target="_blank"
                        rel="noreferrer">
                        <button class="btn btn-info">
                            Github
                            <AiOutlineGithub size={25} />
                        </button>
                    </a>
                </div>
            </div>
        </section>
    )
}

export default Hero