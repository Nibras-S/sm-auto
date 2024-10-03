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

  const handleLinkClick = () => {
    if (isOpen) setIsOpen(false); // Close the menu on link click
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
          <img src={logo} alt="Logo" className="h-[7.25rem] w-auto object-contain" />
          <span className="text-xl font-bold">SM AUTO SPARE PARTS</span>
        </div>

        {/* Hamburger Menu for mobile */}
        <div className="md:hidden">
          <button onClick={toggleMenu} aria-label="Toggle Menu" className="text-white">
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Menu items for desktop */}
        <ul className="hidden md:flex space-x-6">
<<<<<<< HEAD
          <li><Link to="/" className="hover:text-blue-300">Home</Link></li>
          <li><Link to="/#service" className="hover:text-blue-300">Services</Link></li>
          <li><Link to="/#brands" className="hover:text-blue-300">Brands</Link></li>
          <li><Link to="/#products" className="hover:text-blue-300">Products</Link></li>
          <li><Link to="/#contact" className="hover:text-blue-300">Contact Us</Link></li>
        </ul>
=======
  <li><Link to="/" className="hover:text-blue-300 ">Home</Link></li>
  <li><Link to="/#service" className="hover:text-blue-300">Services</Link></li>
  <li><Link to="/#brands" className="hover:text-blue-300 ">Brands</Link></li>
  <li><Link to="/#products" className="hover:text-blue-300 ">Products</Link></li>
  <li><Link to="/#contact" className="hover:text-blue-300 ">Contact Us</Link></li>
</ul>

>>>>>>> d4143bd21938c599e99e4b4865349ab76ed82cfd
      </div>

      {/* Mobile menu (shown only when isOpen is true) */}
      {isOpen && (
        <div className="md:hidden">
          <ul className="bg-gray-800 space-y-4 py-4 text-center">
<<<<<<< HEAD
            <li><Link to="/" onClick={handleLinkClick} className="block text-white">Home</Link></li>
            <li><Link to="/#service" onClick={handleLinkClick} className="block text-white">Services</Link></li>
            <li><Link to="/#brands" onClick={handleLinkClick} className="block text-white">Brands</Link></li>
            <li><Link to="/#products" onClick={handleLinkClick} className="block text-white">Products</Link></li>
            <li><Link to="/#contact" onClick={handleLinkClick} className="block text-white">Contact Us</Link></li>
=======
            <li><Link to="/" className="block text-white">Home</Link></li>
            <li><Link to="/#service" className="block text-white">Services</Link></li>
            <li><Link to="/#brands" className="block text-white">Brands</Link></li>
            <li><Link to="/#products" className="block text-white">Products</Link></li>
            <li><Link to="/#contact" className="block text-white">Contact Us</Link></li>
>>>>>>> d4143bd21938c599e99e4b4865349ab76ed82cfd
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
