import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import { updateGitIdentitySchema } from '../../application/dtos/team.dto.js';

const router = Router();

const teamController = container.teamController;

// Routes
router.post('/', authenticateJWT, teamController.createTeam);
router.get('/courses/:courseId', authenticateJWT, teamController.getCourseTeams);
router.get('/:id', authenticateJWT, teamController.getTeamDetails);
router.patch('/:id', authenticateJWT, teamController.updateTeam);
router.post('/:id/members', authenticateJWT, teamController.addMember);
router.delete('/:id/members/:userId', authenticateJWT, teamController.removeMember);
router.patch(
  '/:id/members/me/git-identity',
  authenticateJWT,
  validateBody(updateGitIdentitySchema),
  teamController.updateMyGitIdentity
);

export default router;
