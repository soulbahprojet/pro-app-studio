import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Configuration spécifique pour l'application PDG
export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'dist-pdg',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index-pdg.html')
      }
    }
  },
  server: {
    host: "::",
    port: 8081, // Port différent pour l'app PDG
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __PDG_APP__: true,
  }
}));