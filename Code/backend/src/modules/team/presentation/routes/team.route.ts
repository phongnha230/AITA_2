import { Router } from 'express';
import { container } from '../../../../infrastructure/container/container.js';
import { authenticateJWT, authorizeRoles } from '../../../auth/presentation/middlewares/auth.middleware.js';
import { validateBody } from '../../../../shared/presentation/middlewares/validate.middleware.js';
import { updateGitIdentitySchema } from '../../application/dtos/team.dto.js';

const router = Router();

const teamController = container.teamController;

// Routes
router.post('/', authenticateJWT, authorizeRoles('STUDENT'), teamController.createTeam);
router.get('/courses/:courseId', authenticateJWT, authorizeRoles('ADMIN', 'LECTURER', 'STUDENT'), teamController.getCourseTeams);
router.get('/:id', authenticateJWT, authorizeRoles('ADMIN', 'LECTURER', 'STUDENT'), teamController.getTeamDetails);
router.patch('/:id', authenticateJWT, authorizeRoles('STUDENT'), teamController.updateTeam);
router.post('/:id/members', authenticateJWT, authorizeRoles('STUDENT'), teamController.addMember);
router.delete('/:id/members/:userId', authenticateJWT, authorizeRoles('STUDENT'), teamController.removeMember);
router.patch(
  '/:id/members/me/git-identity',
  authenticateJWT,
  authorizeRoles('STUDENT'),
  validateBody(updateGitIdentitySchema),
  teamController.updateMyGitIdentity
);

export default router;
