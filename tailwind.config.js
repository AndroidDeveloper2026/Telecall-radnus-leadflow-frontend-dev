/** Merge this into your existing tailwind.config (it was not in the zip).
 *  If your project is CommonJS, change `export default` to `module.exports =`. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      colors: {
        ink: '#1f1147',
        canvas: '#fcf5fc',
        brand: { 50: '#f8f0fd', 100: '#f1e1fb', 200: '#e3c4f6', 300: '#d09aee', 400: '#b868e2', 500: '#9b3fcc', 600: '#7a2bb5', 700: '#5f2196', 800: '#4a1a78', 900: '#36115a' },
        accent: { 50: '#fff0f5', 100: '#ffdce8', 500: '#e8317a', 600: '#d3206a' },
      },
      boxShadow: { card: '0 8px 28px -10px rgba(110,42,168,.18), 0 1px 2px rgba(110,42,168,.06)' },
    },
  },
  plugins: [],
};




// export default {
//   content: ['./index.html', './src/**/*.{ts,tsx}'],
//   theme: { extend: {
//     fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
//     colors: { brand: { 50: '#fdecec', 100: '#fbd5d5', 500: '#c62828', 600: '#b71c1c', 700: '#991b1b', 800: '#7f1d1d' }, ink: '#1e293b', mist: '#f3f6fb' },
//     boxShadow: { card: '0 1px 2px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.05)' },
//   } },
// };
