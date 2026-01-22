module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      // Suppress unknown class warnings for dynamically loaded classes
      future: {
        skipInvalidDynamicDirectives: true,
      },
    },
  },
};
