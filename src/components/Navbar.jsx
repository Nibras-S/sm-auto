import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logor.png'; // Ensure the path is correct

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // Scroll to the section if there's a hash in the URL
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <nav className="bg-black text-white py-4 px-6">
      <div className="container mx-auto flex justify-between items-center h-16">
        {/* Logo and Brand Name */}
        <div className="flex items-center space-x-4">
          {/* Increase logo size slightly above h-12 with custom size */}
          <img src={logo} alt="Logo" className="h-[7.25rem] w-auto object-contain" />
          <span className="text-xl font-bold">SM AUTO SPARE PARTS</span>
        </div>

        {/* Hamburger Menu for mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white">
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Menu items for desktop */}
        <ul className="hidden md:flex space-x-6">
  <li><Link to="/sm-auto" className="hover:text-blue-300 ">Home</Link></li>
  <li><Link to="/sm-auto/#service" className="hover:text-blue-300">Services</Link></li>
  <li><Link to="/sm-auto/#brands" className="hover:text-blue-300 ">Brands</Link></li>
  <li><Link to="/sm-auto/#products" className="hover:text-blue-300 ">Products</Link></li>
  <li><Link to="/sm-auto/#contact" className="hover:text-blue-300 ">Contact Us</Link></li>
</ul>

      </div>

      {/* Mobile menu (shown only when isOpen is true) */}
      {isOpen && (
        <div className="md:hidden">
          <ul className="bg-gray-800 space-y-4 py-4 text-center">
            <li><Link to="/" className="block text-white">Home</Link></li>
            <li><Link to="/#service" className="block text-white">Services</Link></li>
            <li><Link to="/#brands" className="block text-white">Brands</Link></li>
            <li><Link to="/#products" className="block text-white">Products</Link></li>
            <li><Link to="/#contact" className="block text-white">Contact Us</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
