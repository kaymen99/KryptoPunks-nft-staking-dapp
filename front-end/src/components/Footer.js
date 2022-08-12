import React from 'react'
import { AiOutlineTwitter, AiOutlineGithub } from "react-icons/ai";
import { RiDiscordFill } from "react-icons/ri";

function Footer() {
    return (
        <div className='footer container'>
            <p>KryptoPunks&#169; All Right Reserved</p>
            <div className='social'>
                <a href='https://github.com/Aymen1001' >
                    <AiOutlineGithub size={24} color="#000" />
                </a>
                <a href='https://github.com/Aymen1001' >
                    <AiOutlineTwitter size={24} color="#000" />
                </a>
                <a href='https://github.com/Aymen1001' >
                    <RiDiscordFill size={24} color="#000" />
                </a>
            </div>
        </div>
    )
}

export default Footer
