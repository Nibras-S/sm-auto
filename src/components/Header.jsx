import React, { useEffect, useState } from 'react';

// Function to dynamically import all brand logos
const importAll = (requireContext) => {
  return requireContext.keys().map(requireContext);
};

// Load all images from the BrandLogos folder
const brandLogos = importAll(require.context('../assets/Brands', false, /\.(png|jpe?g|svg)$/));

const Header = () => {
  const [currentLogo, setCurrentLogo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogo(prev => (prev + 1) % brandLogos.length);
    }, 3000); // Change logo every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative text-black py-4">
      <div className="container mx-auto flex justify-center items-center">
        {/* Animated Brand Logos */}
        <div className="relative w-full flex justify-center items-center h-24">
          <img
            src={brandLogos[currentLogo]}
            alt={`Brand Logo ${currentLogo + 1}`} // Dynamic alt text
            className="transition-transform duration-1000 ease-in-out transform scale-75 hover:scale-100 object-cover h-full w-auto max-w-xs" // Adjust max width as needed
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
