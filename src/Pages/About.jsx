import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

function About() {
  return (
    <div>
      <Navbar />
      <main className='bg-white'>
        {/* Hero Section */}
        <section className="bg-cover bg-center h-72 flex items-center justify-center w-full" style={{ backgroundImage: 'url("https://example.com/about-hero.jpg")' }}>
          <div className="bg-black bg-opacity-50 text-white p-8 text-center rounded-lg w-full">
            <h1 className="text-4xl font-bold mb-2">About Us</h1> {/* Reduced margin */}
            <p className="text-lg mb-0">
              Dedicated to delivering premium auto spare parts and services with a commitment to quality.
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="w-full py-6 px-4 md:px-12 lg:px-24"> {/* Reduced padding */}
          <h2 className="text-3xl font-semibold text-center mb-6">Who We Are</h2> {/* Reduced margin */}
          <p className="text-justify mb-6">
            Established in 2024, "smautospareparts" is a trusted supplier of top-quality auto spare parts, committed to serving automotive professionals and individual customers alike. With a vision to lead the industry in reliability, we bring together an experienced team dedicated to ensuring that every product we offer meets the highest standards of performance and durability.
          </p>
          <p className="text-justify">
            At "smautospareparts," we combine innovation, professionalism, and customer service to deliver an unmatched experience. Whether you need parts for maintenance, repair, or customization, we are here to help you every step of the way. Our commitment is to provide reliable, affordable, and premium solutions tailored to meet the unique demands of our customers.
          </p>
        </section>

        {/* Mission Section */}
        <section className="w-full bg-gray-100 py-8 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed">
              To provide high-quality auto spare parts that exceed expectations in durability, performance, and customer service. We aim to lead the market through innovation and a commitment to continuous improvement, ensuring that every customer receives the best possible experience.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="w-full py-8 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold mb-4">Integrity</h3>
              <p>
                We build trust with our customers through honesty, transparency, and a commitment to ethical business practices.
              </p>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold mb-4">Innovation</h3>
              <p>
                Continuously pushing the boundaries to provide the most advanced and reliable auto spare parts on the market.
              </p>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold mb-4">Customer Satisfaction</h3>
              <p>
                Our customers are our priority. We are dedicated to providing excellent service and ensuring complete satisfaction with every purchase.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default About;

