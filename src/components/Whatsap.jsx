import React from 'react';

const WhatsAppInquiry = () => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200 mt-8">
      {/* Title Section */}
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Get in Touch with Us!
      </h2>
      <p className="text-lg text-gray-600 text-center mb-8">
        We are happy to assist you. Choose your preferred way to contact us!
      </p>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/971507855298?text=${encodeURIComponent("Hello, I have a question about your products.")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center bg-green-500 text-white py-3 rounded-lg shadow-lg hover:bg-green-600 transition duration-300 ease-in-out mb-6"
      >
        <span className="font-semibold">Chat with Us on WhatsApp</span>
      </a>

      {/* Google Form Submission Button */}
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLScfJgnwl3GKxdIHNpxf5Xe0uc7OHYtHflrZ9m7b6frwm4CBkg/viewform?usp=sf_link" // Your Google Form link here
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center bg-blue-500 text-white py-3 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        <span className="font-semibold">Submit Inquiry via Google Form</span>
      </a>
    </div>
  );
};

export default WhatsAppInquiry;
