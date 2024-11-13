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
  const fileNameWithoutHash = fileNameWithExt.split('.')[0]; // Remove everything after the first dot
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
