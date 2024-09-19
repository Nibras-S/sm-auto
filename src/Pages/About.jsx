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
        <section className="bg-cover bg-center h-96 flex items-center justify-center" style={{ backgroundImage: 'url("https://example.com/about-hero.jpg")' }}>
          <div className="bg-black bg-opacity-50 text-white p-8 text-center rounded-lg">
            <h1 className="text-4xl font-bold mb-4">About Us</h1>
            <p className="text-lg">
              Dedicated to delivering quality products and services that make a difference in your everyday life.
            </p>
          </div>
        </section>

        {/* About Content */}
        <section className="container mx-auto py-12 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-8">Who We Are</h2>
          <div className="flex flex-col md:flex-row items-center mb-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="https://example.com/team-photo.jpg"
                alt="Our Team"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 md:pl-8 text-justify">
              <h3 className="text-2xl font-semibold mb-4">Our Team</h3>
              <p className="mb-4">
                Founded in 2024, we are a group of passionate professionals with a clear vision: to provide top-quality products and outstanding customer service. With a fresh approach to the market, we aim to address the evolving needs of our customers across various industries.
              </p>
              <p className="mb-4">
                Our goal is to bring innovation and excellence into everything we do, from selecting premium materials to ensuring swift and dependable delivery. We are committed to exceeding expectations and setting new standards in the industry.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-gray-100 py-12 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="max-w-2xl mx-auto text-lg leading-relaxed">
              Our mission is to provide customers with high-quality, innovative products while maintaining a commitment to sustainability and community support. We are driven to make a positive impact through every product and service we offer.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto py-12 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold mb-4">Integrity</h3>
              <p>
                We believe in honest and transparent communication, ensuring that our customers trust us to deliver on our promises.
              </p>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold mb-4">Innovation</h3>
              <p>
                Continuously pushing boundaries to bring new and creative solutions to the market.
              </p>
            </div>
            <div className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-bold mb-4">Customer Satisfaction</h3>
              <p>
                Our customers are at the heart of everything we do, and we work tirelessly to ensure their complete satisfaction.
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
