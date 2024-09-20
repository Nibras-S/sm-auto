import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import car1 from '../assets/car1.jpg'
import car2 from '../assets/car2.jpg'
import car3 from '../assets/car3.jpg'

const Carousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <section className="mt-0 w-full"> {/* Remove any top margin */}
      <div className="container mx-0 w-full">
        <Slider {...settings}>
          <div className="relative">
            <img src={car1} alt="Car 1" className="w-full h-64 md:h-96 lg:h-[32rem] object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black bg-opacity-50">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Customize, Upgrade, and Replace</h2>
              <a href="/contact" className="bg-yellow-500 text-black py-2 px-4 rounded-lg hover:bg-yellow-600">Contact Us</a>
            </div>
          </div>

          <div className="relative">
            <img src={car2} alt="Car 2" className="w-full h-64 md:h-96 lg:h-[32rem] object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black bg-opacity-50">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Customize, Upgrade, and Replace</h2>
              <a href="/contact" className="bg-yellow-500 text-black py-2 px-4 rounded-lg hover:bg-yellow-600">Contact Us</a>
            </div>
          </div>

          <div className="relative">
            <img src={car3} alt="Car 3" className="w-full h-64 md:h-96 lg:h-[32rem] object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black bg-opacity-50">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">Customize, Upgrade, and Replace</h2>
              <a href="/contact" className="bg-yellow-500 text-black py-2 px-4 rounded-lg hover:bg-yellow-600">Contact Us</a>
            </div>
          </div>
        </Slider>
      </div>
    </section>
  );
};

export default Carousel;
