import React from 'react';

// Dynamically import all PNG images from the Brands folder
const importAll = (requireContext) => {
  return requireContext.keys().map(requireContext);
};

// Load all PNG images from the Brands folder
const brandLogos = importAll(require.context('../assets/Brands', false, /\.(png|jpe?g|svg)$/));

const BrandShowcase = () => {
  return (
    <section id='brands' className="py-8 bg-gray-50">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Brands We Service</h2>
        <p className="mb-8 text-gray-600">
          We provide genuine and high-quality parts for leading automotive brands in the UAE and GCC region.
        </p>

        {/* Brands Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {brandLogos.map((logo, index) => (
            <div key={index} className="flex justify-center">
              <img 
                src={logo} 
                alt={`Brand Logo ${index + 1}`} 
                className="h-16 object-contain transition-transform duration-300 hover:scale-105" 
                onError={(e) => { e.target.src = '../assets/default-logo.png'; }} // Fallback image
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
