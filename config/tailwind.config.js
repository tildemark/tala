/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/shared/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // TALA Brand Colors - Professional Accounting Theme
        tala: {
          // Primary: Deep Navy Blue (Trust, Stability, Authority)
          primary: {
            50: '#f0f4f9',
            100: '#e1e9f4',
            200: '#c3d3e8',
            300: '#a5bde1',
            400: '#7da0d1',
            500: '#5584c1', // Primary
            600: '#3d5fa8',
            700: '#2d4579',
            800: '#1e2d4a',
            900: '#0f161e',
          },
          // Secondary: Gold Accent (Prosperity, Finance)
          secondary: {
            50: '#fffaf0',
            100: '#fff3d6',
            200: '#ffe8ad',
            300: '#ffd97d',
            400: '#ffc94d',
            500: '#ffb821', // Secondary Accent
            600: '#e89a00',
            700: '#bf7e00',
            800: '#8c5a00',
            900: '#4d3200',
          },
          // Tertiary: Professional Green (Growth, Compliance)
          tertiary: {
            50: '#f0f9f5',
            100: '#d4f0e6',
            200: '#a8e1cd',
            300: '#7cd2b4',
            400: '#50c39b',
            500: '#2eb482', // Growth/Success
            600: '#239668',
            700: '#18784e',
            800: '#0d5a34',
            900: '#023c1a',
          },
          // Semantic: Danger Red
          danger: {
            50: '#fff5f5',
            100: '#ffe6e6',
            200: '#ffcccc',
            300: '#ff9999',
            400: '#ff6666',
            500: '#ff3333',
            600: '#e60000',
            700: '#b30000',
            800: '#800000',
            900: '#4d0000',
          },
          // Semantic: Warning Yellow
          warning: {
            50: '#fffbf0',
            100: '#fff6e0',
            200: '#ffecbd',
            300: '#ffe599',
            400: '#ffdb66',
            500: '#ffd233',
            600: '#e6b800',
            700: '#b38900',
            800: '#805a00',
            900: '#4d3300',
          },
          // Semantic: Success Green
          success: {
            50: '#f0fef4',
            100: '#d4fce4',
            200: '#a8f8ca',
            300: '#7df5af',
            400: '#50f194',
            500: '#24ed79',
            600: '#00d656',
            700: '#00ad42',
            800: '#00842e',
            900: '#005b1a',
          },
          // Semantic: Info Blue
          info: {
            50: '#f0f7ff',
            100: '#d4e8ff',
            200: '#a8d1ff',
            300: '#7dbfff',
            400: '#50aaff',
            500: '#2495ff',
            600: '#0076e6',
            700: '#0053b3',
            800: '#003380',
            900: '#001a4d',
          },
          // Neutral Grays (Light & Dark Mode)
          neutral: {
            0: '#ffffff',
            50: '#f9fafb',
            100: '#f3f4f6',
            150: '#ececf1',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
            950: '#030712',
          },
        },
        // Extended colors for accounting-specific elements
        ledger: {
          debit: '#2d4579', // Darker navy for debits
          credit: '#2eb482', // Green for credits
          balance: '#5584c1', // Primary blue for balance
        },
      },
      backgroundColor: {
        'tala-gradient': 'linear-gradient(135deg, #5584c1 0%, #2eb482 100%)',
      },
      backgroundImage: {
        'tala-gradient-light': 'linear-gradient(135deg, #e1e9f4 0%, #d4f0e6 100%)',
        'tala-gradient-dark': 'linear-gradient(135deg, #0f161e 0%, #023c1a 100%)',
        'tala-mesh': 'radial-gradient(circle at 1px 1px, #5584c1 1px, transparent 1px)',
      },
      fontSize: {
        // Accounting-specific type scale
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
      },
      fontFamily: {
        sans: [
          'Inter, system-ui, -apple-system, sans-serif',
          {
            fontFeatureSettings: '"cv11" 1, "ss01" 1',
          },
        ],
        mono: ['Fira Code, monospace'],
      },
      boxShadow: {
        'tala-sm': '0 1px 2px 0 rgba(15, 22, 30, 0.05)',
        'tala-md': '0 4px 6px -1px rgba(15, 22, 30, 0.1), 0 2px 4px -1px rgba(15, 22, 30, 0.06)',
        'tala-lg': '0 10px 15px -3px rgba(15, 22, 30, 0.1), 0 4px 6px -2px rgba(15, 22, 30, 0.05)',
        'tala-xl': '0 20px 25px -5px rgba(15, 22, 30, 0.1), 0 10px 10px -5px rgba(15, 22, 30, 0.04)',
        'tala-elevated': '0 8px 16px -2px rgba(85, 132, 193, 0.15)',
        'tala-inset': 'inset 0 1px 2px 0 rgba(15, 22, 30, 0.05)',
      },
      borderRadius: {
        xs: '0.25rem',
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      borderColor: {
        tala: {
          light: '#c3d3e8',
          DEFAULT: '#a5bde1',
          dark: '#3d5fa8',
        },
      },
      opacity: {
        5: '0.05',
        10: '0.1',
        15: '0.15',
        35: '0.35',
        65: '0.65',
        85: '0.85',
      },
      spacing: {
        px: '1px',
        0: '0px',
        0.5: '0.125rem',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutRight: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      zIndex: {
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        modalBackdrop: '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070',
      },
    },
  },
  plugins: [
    // @ts-ignore
    require('@tailwindcss/forms')({
      strategy: 'class', // Use 'class' strategy for better control
    }),
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss'),
    // Custom plugin for audit trail styling
    function ({ addComponents, theme }) {
      addComponents({
        '.audit-sidebar': {
          '@apply fixed right-0 top-0 h-screen w-96 bg-white dark:bg-tala-neutral-900 shadow-tala-lg border-l border-tala-neutral-200 dark:border-tala-neutral-800 overflow-y-auto transition-transform duration-300 ease-out': {},
        },
        '.audit-sidebar.hidden': {
          '@apply translate-x-full': {},
        },
        '.audit-entry': {
          '@apply border-l-4 border-tala-primary-300 dark:border-tala-primary-700 bg-tala-primary-50 dark:bg-tala-neutral-800 p-4 mb-4 rounded-r-lg': {},
        },
        '.audit-entry.action-created': {
          '@apply border-l-tala-success-500': {},
        },
        '.audit-entry.action-updated': {
          '@apply border-l-tala-warning-500': {},
        },
        '.audit-entry.action-deleted': {
          '@apply border-l-tala-danger-500': {},
        },
        '.ledger-table': {
          '@apply w-full border-collapse': {},
        },
        '.ledger-table tbody tr': {
          '@apply border-b border-tala-neutral-200 dark:border-tala-neutral-700': {},
        },
        '.ledger-table tbody tr:hover': {
          '@apply bg-tala-primary-50 dark:bg-tala-neutral-800': {},
        },
        '.ledger-debit': {
          '@apply text-tala-neutral-700 dark:text-tala-primary-300 font-semibold': {},
        },
        '.ledger-credit': {
          '@apply text-tala-success-600 dark:text-tala-success-400 font-semibold': {},
        },
        '.form-input-tala': {
          '@apply block w-full rounded-lg border border-tala-neutral-300 dark:border-tala-neutral-600 bg-white dark:bg-tala-neutral-800 px-3 py-2 text-tala-neutral-900 dark:text-white shadow-tala-sm transition-colors focus:border-tala-primary-500 focus:outline-none focus:ring-2 focus:ring-tala-primary-200 dark:focus:ring-tala-primary-800': {},
        },
        '.btn-tala-primary': {
          '@apply inline-flex items-center justify-center px-4 py-2 rounded-lg bg-tala-primary-500 text-white font-medium shadow-tala-md hover:bg-tala-primary-600 focus:outline-none focus:ring-2 focus:ring-tala-primary-300 dark:focus:ring-tala-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.btn-tala-secondary': {
          '@apply inline-flex items-center justify-center px-4 py-2 rounded-lg bg-tala-neutral-100 dark:bg-tala-neutral-800 text-tala-primary-600 dark:text-tala-primary-300 font-medium border border-tala-neutral-300 dark:border-tala-neutral-600 hover:bg-tala-neutral-200 dark:hover:bg-tala-neutral-700 focus:outline-none focus:ring-2 focus:ring-tala-primary-200 dark:focus:ring-tala-primary-800 transition-colors': {},
        },
        '.badge-tala-success': {
          '@apply inline-block px-3 py-1 rounded-full bg-tala-success-100 dark:bg-tala-success-900 text-tala-success-700 dark:text-tala-success-200 text-xs font-semibold': {},
        },
        '.badge-tala-warning': {
          '@apply inline-block px-3 py-1 rounded-full bg-tala-warning-100 dark:bg-tala-warning-900 text-tala-warning-700 dark:text-tala-warning-200 text-xs font-semibold': {},
        },
        '.badge-tala-danger': {
          '@apply inline-block px-3 py-1 rounded-full bg-tala-danger-100 dark:bg-tala-danger-900 text-tala-danger-700 dark:text-tala-danger-200 text-xs font-semibold': {},
        },
        '.card-tala': {
          '@apply bg-white dark:bg-tala-neutral-900 rounded-lg border border-tala-neutral-200 dark:border-tala-neutral-800 shadow-tala-sm p-6': {},
        },
        '.card-tala-elevated': {
          '@apply bg-white dark:bg-tala-neutral-900 rounded-lg shadow-tala-elevated': {},
        },
      });
    },
  ],
};
