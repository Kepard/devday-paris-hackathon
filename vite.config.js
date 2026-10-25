import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createChatMiddleware, createLocalDatabase } from './server/local.mjs';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '');
  // Only this server-side closure receives secrets. Nothing is defined on the client.
  const env = Object.fromEntries(['OPENAI_API_KEY', 'AI_DEMO_EXPIRES_AT', 'AI_DAILY_BUDGET_USD']
    .map(key => [key, process.env[key] ?? fileEnv[key]]));
  function installChat(server) {
    const DB = createLocalDatabase(path.resolve('.data/chat-budget.sqlite'));
    server.httpServer?.once('close', () => DB.close());
    server.middlewares.use(createChatMiddleware({ ...env, DB }));
  }
  return {
    plugins: [react(), {
      name: 'find-your-daddy-chat',
      configureServer: installChat,
      configurePreviewServer: installChat,
    }],
    server: { strictPort: true },
    preview: { strictPort: true },
  };
});
