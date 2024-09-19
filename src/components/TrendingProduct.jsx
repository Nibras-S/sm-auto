import React from 'react';
import landRover from '../assets/ProductList/landrover.jpg';
import lrAf from '../assets/ProductList/Air Filter LR011593 for Land Rover.jpg'; // lraf - Land Rover Air Filter
import lrAcf from '../assets/ProductList/AC Filter LR036369 for Land Rover.jpg'; // lr ac - AC Filter
import lrwp from '../assets/ProductList/Water Pump Lr.jpg'; // Water Pump LR
import bmwof from '../assets/ProductList/Oil Filter 11427953129 for BMW.jpg'; // BMW Oil Filter
import './scroll.css'

const TrendingProducts = () => {
  return (
    <section className="py-8"> 
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Trending Products</h2>
        
        {/* Horizontal scrolling container with hidden scrollbar */}
        <div className="flex space-x-6 overflow-x-scroll hide-scrollbar p-4">
          
          {/* Product card 1 */}
          <div className="bg-white p-4 shadow-md min-w-[250px] hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105">
            <img src={landRover} alt="Oil Filter" className="w-full h-32 object-contain" />
            <h3 className="mt-4">Oil Filter LR011279 for Land Rover</h3>
          </div>
          
          {/* Product card 2 */}
          <div className="bg-white p-4 shadow-md min-w-[250px] hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105">
            <img src={lrAf} alt="Air Filter" className="w-full h-32 object-contain" />
            <h3 className="mt-4">Air Filter LR011593 for Land Rover</h3>
          </div>

          {/* Product card 3 */}
          <div className="bg-white p-4 shadow-md min-w-[250px] hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105">
            <img src={lrAcf} alt="AC Filter" className="w-full h-32 object-contain" />
            <h3 className="mt-4">AC Filter LR036369 for Land Rover</h3>
          </div>
          
          {/* Product card 4 */}
          <div className="bg-white p-4 shadow-md min-w-[250px] hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105">
            <img src={lrwp} alt="Water Pump" className="w-full h-32 object-contain" />
            <h3 className="mt-4">Water Pump LR097165 for Land Rover</h3>
          </div>

          {/* Product card 5 */}
          <div className="bg-white p-4 shadow-md min-w-[250px] hover:shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105">
            <img src={bmwof} alt="BMW Oil Filter" className="w-full h-32 object-contain" />
            <h3 className="mt-4">Oil Filter 11427953129 for BMW</h3>
          </div>
          
          {/* Add more product cards as needed */}
          
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
