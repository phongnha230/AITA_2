import app from './app.js';
import { env } from './infrastructure/config/env.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AITA Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/v1/health`);
  console.log(`====================================================`);
});
