import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      boxShadow: {
        'elevated-sm': '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 6px rgba(15, 23, 42, 0.03)',
        'elevated': '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.05), 0 12px 28px rgba(15, 23, 42, 0.04)',
        'elevated-hover': '0 2px 4px rgba(15, 23, 42, 0.04), 0 8px 20px rgba(15, 23, 42, 0.07), 0 16px 36px rgba(15, 23, 42, 0.05)',
        'elevated-lg': '0 2px 4px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06), 0 20px 40px rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
