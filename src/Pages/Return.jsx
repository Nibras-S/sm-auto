import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

function ReturnsRefunds() {
  return (
    <div>
      <Navbar />
      <main className='bg-white'>
        {/* Hero Section */}
        <section className="bg-cover bg-center h-72 flex items-center justify-center w-full" style={{ backgroundImage: 'url("https://example.com/returns-hero.jpg")' }}>
          <div className="bg-black bg-opacity-50 text-white p-8 text-center rounded-lg w-full">
            <h1 className="text-4xl font-bold mb-2">Returns & Refunds</h1>
            <p className="text-lg mb-0">Learn about our return and refund policies for a smooth shopping experience.</p>
          </div>
        </section>

        {/* Return Policy Section */}
        <section className="w-full py-6 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">Return Policy</h2>
          <p className="text-justify mb-6">
            We want you to be completely satisfied with your purchase. If for any reason you are not happy with your order, you may return the item(s) within 30 days of receiving it for a refund or exchange. To be eligible for a return, the item must be in its original condition and packaging, with all tags attached. Items that have been damaged due to improper use or handling will not be accepted for returns.
          </p>
          <p className="text-justify mb-6">
            If the item(s) you received are incorrect or damaged upon arrival, please notify us within 7 days of receipt, and we will arrange for a replacement or full refund at no additional cost.
          </p>
        </section>

        {/* How to Return an Item Section */}
        <section className="w-full bg-gray-100 py-8 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">How to Return an Item</h2>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-justify">
            To initiate a return, please contact our customer support team with your order number and the reason for the return. We will provide you with detailed instructions on how to return the item(s). Please ensure the item(s) are securely packed to prevent damage during return shipping. Return shipping costs are the responsibility of the customer unless the item arrived damaged or defective. 
          </p>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-justify">
            For local customers in the UAE, we offer a pickup service for a small fee. For international customers, we recommend using a trackable shipping service, as we are not responsible for lost returns.
          </p>
        </section>

        {/* Refunds Section */}
        <section className="w-full py-8 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">Refunds</h2>
          <p className="text-justify mb-6">
            Once we receive your returned item(s), we will inspect the package and notify you via email about the status of your refund. If the return is approved, your refund will be processed and applied to your original payment method within 7-10 business days.
          </p>
          <p className="text-justify mb-6">
            In certain cases, we may deduct a handling or restocking fee (up to 10% of the purchase value) for returns that are not due to errors or defects. This will be communicated to you in advance.
          </p>
        </section>

        {/* Exchanges Section */}
        <section className="w-full bg-gray-100 py-8 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">Exchanges</h2>
          <p className="text-justify mb-6">
            If you need to exchange an item for a different size or color, please contact our customer support team. Exchanges are subject to availability, and any price differences will be communicated to you. Please note that return shipping for the original item is the customer’s responsibility, unless the item arrived damaged or defective.
          </p>
          <p className="text-justify mb-6">
            We will ship your exchange item(s) once we receive and inspect the returned item(s). If the requested item is out of stock, we will issue a full refund or provide store credit.
          </p>
        </section>

        {/* Non-returnable Items Section */}
        <section className="w-full py-8 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">Non-returnable Items</h2>
          <p className="text-justify mb-6">
            Certain items are non-returnable and cannot be refunded or exchanged. These include:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed">
            <li>Gift cards</li>
            <li>Final sale items</li>
            <li>Perishable goods</li>
            <li>Personalized or custom-made items</li>
          </ul>
        </section>

        {/* Contact Us Section */}
        <section className="w-full bg-gray-100 py-8 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">Contact Us</h2>
          <p className="text-center text-lg">
            If you have any questions about our returns and refunds policy, please feel free to contact us at <a href="mailto:contact.smautospares@gmail.com" className="text-blue-500">contact.smautospares@gmail.com</a> or call us at +971-507855298.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ReturnsRefunds;
