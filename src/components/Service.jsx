import React from 'react';
import engineImg from '../assets/engine.png';
import electricalImg from '../assets/electrical.png';
import steeringImg from '../assets/steering.png';
import transmissionImg from '../assets/transmission.png';
import coolingImg from '../assets/coolingandheating.png';
import airImg from '../assets/airintake.png';
import oil from '../assets/lubri.png';
import brasusImg from '../assets/brasus.png';

const Service = () => {
  return (
    <section id='service' className="py-8 animate-fadeIn">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">Explore Our Trending Auto Spare Parts</h2>
        <p className='text-center text-white mb-6'>
          New to the market, but already trusted! Join our growing list of satisfied customers by choosing from our latest and trending spare parts collection.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Category 1: Engine */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={engineImg} alt="Engine" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Engine</h3>
          </div>

          {/* Category 2: Electrical & Lighting */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={electricalImg} alt="Electrical & Lighting" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Electrical & Lighting</h3>
          </div>

          {/* Category 3: Steering */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={steeringImg} alt="Steering" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Steering</h3>
          </div>

          {/* Category 4: Transmission */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={transmissionImg} alt="Transmission" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Transmission</h3>
          </div>

          {/* Category 5: Cooling & Heating System */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={coolingImg} alt="Cooling & Heating System" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Cooling & Heating System</h3>
          </div>

          {/* Category 6: Engine Oils & Lubricants */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={oil} alt="Engine Oils & Lubricants" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Engine Oils & Lubricants</h3>
          </div>

          {/* Category 7: Brakes & Suspension */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={brasusImg} alt="Brakes & Suspension" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Brakes & Suspension</h3>
          </div>

          {/* Category 8: Fuel & Air Control */}
          <div className="bg-white p-4 shadow-md flex flex-col items-center rounded-lg hover:shadow-lg transition-shadow duration-300">
            <img src={airImg} alt="Fuel & Air Control" className="h-20 w-auto mb-4" />
            <h3 className="text-lg font-bold">Fuel & Air Control</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Service;
