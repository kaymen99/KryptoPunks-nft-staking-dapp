import React from 'react';
import "../assets/styles.css";
import 'bootstrap/dist/css/bootstrap.css';

function Faq() {
    return (
        <div class="faq container" id="FAQ">
            <h1 class="faqhead text-center">
                Frequently asked questions
            </h1>
            <div class="faq-questions">
                <details open="">
                    <summary>What is KryptoPunks?</summary>
                    <div class="faq__content">
                        <p>KryptoPunks is a project within the Polygon blockchain. Based on a collection of NFTs that can be staked to receive KryptoPunk Token rewards.</p>
                    </div>
                </details>
                <details>
                    <summary>When can i buy a kryptoPunk?</summary>
                    <div class="faq__content">
                        <p>The NFTs release date is September 23 at 19:00 UTC. Follow our official channels to find out the latest news.</p>
                    </div>
                </details>
                <details>
                    <summary>What wallet can i use?</summary>
                    <div class="faq__content">
                        <p>We currently only support the Metamask wallet.</p>
                    </div>
                </details>
                <details>
                    <summary>What is the price of nft?</summary>
                    <div class="faq__content"><p>The initial price will be 0.01 Matic for the first 100 nfts. The rest will cost 0.1 Matic.</p>
                    </div>
                </details>
                <details>
                    <summary>Where can I stake my nft?</summary>
                    <div class="faq__content">
                        <p>You can stake your KryptoPunks directly from our app in the mint page where you can als manage your whole wallet of NFTs.</p>
                    </div>
                </details>
            </div>
        </div>
    )
}

export default Faq;
