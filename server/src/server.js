import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT;

const server = app.listen(PORT, () => {
  console.log(`
  ======================================================
  ⚡ AURA SOUND & LIVING REST API RUNNING
  ⚡ PORT: http://localhost:${PORT}
  ⚡ Health Check: http://localhost:${PORT}/api/health
  ⚡ Mode: ${ENV.NODE_ENV}
  ======================================================
  `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});
