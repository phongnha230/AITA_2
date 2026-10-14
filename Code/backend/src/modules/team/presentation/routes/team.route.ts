import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT } from '../../../auth/presentation/middlewares/auth.middleware.js';

const router = Router();

const teamController = container.teamController;

// Routes
router.post('/', authenticateJWT, teamController.createTeam);
router.get('/courses/:courseId', authenticateJWT, teamController.getCourseTeams);
router.get('/:id', authenticateJWT, teamController.getTeamDetails);
router.patch('/:id', authenticateJWT, teamController.updateTeam);
router.post('/:id/members', authenticateJWT, teamController.addMember);
router.delete('/:id/members/:userId', authenticateJWT, teamController.removeMember);

export default router;
