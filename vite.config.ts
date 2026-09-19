import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Sin servidor propio: el backend vive en Bolt Database (Supabase/Postgres)
// mediante funciones SQL llamadas por RPC desde el cliente.
export default defineConfig({
  plugins: [react()],
});
