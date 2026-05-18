import React from 'react'
import logo from '/src/assets/logo.png';

const Logo = () => {
    return (
        <div className="flex items-center">
            <img
                src={logo}
                alt="Logo"
                className="w-[190px] md:w-[210px] object-contain"
            />
        </div>
    )
}

export default Logo