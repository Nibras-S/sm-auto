import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ReturnsRefunds = () => {
  return (
      <section className="py-8 px-4 bg-gray-50">
        <Navbar />
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-8">Returns & Refunds</h2>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Return Policy</h3>
          <p className="text-gray-700 leading-relaxed">
            We want you to be completely satisfied with your purchase. If for any reason you are not happy with your order, 
            you may return the item(s) within 30 days of receiving it for a refund or exchange. To be eligible for a return, 
            the item must be in its original condition and packaging, with all tags attached.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">How to Return an Item</h3>
          <p className="text-gray-700 leading-relaxed">
            To initiate a return, please contact our customer support team with your order number and reason for the return. 
            We will provide you with detailed instructions on how to return the item(s). Please note that return shipping costs 
            are the responsibility of the customer unless the item arrived damaged or defective.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Refunds</h3>
          <p className="text-gray-700 leading-relaxed">
            Once we receive your return, we will inspect the item(s) and notify you of the approval or rejection of your refund. 
            If approved, your refund will be processed and a credit will automatically be applied to your original method of payment. 
            Please allow 7-10 business days for the refund to appear in your account.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Exchanges</h3>
          <p className="text-gray-700 leading-relaxed">
            If you need to exchange an item for a different size or color, please contact our customer service. Exchanges are subject 
            to availability, and return shipping for the original item will be the responsibility of the customer.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Non-returnable Items</h3>
          <p className="text-gray-700 leading-relaxed">
            Certain items cannot be returned or exchanged. These include:
          </p>
          <ul className="list-disc list-inside text-gray-700 leading-relaxed">
            <li>Gift cards</li>
            <li>Final sale items</li>
            <li>Perishable goods</li>
            <li>Personalized or custom-made items</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about our returns and refunds policy, please feel free to contact us at smautospares@gmail.com or 
            call us at +971-507855298
          </p>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default ReturnsRefunds;
