import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

function Faqs() {
  return (
    <div>
      <Navbar />
      <main className='bg-white'>
        {/* Hero Section */}
        <section className="bg-cover bg-center h-72 flex items-center justify-center w-full" style={{ backgroundImage: 'url("https://example.com/faqs-hero.jpg")' }}>
          <div className="bg-black bg-opacity-50 text-white p-8 text-center rounded-lg w-full">
            <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-lg mb-0">Find answers to common questions about our services and products.</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-6 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">General Questions</h2>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">1. What types of vehicles do you supply parts for?</h3>
            <p className="text-justify">
              We offer spare parts for a wide range of vehicles, including European and American vehicle auto parts. Our catalog includes components for various makes and models, ensuring you find the right part for your vehicle. If you’re unsure about compatibility, our customer service team is happy to assist you.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">2. How do I know if a part is compatible with my vehicle?</h3>
            <p className="text-justify">
              Each product listing on our website includes detailed specifications, including compatibility information. You can also use our vehicle compatibility checker or contact our customer support team for assistance in verifying that a part is suitable for your specific make and model.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">3. What is your return policy?</h3>
            <p className="text-justify">
              We have a hassle-free return policy. If you’re not satisfied with your purchase, you can return it within 7 days of receipt for a full refund, provided the item is unused and in its original packaging. For more details, please refer to our Returns and Exchanges page.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">4. Do you offer warranties on your products?</h3>
            <p className="text-justify">
              Yes, many of our products come with manufacturer warranties. The duration and terms of the warranty vary by product, so please check the specific item listing for warranty details. If you have questions about a particular product, feel free to contact us.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">5. How can I place an order?</h3>
            <p className="text-justify">
              You can place an order directly through our website by browsing our catalog, selecting the items you want, or you can contact our customer service team to assist you with placing an order over the phone.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">6. What payment methods do you accept?</h3>
            <p className="text-justify">
              We accept a variety of payment methods, including major credit cards and other secure online payment options. All transactions are processed securely to ensure your information is protected.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">7. How long does shipping take?</h3>
            <p className="text-justify">
              Shipping times vary based on your location and the shipping method selected at checkout. We strive to process and ship orders within 1-3 business days. Once your order has shipped, you will receive a tracking number to monitor its progress. For specific shipping options and times, please refer to our Shipping Information page.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">8. Do you offer international shipping?</h3>
            <p className="text-justify">
              Yes, we offer international shipping to select countries. Shipping costs and delivery times may vary based on the destination. For more information, contact our customer service team.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">9. Can I track my order?</h3>
            <p className="text-justify">
              Yes, once your order has been processed and shipped, you will receive a confirmation email containing tracking information. You can use this information to monitor the status of your shipment online.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">10. What should I do if I receive a damaged or incorrect item?</h3>
            <p className="text-justify">
              If you receive a damaged or incorrect item, please contact our customer service team within 48 hours of receiving your order. We will assist you in resolving the issue promptly, whether through a replacement or a refund.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">11. How can I contact customer support?</h3>
            <p className="text-justify">
              You can reach our customer support team by call or WhatsApp at <a href="tel:+971507855298" className="text-blue-500">+971 507 855 298</a>, or by email at <a href="mailto:contact.smautospares@gmail.com" className="text-blue-500">contact.smautospares@gmail.com</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Faqs;
