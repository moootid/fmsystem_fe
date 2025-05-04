import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
function loadEnv() {
  var myEnv = dotenv.config();
  dotenvExpand.expand(myEnv);
}
loadEnv();
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': process.env,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
