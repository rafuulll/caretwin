import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({plugins:[react()],build:{target:'es2020',rolldownOptions:{input:{landing:fileURLToPath(new URL('./index.html',import.meta.url)),painel:fileURLToPath(new URL('./painel/index.html',import.meta.url))}}}});
