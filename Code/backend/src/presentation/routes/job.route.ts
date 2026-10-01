import { Router } from 'express';

import {
  JobController,
} from '../controllers/job.controller.js';


const router = Router();


/**
 * GET /jobs/:submissionId
 *
 * Lấy progress / lifecycle của grading job.
 */
router.get(
  '/:submissionId',
  JobController.getJobStatus
);


export default router;