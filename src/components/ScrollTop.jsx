import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi'; // Icon for the arrow

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down 300px
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll the page to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // This will make the scrolling smooth
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={scrollToTop}
            className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300"
          >
            <FiArrowUp size={24} />
          </button>
        </div>
      )}
    </>
  );
};

export default ScrollToTop;
