import React from "react";
import { motion } from "framer-motion";
import mechanicImg from "../../assets/sections/ChatGPT Image Jun 2, 2026, 12_46_55 AM (1).png";

export default function MechanicBanner() {
  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] pt-14 pb-8 md:pt-24 md:pb-12 border-t border-neutral-200/30">
      <div className="container-x relative flex flex-col items-center justify-center">
        
        {/* Premium 3D Styled Typography with staggered scroll reveal */}
        <div className="relative w-full flex flex-col items-center select-none text-[#1E2E4A] z-0 text-center">
          
          {/* Line 1 */}
          <motion.h2 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl sm:text-3xl md:text-5xl lg:text-[54px] xl:text-[64px] font-display font-black uppercase tracking-wide leading-none drop-shadow-[0_2px_8px_rgba(30,46,74,0.08)]"
          >
            ALL KINDS OF PARTS THAT YOU
          </motion.h2>
          
          {/* Line 2: Positioned behind the mechanics/car with premium 3D text styling */}
          <motion.h3 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-[20px] sm:text-[40px] md:text-[60px] lg:text-[80px] xl:text-[92px] font-display font-black uppercase tracking-wide leading-none mt-2.5 md:mt-4 whitespace-nowrap drop-shadow-[0_6px_20px_rgba(30,46,74,0.15)] opacity-95"
          >
            NEED CAN FIND HERE
          </motion.h3>
          
        </div>

        {/* Overlapping Mechanics Transparent Image - Elevated further for deep 3D overlap */}
        <motion.div 
          initial={{ y: 150, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ type: "spring", stiffness: 40, damping: 14, delay: 0.25 }}
          className="relative z-10 w-full max-w-6xl mx-auto -mt-12 sm:-mt-24 md:-mt-48 lg:-mt-72 xl:-mt-80 select-none pointer-events-none"
        >
          <img
            src={mechanicImg}
            alt="Professional mechanics servicing a luxury sports car"
            loading="lazy"
            className="w-full h-auto object-contain mx-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)] scale-[1.4] xs:scale-[1.2] sm:scale-100 transition-transform origin-center duration-700"
          />
        </motion.div>

      </div>
    </section>
  );
}


