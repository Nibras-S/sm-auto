import React, { useState } from 'react';
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
                className="text-xl font-semibold w-full text-left focus:outline-none flex justify-between items-center py-2" // Smaller question text
              >
                {faq.question}
                <span>{activeIndex === index ? '-' : '+'}</span>
              </button>
              {activeIndex === index && (
                <p className="text-sm mt-2"> {/* Smaller answer text */}
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
