import React from 'react';
import "../assets/styles.css";
import image1 from "../assets/img/punk-1.png"
import image2 from "../assets/img/punk-2.png"
import image3 from "../assets/img/punk-3.png"


function Roadmap() {
    return (

        <>
            <h1 className="about-title text-center">Roadmap </h1>
            <section className="roadmap" id='roadmap' >
                <div className="timeline roadmap-container">
                    <div className="entry">
                        <div className="title">
                            <h3>25%</h3>
                        </div>
                        <div className="body">
                            <p>Phase 1</p>
                            <p>Open the minting to the public</p>
                        </div>
                    </div>
                    <div className="entry">
                        <div className="title">
                            <h3>50%</h3>
                        </div>
                        <div className="body">
                            <p>Phase 2</p>
                            <p>Start the KryptoPunks Staking</p>
                        </div>
                    </div>
                    <div className="entry">
                        <div className="title">
                            <h3>75%</h3>
                        </div>
                        <div className="body">
                            <p>Phase 3</p>
                            <p>Create more tokenomics around the KryptoPunks token</p>
                        </div>
                    </div>
                    <div className="entry">
                        <div className="title">
                            <h3>Coming Soon</h3>
                        </div>
                        <div className="body">
                            <p>Phase 4</p>
                            <p>We'll let you guess...</p>
                        </div>
                    </div>

                </div>
                <div className="roadmap-container">
                    <div className='roadmap-imgs'>
                        <div className='roadmap-img'>
                            <img src={image3} className="sliderimg" alt="" />
                        </div>
                        <div className='roadmap-img'>
                            <img src={image2} className="sliderimg" alt="" />
                        </div>
                        <div className='roadmap-img'>
                            <img src={image1} className="sliderimg" alt="" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Roadmap;