import app from './app.js';
import { env } from './infrastructure/config/env.js';
import { startGradingWorker, stopGradingWorker } from './infrastructure/queue/grading-worker.bootstrap.js';
import { workspaceCleanupService } from './infrastructure/storage/workspace-cleanup.service.js';
import {
  startRagIndexingWorker,
  stopRagIndexingWorker,
} from './modules/ai/infrastructure/queue/rag-indexing.queue.js';
import { logger } from './infrastructure/logging/logger.js';
import { container } from './infrastructure/container/container.js';

const PORT = env.PORT;

// Khởi động BullMQ Grading Worker (Sandbox + AI Grader)
try {
  startGradingWorker();
  startRagIndexingWorker(container.solutionVectorStore);
} catch (err) {
  logger.warn('worker_start_failed', { stage: 'SERVER_STARTUP', error: err });
}

// Chạy dọn dẹp workspace cũ định kỳ (1 ngày 1 lần)
setInterval(() => {
  workspaceCleanupService.cleanupOldWorkspaces(7).catch((error: unknown) => {
    logger.error('workspace_cleanup_failed', { stage: 'WORKSPACE_CLEANUP', error });
  });
}, 24 * 60 * 60 * 1000);

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 AITA Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔐 Auth API:        http://localhost:${PORT}/api/v1/auth/login`);
  console.log(`👥 Users API:       http://localhost:${PORT}/api/v1/users/profile`);
  console.log(`====================================================`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down server...');
  await stopGradingWorker();
  await stopRagIndexingWorker();
  server.close(() => {
    console.log('✅ HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

