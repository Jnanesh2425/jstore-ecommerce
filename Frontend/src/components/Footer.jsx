import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-xs sm:text-sm">
        
        {/* About */}
        <div>
          <h2 className="text-base font-semibold mb-2 text-red-600">About</h2>
          <p className="text-[14px] leading-relaxed">
            This is a MERN stack web application built with React, Node.js,
            MongoDB, and Express. Designed for learning and real-world use.
          </p>
        </div>

        {/* Links */}
        <div>
          <h2 className="text-base font-semibold mb-2 text-red-600">Quick Links</h2>
          <ul className="space-y-1 text-[14px]">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
            <li><a href="/login" className="hover:underline">Login</a></li>
            <li><a href="/sign-up" className="hover:underline">Sign Up</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-base font-semibold mb-2 text-red-600">Contact</h2>
          <ul className="text-[14px] space-y-1">
            <li>Email: jnaneshnr824@gmail.com</li>
            <li>Phone: +91 8105770425</li>
            <li>Location: India</li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h2 className="text-base font-semibold mb-2 text-red-600">Follow Us</h2>
          <div className="flex space-x-4 mt-2 text-xl">
            <a href="https://github.com/Jnanesh2425" target="_blank" rel="noreferrer" className="hover:text-red-600">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-red-600">
              <FaLinkedin />
            </a>
            <a href="mailto:example@email.com" className="hover:text-red-600">
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="bg-gray-200 text-center text-xs text-gray-600 py-3">
        © {new Date().getFullYear()} MERN App. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
