import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // This is necessary because the Google GenAI SDK and the provided code 
      // rely on `process.env.API_KEY`. Vite usually uses import.meta.env.
      // This maps the build-time env var to the global variable expected by the code.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});