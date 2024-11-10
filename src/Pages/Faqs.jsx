<<<<<<< HEAD
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

function Faqs() {
  <Navbar />
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What types of vehicles do you supply parts for?",
      answer:
        "We offer spare parts for a wide range of vehicles, including European and American vehicle auto parts. Our catalog includes components for various makes and models, ensuring you find the right part for your vehicle. If you’re unsure about compatibility, our customer service team is happy to assist you."
    },
    {
      question: "How do I know if a part is compatible with my vehicle?",
      answer:
        "Each product listing on our website includes detailed specifications, including compatibility information. You can also use our vehicle compatibility checker or contact our customer support team for assistance in verifying that a part is suitable for your specific make and model."
    },
    {
      question: "What is your return policy?",
      answer:
        "We have a hassle-free return policy. If you’re not satisfied with your purchase, you can return it within 7 days of receipt for a full refund, provided the item is unused and in its original packaging. For more details, please refer to our Returns and Exchanges page."
    },
    {
      question: "Do you offer warranties on your products?",
      answer:
        "Yes, many of our products come with manufacturer warranties. The duration and terms of the warranty vary by product, so please check the specific item listing for warranty details. If you have questions about a particular product, feel free to contact us."
    },
    {
      question: "How can I place an order?",
      answer:
        "You can place an order directly through our website by browsing our catalog, selecting the items you want, or you can contact our customer service team to assist you with placing an order over the phone."
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept a variety of payment methods, including major credit cards and other secure online payment options. All transactions are processed securely to ensure your information is protected.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Shipping times vary based on your location and the shipping method selected at checkout. We strive to process and ship orders within 1-3 business days. Once your order has shipped, you will receive a tracking number to monitor its progress. For specific shipping options and times, please refer to our Shipping Information page.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we offer international shipping to select countries. Shipping costs and delivery times may vary based on the destination. For more information, contact our customer service team.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes, once your order has been processed and shipped, you will receive a confirmation email containing tracking information. You can use this information to monitor the status of your shipment online.",
    },
    {
      question: "What should I do if I receive a damaged or incorrect item?",
      answer:
        "If you receive a damaged or incorrect item, please contact our customer service team within 48 hours of receiving your order. We will assist you in resolving the issue promptly, whether through a replacement or a refund.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach our customer support team by calling or sending a WhatsApp message to +971 507 855 298.",
    },
    // ... Add more FAQs as needed
  ];

  return (
    <div>
      <main className='bg-white'>
      <Navbar />
        {/* Hero Section */}
        <section
          className="bg-cover bg-center h-72 flex items-center justify-center w-full"
          style={{ backgroundImage: 'url("https://example.com/faqs-hero.jpg")' }}
        >
          <div className="bg-black bg-opacity-50 text-white p-8 text-center rounded-lg w-full">
            <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-lg mb-0">Find answers to common questions about our services and products.</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-6 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">General Questions</h2>

          {faqs.map((faq, index) => (
            <div key={index} className="mb-6 border-b-2 border-gray-200">
              <button
                onClick={() => toggleFaq(index)}
                className="text-2xl font-bold w-full text-left focus:outline-none flex justify-between items-center py-2"
              >
                {faq.question}
                <span>{activeIndex === index ? '-' : '+'}</span>
              </button>
              {activeIndex === index && (
                <p className="text-justify mt-2">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Faqs;
=======
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

function Faqs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What types of vehicles do you supply parts for?",
      answer:
        "We offer spare parts for a wide range of vehicles, including European and American vehicle auto parts. Our catalog includes components for various makes and models, ensuring you find the right part for your vehicle. If you’re unsure about compatibility, our customer service team is happy to assist you."
    },
    {
      question: "How do I know if a part is compatible with my vehicle?",
      answer:
        "Each product listing on our website includes detailed specifications, including compatibility information. You can also use our vehicle compatibility checker or contact our customer support team for assistance in verifying that a part is suitable for your specific make and model."
    },
    {
      question: "What is your return policy?",
      answer:
        "We have a hassle-free return policy. If you’re not satisfied with your purchase, you can return it within 7 days of receipt for a full refund, provided the item is unused and in its original packaging. For more details, please refer to our Returns and Exchanges page."
    },
    {
      question: "Do you offer warranties on your products?",
      answer:
        "Yes, many of our products come with manufacturer warranties. The duration and terms of the warranty vary by product, so please check the specific item listing for warranty details. If you have questions about a particular product, feel free to contact us."
    },
    {
      question: "How can I place an order?",
      answer:
        "You can place an order directly through our website by browsing our catalog, selecting the items you want, or you can contact our customer service team to assist you with placing an order over the phone."
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept a variety of payment methods, including major credit cards and other secure online payment options. All transactions are processed securely to ensure your information is protected.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Shipping times vary based on your location and the shipping method selected at checkout. We strive to process and ship orders within 1-3 business days. Once your order has shipped, you will receive a tracking number to monitor its progress. For specific shipping options and times, please refer to our Shipping Information page.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we offer international shipping to select countries. Shipping costs and delivery times may vary based on the destination. For more information, contact our customer service team.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes, once your order has been processed and shipped, you will receive a confirmation email containing tracking information. You can use this information to monitor the status of your shipment online.",
    },
    {
      question: "What should I do if I receive a damaged or incorrect item?",
      answer:
        "If you receive a damaged or incorrect item, please contact our customer service team within 48 hours of receiving your order. We will assist you in resolving the issue promptly, whether through a replacement or a refund.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "You can reach our customer support team by calling or sending a WhatsApp message to +971 507 855 298.",
    },
    // ... Add more FAQs as needed
  ];

  return (
    <div>
      <main className='bg-white'>
        {/* Hero Section */}
        <section
          className="bg-cover bg-center h-72 flex items-center justify-center w-full"
          style={{ backgroundImage: 'url("https://example.com/faqs-hero.jpg")' }}
        >
          <div className="bg-black bg-opacity-50 text-white p-8 text-center rounded-lg w-full">
            <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-lg mb-0">Find answers to common questions about our services and products.</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-6 px-4 md:px-12 lg:px-24">
          <h2 className="text-3xl font-semibold text-center mb-6">General Questions</h2>

          {faqs.map((faq, index) => (
            <div key={index} className="mb-6 border-b-2 border-gray-200">
              <button
                onClick={() => toggleFaq(index)}
                className="text-2xl font-bold w-full text-left focus:outline-none flex justify-between items-center py-2"
              >
                {faq.question}
                <span>{activeIndex === index ? '-' : '+'}</span>
              </button>
              {activeIndex === index && (
                <p className="text-justify mt-2">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Faqs;
>>>>>>> 839682665e3f1953f07aadcd67d80a2420445d19
