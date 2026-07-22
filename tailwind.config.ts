import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'jakarta': ['Outfit', 'system-ui', 'sans-serif'],
        'nunito': ['Nunito', 'system-ui', 'sans-serif'],
        'fredoka': ['Fredoka', 'Comic Neue', 'Comic Sans MS', 'cursive'],
        'comic': ['Comic Neue', 'Comic Sans MS', 'cursive'],
        'display': ['Outfit', 'Space Grotesk', 'system-ui', 'sans-serif'],
        // Creator Studio workspace
        'studio-display': ['"Space Grotesk"', 'Outfit', 'system-ui', 'sans-serif'],
        'studio-body': ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        lesson: {
          blue: "hsl(var(--lesson-blue))",
          green: "hsl(var(--lesson-green))",
          orange: "hsl(var(--lesson-orange))",
          purple: "hsl(var(--lesson-purple))",
          pink: "hsl(var(--lesson-pink))",
          red: "hsl(var(--lesson-red))",
          teal: "hsl(var(--lesson-teal))",
          lime: "hsl(var(--lesson-lime))",
        },
        brand: {
          emerald: "var(--brand-emerald)",
          "emerald-deep": "var(--brand-emerald-deep)",
          "emerald-glow": "var(--brand-emerald-glow)",
          mint: "var(--brand-mint)",
          cream: "var(--brand-cream)",
          sun: "var(--brand-sun)",
          sky: "var(--brand-sky)",
          purple: "var(--brand-purple)",
          "purple-deep": "var(--brand-purple-deep)",
          "purple-glow": "var(--brand-purple-glow)",
          pink: "var(--brand-pink)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-warm': 'var(--gradient-warm)',
        'gradient-cool': 'var(--gradient-cool)',
        'gradient-rainbow': 'var(--gradient-rainbow)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-fun': 'var(--gradient-fun)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'card': 'var(--shadow-card)',
        'button': 'var(--shadow-button)',
        'glow': 'var(--shadow-glow)',
        'fun': 'var(--shadow-fun)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "pulse-fun": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(0.98)" }
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-20px) translateX(10px)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "25%": { transform: "translateY(-12px)" },
          "50%": { transform: "translateY(-20px)" },
          "75%": { transform: "translateY(-10px)" }
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-18px) translateX(5px)" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.6)" }
        },
        "gradient-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        "border-beam": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" }
        },
        "gradient-text": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "shine": {
          "0%": { transform: "translateX(-100%) skewX(-12deg)" },
          "100%": { transform: "translateX(200%) skewX(-12deg)" }
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" }
        },
        "firefly": {
          "0%, 100%": { opacity: "0", transform: "translateY(0) scale(0.5)" },
          "50%": { opacity: "0.7", transform: "translateY(-15px) scale(1)" },
        },
        "sway": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "lantern-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(251,191,36,0.15)" },
          "50%": { boxShadow: "0 0 25px rgba(251,191,36,0.35)" },
        },
        "trail-pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "trail-wiggle": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "trail-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        "bounce-gentle": "bounce-gentle 2s infinite",
        "pulse-fun": "pulse-fun 3s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "float": "float 4s ease-in-out infinite",
        "float-slow": "float-slow 4s ease-in-out infinite",
        "float-delayed": "float-delayed 5s ease-in-out infinite 1s",
        "scale-in": "scale-in 0.5s ease-out",
        "slide-up": "slide-up 0.6s ease-out",
        "marquee": "marquee 30s linear infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "gradient-rotate": "gradient-rotate 3s linear infinite",
        "border-beam": "border-beam 2s linear infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "gradient-text": "gradient-text 3s ease infinite",
        "shine": "shine 3s ease-in-out infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "firefly": "firefly 3s ease-in-out infinite",
        "sway": "sway 3s ease-in-out infinite",
        "lantern-glow": "lantern-glow 3s ease-in-out infinite",
        "pop": "trail-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "wiggle": "trail-wiggle 0.45s ease-in-out",
        "trail-float": "trail-float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
