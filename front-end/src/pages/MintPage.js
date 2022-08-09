import React from 'react';
import "../assets/styles.css";
import image1 from "../assets/img/mint-punk.png";
import NavBar from '../components/NavBar';
import { Table } from "react-bootstrap"

function MintPage() {
    return (
        <section>
            <NavBar />
            <br />
            <section className="claim" id="claim">
                <div className="roadmap-container"  >
                    <div style={{ width: "80%", paddingLeft: "15%" }}>
                        <h3 className='text-center p-2'>Staking Info</h3>
                        <Table responsive>
                            <tbody>
                                <tr>
                                    <td className='p-2'>Items Count</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Items Staked</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td className='p-2'>Earned Reward</td>
                                    <td></td>
                                </tr>
                            </tbody>

                        </Table >
                    </div>
                </div>
                <div className="roadmap-container" >
                    <div className='mint-container'>
                        <div class="row" style={{ justifyContent: "center" }}>
                            <div class="col-md-7">
                                <div class="text-center">
                                    <h2 class="minttitle title">
                                        Claim Your KryptoPunk
                                    </h2>
                                    <img src={image1} className="sliderimg" alt="" />
                                    <p class="lead " data-aos-delay="600" style={{ marginBottom: "30px" }}>A KryptoPunk is a character that is part of an 10000 algorithmically generated collection consisting of extremely unique features ranging from faces, eyes, mouths, skins, hats, and backgrounds.</p>
                                    <div class="form-group " >
                                        <div class="d-flex justify-content-center">
                                            <button type="button" class="minusbtn minus btn btn-info rounded-circle">-</button>
                                            <input type="number" class="mintnum text-center" readonly="" value="1" />
                                            <button type="button" class="minusbtn plus btn btn-info rounded-circle">+</button>
                                        </div>
                                        <p class="lead aos-init aos-animate" data-aos="fade-up" data-aos-delay="600" style={{ margin: "30px 0px -10px" }}>
                                            Cost: 0.08 eth
                                            <br />
                                            Max Mint: 8
                                        </p>
                                        <div>
                                            <button class="btn btn-info mt-5" src="">
                                                CONNECT WALLET
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </section>
    )
}

export default MintPage