import React from "react";
import "../assets/styles.css";
import Hero from "../components/Hero";
import About from "../components/About";
import Roadmap from "../components/Roadmap";
import Footer from "../components/Footer";

const Home = () => {
    return (
        <div className="home">
            <Hero />
            <About />
            <Roadmap />
            <Footer />
        </div>
    )
};

export default Home;