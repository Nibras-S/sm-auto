import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageSquare, FiX, FiSend } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { waLink } from "../../utils/whatsapp";
import { submitLead } from "../../lib/crmApi";

const QUICK_BRANDS = ["BMW", "Mercedes", "Porsche", "Audi", "Land Rover", "Toyota", "Nissan"];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0: Brand, 1: Model, 2: Year, 3: Part, 4: Phone, 5: Notes, 6: Summary

  const [data, setData] = useState({
    brand: "",
    model: "",
    year: "",
    part: "",
    phone: "",
    notes: "",
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! Welcome to SpareMec 👋. I am your personal parts assistant.",
    },
    {
      id: 2,
      sender: "ai",
      text: "I can help you find high-quality spare parts in seconds. Let's start with your car's brand. What is it?",
    },
  ]);

  const messagesEndRef = useRef(null);
  const leadSentRef = useRef(false);

  // When the chatbot reaches its summary step, create a CRM lead.
  useEffect(() => {
    if (currentStep === 6 && !leadSentRef.current) {
      leadSentRef.current = true;
      submitLead({
        name: "Website Chatbot",
        phone: data.phone || undefined,
        vehicleBrand: data.brand || undefined,
        vehicleModel: data.model || undefined,
        vehicleYear: data.year ? Number(data.year) : undefined,
        requiredPart: data.part || undefined,
        notes: data.notes || undefined,
      }).catch(() => {});
      setMessages((m) => [
        ...m,
        { id: Date.now(), sender: "ai", text: "Thank you. Our sales team will contact you within 1 hour." },
      ]);
    }
  }, [currentStep, data]);

  // Auto-open chatbot on first load after a short delay
  useEffect(() => {
    const hasOpened = sessionStorage.getItem("hasOpenedChatbot");
    if (!hasOpened) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("hasOpenedChatbot", "true");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { id: Date.now(), sender, text }]);
  };

  const handleNextStep = (userInput) => {
    if (!userInput.trim()) return;

    // Add user message
    addMessage("user", userInput);

    // Update form data state
    let nextStep = currentStep + 1;
    let updatedData = { ...data };

    if (currentStep === 0) {
      updatedData.brand = userInput;
    } else if (currentStep === 1) {
      updatedData.model = userInput;
    } else if (currentStep === 2) {
      updatedData.year = userInput;
    } else if (currentStep === 3) {
      updatedData.part = userInput;
    } else if (currentStep === 4) {
      updatedData.phone = userInput;
    } else if (currentStep === 5) {
      updatedData.notes = userInput;
    }

    setData(updatedData);
    setInputValue("");
    setCurrentStep(nextStep);

    // Trigger AI response with realistic typing animation delay
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (nextStep === 1) {
        addMessage("ai", `Got it, ${updatedData.brand}! What is the car model? (e.g. X5, C-Class, Cayenne...)`);
      } else if (nextStep === 2) {
        addMessage("ai", `Perfect. What is the manufacturing year of your ${updatedData.brand} ${updatedData.model}?`);
      } else if (nextStep === 3) {
        addMessage("ai", `Excellent. Now, what spare part do you need? (e.g. Front Brake Pads, Radiator, Alternator...)`);
      } else if (nextStep === 4) {
        addMessage(
          "ai",
          `Almost there! Please enter your WhatsApp number (with country code) so our team can send you the price and availability quote instantly.`
        );
      } else if (nextStep === 5) {
        addMessage(
          "ai",
          `Do you have any additional details or specific requirements (e.g. VIN number, OEM vs Aftermarket preferences, Chassis No)? Feel free to type them below, or type 'No' to skip.`
        );
      } else if (nextStep === 6) {
        addMessage("ai", `Outstanding! I've summarized your inquiry below.`);
        addMessage(
          "ai",
          `Click the button below to submit this request directly to our team via WhatsApp to get your instant quote!`
        );
      }
    }, 1200);
  };

  const handleSkipNotes = () => {
    if (currentStep !== 5) return;
    addMessage("user", "No specific details");
    
    let updatedData = { ...data, notes: "None" };
    setData(updatedData);
    setCurrentStep(6);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", `Outstanding! I've summarized your inquiry below.`);
      addMessage(
        "ai",
        `Click the button below to submit this request directly to our team via WhatsApp to get your instant quote!`
      );
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleNextStep(inputValue);
  };

  const handleQuickSelect = (brandName) => {
    if (currentStep !== 0) return;
    handleNextStep(brandName);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 1,
        sender: "ai",
        text: "Hello! Welcome to SpareMec 👋. I am your personal parts assistant.",
      },
      {
        id: 2,
        sender: "ai",
        text: "I can help you find high-quality spare parts in seconds. Let's start with your car's brand. What is it?",
      },
    ]);
    setData({
      brand: "",
      model: "",
      year: "",
      part: "",
      phone: "",
      notes: "",
    });
    setCurrentStep(0);
    setInputValue("");
    setIsTyping(false);
  };

  const buildWhatsAppMessage = () => {
    const lines = [
      `Hello SpareMec 👋, I'd like to get a quote for a spare part:`,
      "",
      `• *Vehicle Brand:* ${data.brand}`,
      `• *Model:* ${data.model}`,
      `• *Year:* ${data.year}`,
      `• *Part Required:* ${data.part}`,
      `• *WhatsApp Number:* ${data.phone}`,
      data.notes && data.notes !== "None" ? `• *Additional Details:* ${data.notes}` : "",
      "",
      `Could you please confirm availability and pricing? Thank you!`,
    ].filter(Boolean);
    return lines.join("\n");
  };

  const handleOpenWhatsApp = () => {
    const message = buildWhatsAppMessage();
    const link = waLink(message);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Floating Chat Trigger Button Container with Hover Tooltip */}
      <div className="fixed bottom-[88px] right-6 z-40 group flex items-center justify-end">
        {/* Tooltip */}
        <span className="pointer-events-none absolute right-17 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:inline-flex items-center gap-1.5 bg-neutral-950/90 border border-white/[0.08] text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E2F314] animate-pulse" />
          MecAssist AI • Find Parts in 60s
        </span>

        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Open chat assistant"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-950 border border-white/10 hover:border-[#E2F314] text-white hover:text-[#E2F314] shadow-2xl hover:shadow-[0_8px_28px_rgba(226,243,20,0.18)] transition-all duration-300 active:scale-95 shrink-0"
        >
          <span className="relative flex items-center justify-center">
            <FiMessageSquare size={24} className="group-hover:rotate-6 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2F314] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E2F314]" />
            </span>
          </span>
        </button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] sm:w-[400px] max-w-[90vw] h-[540px] bg-neutral-950/95 border border-white/[0.08] rounded-[2.25rem] shadow-[0_24px_64px_-16px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-white backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06] bg-neutral-900/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center shadow-inner">
                  <FiMessageSquare className="text-[#E2F314] w-4.5 h-4.5" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-neutral-950" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-display text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                    MecAssist AI
                    <span className="text-[8px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-[#E2F314]/10 text-[#E2F314] border border-[#E2F314]/20">parts expert</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">Online • Responds Instantly</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handleResetChat}
                    className="text-[10px] text-neutral-400 hover:text-white px-2.5 py-1 rounded-md bg-white/5 transition-colors font-bold"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Chat Body (Scrollable Messages Area) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-4 text-xs leading-relaxed transition-all duration-300 ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-[#E2F314] to-[#CBE00B] text-neutral-950 font-bold rounded-[1.25rem] rounded-tr-none shadow-[0_4px_16px_rgba(226,243,20,0.15)]"
                        : "bg-neutral-900/60 text-neutral-200 border border-white/[0.04] rounded-[1.25rem] rounded-tl-none text-left"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Quick Options for Brand Selection */}
              {currentStep === 0 && !isTyping && (
                <div className="flex flex-wrap gap-2 pt-2 animate-fadeIn">
                  {QUICK_BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => handleQuickSelect(brand)}
                      className="text-[11px] font-bold bg-neutral-900/50 hover:bg-[#E2F314] text-neutral-300 hover:text-neutral-950 border border-white/[0.08] hover:border-transparent px-3.5 py-2 rounded-full transition-all duration-300 backdrop-blur-sm shadow-sm"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-900/60 border border-white/[0.04] rounded-[1.25rem] rounded-tl-none p-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#E2F314] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#E2F314] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-[#E2F314] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Inquiry Summary Form Card (Diagnostic Sheet Layout) */}
              {currentStep === 6 && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-900/40 border border-white/[0.08] rounded-[1.5rem] p-5 space-y-4 text-left animate-fadeIn backdrop-blur-md shadow-inner"
                >
                  <div className="border-b border-white/[0.06] pb-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black text-[#E2F314] tracking-wider">Parts Spec Sheet</span>
                    <span className="text-[9px] uppercase font-semibold text-neutral-500">Ready to Query</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-[11px]">
                    <div className="bg-neutral-900/40 p-2.5 rounded-xl border border-white/[0.02]">
                      <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mb-0.5">Brand:</span>
                      <span className="font-bold text-white text-[12px]">{data.brand}</span>
                    </div>
                    <div className="bg-neutral-900/40 p-2.5 rounded-xl border border-white/[0.02]">
                      <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mb-0.5">Model:</span>
                      <span className="font-bold text-white text-[12px]">{data.model}</span>
                    </div>
                    <div className="bg-neutral-900/40 p-2.5 rounded-xl border border-white/[0.02]">
                      <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mb-0.5">Year:</span>
                      <span className="font-bold text-white text-[12px]">{data.year}</span>
                    </div>
                    <div className="bg-neutral-900/40 p-2.5 rounded-xl border border-white/[0.02]">
                      <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mb-0.5">Part Needed:</span>
                      <span className="font-bold text-[#E2F314] text-[12px]">{data.part}</span>
                    </div>
                    <div className="col-span-2 bg-neutral-900/40 p-2.5 rounded-xl border border-white/[0.02]">
                      <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mb-0.5">WhatsApp Contact:</span>
                      <span className="font-bold text-white text-[12px]">{data.phone}</span>
                    </div>
                    {data.notes && data.notes !== "None" && (
                      <div className="col-span-2 bg-neutral-900/40 p-2.5 rounded-xl border border-white/[0.02]">
                        <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider mb-0.5">Additional Details:</span>
                        <span className="font-bold text-neutral-300 text-[11px] leading-relaxed">{data.notes}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleOpenWhatsApp}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#20ba59] hover:shadow-[0_12px_28px_rgba(37,211,102,0.25)] text-white font-bold py-3.5 px-4 rounded-[1.25rem] text-xs transition-all duration-300 mt-2 transform hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-[#25D366]/10"
                  >
                    <FaWhatsapp size={16} />
                    Send Quote Request
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            {currentStep < 6 && (
              <div className="p-4 bg-neutral-900/40 border-t border-white/[0.06] backdrop-blur-md">
                <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                  <input
                    type={currentStep === 4 ? "tel" : "text"}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      currentStep === 0
                        ? "Enter vehicle brand..."
                        : currentStep === 1
                        ? "Enter model..."
                        : currentStep === 2
                        ? "Enter manufacturing year..."
                        : currentStep === 3
                        ? "Enter required part name..."
                        : currentStep === 4
                        ? "Enter WhatsApp number..."
                        : "Enter details (VIN, OEM...)"
                    }
                    className="w-full rounded-full bg-neutral-900 border border-white/[0.08] px-5 pr-12 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E2F314]/30 transition-colors h-[44px] shadow-inner"
                  />
                  
                  {currentStep === 5 && (
                    <button
                      type="button"
                      onClick={handleSkipNotes}
                      className="absolute right-14 top-1/2 -translate-y-1/2 text-[10px] text-[#E2F314] hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors font-bold"
                    >
                      Skip
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[32px] h-[32px] inline-flex items-center justify-center rounded-full bg-[#E2F314] disabled:bg-neutral-800 text-neutral-950 disabled:text-neutral-500 transition-all duration-300 shadow-md active:scale-90"
                    aria-label="Send message"
                  >
                    <FiSend size={12} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
