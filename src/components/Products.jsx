import React from 'react';

// Dynamically import all images from the ProductList folder
const importAll = (requireContext) => {
  return requireContext.keys().map(requireContext);
};

// Load all images from the ProductList folder
const productImages = importAll(require.context('../assets/ProductList', false, /\.(png|jpe?g|svg)$/));

// Function to get the file name without the hash and extension
const getCleanFileName = (filePath) => {
  const fileNameWithExt = filePath.split('/').pop(); // Get the file name with extension
  const fileNameWithoutHash = fileNameWithExt.split('.')[0]; // Remove everything after first dot
  return fileNameWithoutHash; // Return the cleaned name
};

const Products = () => {
  return (
    <section id='products' className="py-4 bg-gray-100">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Products</h2>

        {/* Responsive grid for products */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {productImages.map((imageSrc, index) => {
            // Clean the file name for display
            const cleanFileName = getCleanFileName(imageSrc);

            return (
              <div
                key={index}
                className="bg-white p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center"
              >
                {/* Image container centered */}
                <div className="flex items-center justify-center h-32 w-full">
                  <img src={imageSrc} alt={cleanFileName} className="object-contain max-h-full max-w-full" />
                </div>
                {/* Text centered and aligned consistently */}
                <h3 className="mt-2 text-center text-sm">{cleanFileName}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Products;




// import React from 'react';
// import a1 from '../assets/ProductList/bmwof.jpg'
// import a2 from '../assets/ProductList/bmwof.jpg'
// import a3 from '../assets/ProductList/bmwof.jpg'
// import a4 from '../assets/ProductList/Water Pump Lr.jpg'
// import a5 from '../assets/ProductList/LrAir.jpg'
// import a6 from '../assets/ProductList/lrAcf.jpg'
// import a7 from '../assets/ProductList/landrover.jpg'
// import a8 from '../assets/ProductList/bmwof.jpg'
// import a9 from '../assets/ProductList/bmwof.jpg'
// import a10 from '../assets/ProductList/sparkplug.jpg'
// import a11 from '../assets/ProductList/sp2.jpg'
// import a12 from '../assets/ProductList/bmwof.jpg'

// const DealOfTheDay = () => {
//   return (
//     <section className="py-8 bg-gray-100">
//       <div className="container mx-auto">
//         <h2 className="text-2xl font-bold mb-4">Deal of the Day</h2>

//         {/* Responsive grid for 4 items */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
//           {/* Deal 1 */}
//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src="/placeholder.jpg" alt="Shock Absorber" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Shock Absorber LR087092 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 2,150.00</p>
//           </div>

//           {/* Deal 2 */}
//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src="/placeholder.jpg" alt="Brake Pads" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Brake Pads LR045816 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 550.00</p>
//           </div>

//           {/* Deal 3 */}
//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src="/placeholder.jpg" alt="Fuel Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Fuel Filter LR041978 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 400.00</p>
//           </div>

//           {/* Deal 4 */}
//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src="/placeholder.jpg" alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src="/placeholder.jpg" alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src="/placeholder.jpg" alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a3} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a4} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a5} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a6} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a7} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a8} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>
//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a9} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>
//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a10} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Spark Plug A0041598103 for Mercedes-Benz</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>
//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a11} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Spark Plug 99917013090 for Porsche</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>

//           <div className="bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300">
//             <img src={a12} alt="Air Filter" className="w-full h-32 object-cover" />
//             <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
//             <p className="text-xl text-green-600">AED 110.00</p>
//           </div>
          
//         </div>
//       </div>
//     </section>
//   );
// };

// export default DealOfTheDay;
