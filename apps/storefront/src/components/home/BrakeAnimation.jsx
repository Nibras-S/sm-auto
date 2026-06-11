import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCpu, FiLayers, FiActivity, FiShield } from "react-icons/fi";

const TOTAL_FRAMES = 240;

// Feature milestones for annotations
const FEATURES = [
  {
    start: 0.05,
    end: 0.22,
    icon: <FiLayers className="text-accent-500" size={20} />,
    title: "Exploded Engineering View",
    subtitle: "Every individual component is meticulously designed and simulated for maximum durability and strength under extreme racing stresses.",
  },
  {
    start: 0.32,
    end: 0.52,
    icon: <FiCpu className="text-accent-500" size={20} />,
    title: "Ventilated Carbon-Steel Rotor",
    subtitle: "Precision-machined cooling vents draw intense heat away from the rotor core, virtually eliminating brake fade in high-velocity situations.",
  },
  {
    start: 0.62,
    end: 0.82,
    icon: <FiActivity className="text-accent-500" size={20} />,
    title: "Monobloc Calipers & Carbon Pads",
    subtitle: "Dual-piston direct hydraulic clamps deliver even clamping force, paired with ultra-high friction carbon-ceramic compound pads.",
  },
  {
    start: 0.88,
    end: 0.98,
    icon: <FiShield className="text-accent-500" size={20} />,
    title: "High Performance Unified System",
    subtitle: "Perfect harmony between hardware and dynamics, ensuring immediate, authoritative stopping power under any track conditions.",
  },
];

export default function BrakeAnimation() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);

  // Preloading & Interactive state
  const [loadProgress, setLoadProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(true);

  // Values controlled by animation loops
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const [activeProgress, setActiveProgress] = useState(0);

  // Format 0-padded index strings for file names (e.g. 1 -> "001")
  const pad = (num) => String(num).padStart(3, "0");

  // 1. Intelligent Preloading & Caching
  useEffect(() => {
    let loadedCount = 0;
    const tempImages = [];

    // Preload all 240 WebP files
    const frameIndices = Array.from({ length: TOTAL_FRAMES }, (_, i) => i + 1);
    frameIndices.forEach((i) => {
      const img = new Image();
      img.src = `${process.env.PUBLIC_URL || ""}/images/brake-sequence/ezgif-frame-${pad(i)}.webp`;

      img.onload = () => {
        loadedCount++;
        const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
        setLoadProgress(percent);

        if (loadedCount === TOTAL_FRAMES) {
          // Add a minor delayed transition for absolute premium aesthetic feel
          setTimeout(() => {
            setIsPreloading(false);
          }, 800);
        }
      };

      img.onerror = () => {
        // Fallback or retry gracefully
        loadedCount++;
        if (loadedCount === TOTAL_FRAMES) {
          setIsPreloading(false);
        }
      };

      tempImages.push(img);
    });
    imagesRef.current = tempImages;
  }, []);

  // 2. Scroll Event Tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || isPreloading) return;

      const rect = containerRef.current.getBoundingClientRect();
      const containerHeight = rect.height;
      const viewHeight = window.innerHeight;

      // Distance scrolled from top of sticky wrapper container
      const scrolled = -rect.top;
      const maxScroll = containerHeight - viewHeight;

      // Clamp scroll fraction from 0.0 to 1.0
      const progress = Math.min(Math.max(scrolled / maxScroll, 0), 1);
      targetProgressRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    
    // Initial call to set correct initial frame on load
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isPreloading]);

  // 3. Buttery-Smooth requestAnimationFrame Lerping Loop & Canvas Draw
  useEffect(() => {
    let animFrameId;

    const drawCanvas = (progress) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Map progress [0, 1] to frame index [0, TOTAL_FRAMES - 1]
      const frameIndex = Math.min(
        Math.max(Math.floor(progress * (TOTAL_FRAMES - 1)), 0),
        TOTAL_FRAMES - 1
      );

      const img = imagesRef.current[frameIndex];
      if (img && img.complete) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Aspect ratio draw helper to center frame nicely
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, xOffset, yOffset;

        if (canvasRatio > imgRatio) {
          drawHeight = canvas.height;
          drawWidth = img.width * (canvas.height / img.height);
          xOffset = (canvas.width - drawWidth) / 2;
          yOffset = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = img.height * (canvas.width / img.width);
          xOffset = 0;
          yOffset = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
      }
    };

    const renderLoop = () => {
      // Linear interpolation (lerp) for premium Apple-style ease
      const target = targetProgressRef.current;
      const current = currentProgressRef.current;
      const diff = target - current;

      // Dynamic easing: lower factor (0.04) on mobile heavily dampens rapid touch swipes
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const easeFactor = isMobile ? 0.04 : 0.055;
      currentProgressRef.current += diff * easeFactor;

      // Close enough threshold to prevent unnecessary ticks
      if (Math.abs(diff) < 0.0001) {
        currentProgressRef.current = target;
      }

      setActiveProgress(currentProgressRef.current);
      drawCanvas(currentProgressRef.current);

      animFrameId = requestAnimationFrame(renderLoop);
    };

    if (!isPreloading) {
      animFrameId = requestAnimationFrame(renderLoop);
    }

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isPreloading]);

  // Handle high-res DPI canvas scaling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isPreloading) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed internal size matching frames ratio (16:9, e.g. 1280x720)
    canvas.width = 1280;
    canvas.height = 720;
  }, [isPreloading]);

  // Determine current active features for UI annotations
  const activeFeature = FEATURES.find(
    (f) => activeProgress >= f.start && activeProgress <= f.end
  );

  // Dynamic Camera Parallax Styles derived from scroll progress
  // At progress = 0, camera is slightly rotated X and slightly scaled
  // At progress = 1, camera is perfectly centered
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const baseScale = isMobile ? 1.18 : 0.92;
  const cameraScale = baseScale + activeProgress * (isMobile ? 0.06 : 0.08); 
  const cameraRotateX = (1 - activeProgress) * (isMobile ? 3 : 7); 
  const cameraTranslateY = (1 - activeProgress) * (isMobile ? -6 : -15); 

  // Dynamic Shadow Styles
  // As it assembles, shadow becomes slightly tighter and darker
  const shadowScale = isMobile ? (0.95 + activeProgress * 0.15) : (0.85 + activeProgress * 0.15);
  const shadowOpacity = 0.08 + activeProgress * 0.14;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-gradient-to-b from-neutral-50 via-neutral-100 to-neutral-50 select-none z-10"
      style={{
        // Set longer, luxurious scroll depth for slower animation progression
        height: typeof window !== "undefined" && window.innerWidth < 768 ? "260vh" : "400vh",
      }}
    >
      {/* Sticky Frame Container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col justify-between py-12 md:py-20">
        
        <AnimatePresence>
          {isPreloading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-zinc-950 z-50 px-6 text-center"
            >
              {/* Ambient Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10 max-w-md w-full flex flex-col items-center">
                {/* Luxury Tech Eyebrow */}
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 mb-2">
                  SM-AUTO PERFORMANCE LAB
                </span>
                
                <h3 className="text-2xl font-bold font-mechanic-header text-white italic tracking-wide uppercase mb-8">
                  3D ENGINEERING SHOWROOM
                </h3>

                {/* High-end Circular Preloader Meter */}
                <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-white/5"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    :                  <motion.circle
                      cx="56"
                      cy="56"
                      r="48"
                      className="stroke-red-600"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - loadProgress / 100)}
                      transition={{ ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold font-mechanic-header text-white italic">
                      {loadProgress}%
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.1em] text-neutral-400 font-semibold mt-0.5">
                      LOADED
                    </span>
                  </div>
                </div>

                {/* Progress Detail */}
                <div className="w-full bg-white/5 h-[2px] rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="bg-red-600 h-full rounded-full"
                    style={{ width: `${loadProgress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                
                <p className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  PRELOADING HIGH-FIDELITY BINDINGS
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Dynamic Glowing Background Behind Canvas */}
        <div className="absolute inset-0 w-full h-full bg-radial-glow pointer-events-none z-0" />

        {/* 1. Header Area: Fades out as user scrolls to focus fully on the brake product */}
        <div 
          className="container-x w-full flex flex-col items-center text-center relative z-10 transition-all duration-500"
          style={{
            opacity: activeProgress < 0.15 ? 1 : Math.max(0, 1 - (activeProgress - 0.15) * 8),
            transform: `translateY(${activeProgress < 0.15 ? 0 : -(activeProgress - 0.15) * 80}px)`,
            pointerEvents: activeProgress > 0.25 ? "none" : "auto",
          }}
        >
          <div className="eyebrow justify-center mb-3">
            <span className="h-0.5 w-6 rounded-full bg-accent-500" />
            ENGINEERING EXCELLENCE
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.08] max-w-2xl text-balance">
            Witness Pure Performance <span className="text-accent-500 italic">Assemble</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-lg text-balance">
            Scroll down to explore how our carbon-steel rotors, monobloc calipers, and carbon-ceramic pads interlock.
          </p>
        </div>

        {/* 2. Central Assembly Canvas Showcase with parallax tilts & responsive scaling */}
        <div className="relative w-full flex-1 flex flex-col justify-center items-center px-0 md:px-12 z-10 overflow-visible mt-2">
          
          <div
            className="relative w-full max-w-[1150px] aspect-[16/9] flex justify-center items-center transition-transform duration-75 ease-out"
            style={{
              transform: `perspective(1200px) rotateX(${cameraRotateX}deg) scale(${cameraScale}) translateY(${cameraTranslateY}px)`,
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
            />
          </div>

          {/* Premium realistic ground shadow beneath the canvas */}
          <div
            className="absolute bottom-[2%] md:bottom-[4%] left-1/2 -translate-x-1/2 w-[75%] sm:w-[65%] md:w-[54%] h-[20px] rounded-[50%] bg-neutral-950/20 blur-[18px] transition-all duration-100 ease-out pointer-events-none z-0"
            style={{
              transform: `translateX(-50%) scale(${shadowScale})`,
              opacity: shadowOpacity,
            }}
          />
        </div>

        {/* 3. Floating Interactive Labels Overlay */}
        <div className="relative z-20 w-full min-h-[140px] md:min-h-[160px] flex items-center justify-center px-6">
          <div className="container-x w-full max-w-xl">
            <AnimatePresence mode="wait">
              {activeFeature ? (
                <motion.div
                  key={activeFeature.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
                  className="flex flex-col items-center text-center px-6 py-5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/40 shadow-[0_12px_40px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-neutral-100 rounded-lg shrink-0">
                      {activeFeature.icon}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-neutral-900 font-display">
                      {activeFeature.title}
                    </h4>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md">
                    {activeFeature.subtitle}
                  </p>
                </motion.div>
              ) : (
                // Minimalist hint when not actively highlighting a component
                <motion.div
                  key="scroll-hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-2 text-neutral-400"
                >
                  <div className="w-[1px] h-8 bg-gradient-to-b from-neutral-300 to-transparent animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Keep Scrolling
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 4. Bottom Engineering Progress Line (Apple-style subtle indicator) */}
        <div className="absolute bottom-3 left-0 w-full flex justify-center items-center px-12 z-20 pointer-events-none">
          <div className="w-[200px] h-[3px] bg-neutral-200/80 rounded-full overflow-hidden">
            <div
              className="bg-accent-500 h-full rounded-full transition-all duration-100 ease-out"
              style={{ width: `${activeProgress * 100}%` }}
            />
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-radial-glow {
          background: radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.035) 0%, transparent 60%);
        }
      `}} />
    </div>
  );
}
