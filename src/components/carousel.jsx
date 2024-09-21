import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import car1 from '../assets/car1.jpg';
import car2 from '../assets/car2.jpg';
import car3 from '../assets/car3.jpg';

const carouselItems = [
  { img: car1, text: "Customize, Upgrade, and Replace" },
  { img: car2, text: "Enhance Your Vehicle's Performance" },
  { img: car3, text: "Quality Parts for Every Need" },
];

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

  const whatsappLink = "https://wa.me/+971507855298?text=Hello!%20I%20am%20interested%20in%20auto%20spare%20parts%20from%20smautospareparts.%20Can%20you%20please%20provide%20more%20information?";

  return (
    <section className="mt-0 w-full overflow-hidden"> {/* Added overflow-hidden */}
      <div className="container mx-auto w-full"> {/* Changed mx-0 to mx-auto */}
        <Slider {...settings}>
          {carouselItems.map((item, index) => (
            <div key={index} className="relative">
              <img src={item.img} alt={`Slide ${index + 1} - ${item.text}`} className="w-full h-64 md:h-96 lg:h-[32rem] object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white bg-black bg-opacity-50">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{item.text}</h2>
                <a href={whatsappLink} className="bg-yellow-500 text-black py-2 px-4 rounded-lg hover:bg-yellow-600">Contact Now</a>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Carousel;
