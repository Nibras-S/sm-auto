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
        <div className="relative w-full flex justify-center items-center h-24"> {/* Adjust height */}
          <img
            src={brandLogos[currentLogo]}
            alt="Brand Logo"
            className="transition-transform duration-1000 ease-in-out transform scale-50 hover:scale-75 object-cover h-full w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
