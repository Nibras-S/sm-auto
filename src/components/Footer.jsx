import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id='contact' className="bg-gray-900 text-white py-8 px-4 md:px-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* About Us Section */}
        <div className="space-y-4 md:pl-6">
          <h4 className="text-lg font-bold">About SM Auto Spare Parts</h4>
          <p className="text-sm">
            SM Auto Spare Parts Trading LLC is your trusted partner for genuine and aftermarket auto parts, specializing in servicing the UAE and GCC countries. From premium car filters to durable engine components, we ensure quality at competitive prices.
          </p>
        </div>

        {/* Useful Links Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Useful Links</h4>
          <ul className="space-y-2">
            <li><Link to='/aboutus' className="hover:underline">About Us</Link></li>
<<<<<<< HEAD
            {/* <li><a href="#shop" className="hover:underline">Shop Now</a></li> */}
            <li><a href="#shipping" className="hover:underline">Shipping & Delivery</a></li>
            <li><Link to="/returns" className="hover:underline">Returns & Refunds</Link></li>
            <li><a href="/faqs" className="hover:underline">FAQs</a></li>
=======
            <li><a href="#shipping" className="hover:underline">Shipping & Delivery</a></li>
            <li><Link to="/returns" className="hover:underline">Returns & Refunds</Link></li>
>>>>>>> 839682665e3f1953f07aadcd67d80a2420445d19
          </ul>
        </div>

        {/* Contact Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold">Contact Us</h4>
          <p className="text-sm">For any inquiries, feel free to reach us at:</p>
          <ul className="space-y-2">
            <li>Email: <a href="mailto:contact.smautospares@gmail.com" className="hover:underline">contact.smautospares@gmail.com</a></li>
            <li>Phone: <a href="tel:+971-507855298" className="hover:underline">+971-507855298</a></li>
            <li>Address: Dubai, UAE</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-700 mt-6 pt-6 text-center md:text-left">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-16">
          <p>&copy; SM Auto Spare Parts Trading LLC 2024. All rights reserved.</p>
          <ul className="flex space-x-4 mt-4 md:mt-0">
            <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#terms" className="hover:underline">Terms of Use</a></li>
            <li><a href="#contact" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

