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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-center">
          {brandLogos.map((logo, index) => (
            <div key={index} className="flex justify-center">
              <img src={logo} alt={`Brand ${index}`} className="h-16 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;




// import React from 'react';

// // Import brand logos (example placeholders, replace with actual logos)
// import toyotaLogo from '../assets/Brands/Bentley.png';
// import fordLogo from '../assets/Brands/Benz.png';
// import bmwLogo from '../assets/Brands/BMW.png';
// import mercedesLogo from '../assets/Brands/Ferrari.png';
// import nissanLogo from '../assets/Brands/VW.png';
// import lRLogo from '../assets/Brands/lr.png';
// import mcLogo from '../assets/Brands/mLlogo.png';
// import audiLogo from '../assets/Brands/audiLogo.png';
// import astonMarLogo from '../assets/Brands/AstonMartin.png';
// import porscheLogo from '../assets/Brands/porsche.png';
// import dodgeLogo from '../assets/Brands/dodge.png';
// import porscheLogo from '../assets/Brands/porsche.png';

// const BrandShowcase = () => {
//   return (
//     <section className="py-8 bg-gray-50">
//       <div className="container mx-auto text-center">
//         <h2 className="text-2xl font-bold mb-6">Brands We Service</h2>
//         <p className="mb-8 text-gray-600">
//           We provide genuine and high-quality parts for leading automotive brands in the UAE and GCC region.
//         </p>

//         {/* Brands Container */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-center">
//           {/* Replace these with your actual brand logos */}
//           <div className="flex justify-center">
//             <img src={toyotaLogo} alt="Toyota" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={fordLogo} alt="Ford" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={bmwLogo} alt="BMW" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={mercedesLogo} alt="Mercedes-Benz" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={nissanLogo} alt="Nissan" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={lRLogo} alt="Nissan" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={mcLogo} alt="Nissan" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={audiLogo} alt="Nissan" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={astonMarLogo} alt="Nissan" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={porscheLogo} alt="Nissan" className="h-16 object-contain" />
//           </div>
//           <div className="flex justify-center">
//             <img src={nissanLogo} alt="Nissan" className="h-16 object-contain" />
//           </div>

//           {/* Add more brands as needed */}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BrandShowcase;
