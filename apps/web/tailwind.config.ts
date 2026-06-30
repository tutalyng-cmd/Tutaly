import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      // ONLY our tokens. No spread of defaultColors. No `extend`.
      c900: 'var(--c-900)', 
      c800: 'var(--c-800)', 
      c700: 'var(--c-700)',
      c600: 'var(--c-600)', 
      c500: 'var(--c-500)', 
      c400: 'var(--c-400)',
      c300: 'var(--c-300)', 
      c200: 'var(--c-200)', 
      c100: 'var(--c-100)',
      blue: 'var(--blue)', 
      blueH: 'var(--blue-h)', 
      blueL: 'var(--blue-l)',
      gold: 'var(--gold)', 
      goldH: 'var(--gold-h)',
      green: 'var(--green)', 
      red: 'var(--red)',
      transparent: 'transparent', 
      white: '#fff',
    },
    // We enforce 4px-based standard scales for spacing
    spacing: {
      '0': '0',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '8': '32px',
      '10': '40px',
      '12': '48px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
      '32': '128px',
      '40': '160px',
    },
    maxWidth: {
      'layout-sm': '300px',
      'layout-md': '500px',
      'layout-lg': '800px',
      'layout-xl': '1100px',
      'full': '100%',
    },
    minWidth: {
      'layout-xs': '72px',
      'layout-sm': '150px',
      'layout-md': '200px',
      'layout-lg': '300px',
    },
    maxHeight: {
      'layout-md': '300px',
      'layout-lg': '500px',
      'full': '100%',
    },
    minHeight: {
      'layout-md': '120px',
      'layout-lg': '400px',
      'layout-xl': '500px',
    },
    fontFamily: {
      sans: ["var(--font)", "-apple-system", "sans-serif"],
      mono: ["var(--mono)", "monospace"],
    },
    borderRadius: {
      'sm': 'var(--r-sm)',
      'md': 'var(--r-md)',
      'lg': 'var(--r-lg)',
      'xl': 'var(--r-xl)',
      'pill': 'var(--r-pill)',
      'full': '9999px',
    },
    boxShadow: {
      'md': 'var(--shadow-md)',
      'lg': 'var(--shadow-lg)',
      'glow-blue': 'var(--glow-blue)',
      'glow-gold': 'var(--glow-gold)',
      'none': 'none',
    },
  },
  plugins: [],
};
export default config;
