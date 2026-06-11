/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#141414",
          muted: "#1c1c1c",
        },
        // Brand accent — driven by the --accent CSS variable in src/index.css.
        // Change that ONE variable to re-theme the whole site. Default = monochrome.
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          50: "rgb(var(--accent) / <alpha-value>)",
          100: "rgb(var(--accent) / <alpha-value>)",
          200: "rgb(var(--accent) / <alpha-value>)",
          300: "rgb(var(--accent) / <alpha-value>)",
          400: "rgb(var(--accent) / <alpha-value>)",
          500: "rgb(var(--accent) / <alpha-value>)",
          600: "rgb(var(--accent-strong) / <alpha-value>)",
          700: "rgb(var(--accent-strong) / <alpha-value>)",
          800: "rgb(var(--accent-strong) / <alpha-value>)",
          900: "rgb(var(--accent-strong) / <alpha-value>)",
          contrast: "rgb(var(--accent-contrast) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        "8xl": "88rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,10,10,0.04), 0 8px 24px rgba(10,10,10,0.06)",
        card: "0 1px 3px rgba(10,10,10,0.06), 0 12px 32px -8px rgba(10,10,10,0.12)",
        "card-hover": "0 8px 16px rgba(10,10,10,0.08), 0 24px 48px -12px rgba(10,10,10,0.22)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px -20px rgba(0,0,0,0.6)",
        "accent-glow": "0 10px 30px -8px rgb(var(--accent) / 0.4)",
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(10,10,10,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.05) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        // Brushed-metal sheen for dark surfaces
        metal:
          "linear-gradient(135deg, #181818 0%, #0b0b0b 38%, #1d1d1d 52%, #0a0a0a 100%)",
        "metal-radial":
          "radial-gradient(120% 120% at 15% 0%, #232323 0%, #0d0d0d 45%, #060606 100%)",
        // Film-grain noise (used via the <Grain /> overlay)
        noise:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        kenburns: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: 0.7 },
          "70%": { transform: "scale(1.6)", opacity: 0 },
          "100%": { transform: "scale(1.6)", opacity: 0 },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        sweep: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.8s ease-out forwards",
        fadeUp: "fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 60s linear infinite",
        float: "float 6s ease-in-out infinite",
        kenburns: "kenburns 12s ease-out forwards",
        shimmer: "shimmer 2.2s linear infinite",
        pulseRing: "pulseRing 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
        spinSlow: "spinSlow 22s linear infinite",
        sweep: "sweep 1.1s ease-out",
      },
    },
  },
  plugins: [],
};
