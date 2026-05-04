import type { Config } from 'tailwindcss'
import 'tailwind-scrollbar';
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  plugins: [
    require('tailwind-scrollbar')({ noCompatible: true }),
  ],
}

export default config