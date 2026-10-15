import { Router } from 'express';
import { TeamController } from '../controllers/team.controller.js';
import { CreateTeamUseCase } from '../../application/use-cases/create-team.use-case.js';
import { ManageTeamUseCase } from '../../application/use-cases/manage-team.use-case.js';
import { PrismaTeamRepository } from '../../infrastructure/repositories/prisma-team.repository.js';
import { PrismaUserRepository } from '../../../user/infrastructure/repositories/prisma-user.repository.js';
import { PrismaCourseRepository } from '../../../course/infrastructure/repositories/prisma-course.repository.js';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { authenticateJWT } from '../../../auth/presentation/middlewares/auth.middleware.js';

const router = Router();

// Composition Root
const teamRepository = new PrismaTeamRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const courseRepository = new PrismaCourseRepository(prisma);

const createTeamUseCase = new CreateTeamUseCase(teamRepository);
const manageTeamUseCase = new ManageTeamUseCase(teamRepository, userRepository, courseRepository);
const teamController = new TeamController(createTeamUseCase, manageTeamUseCase);

// Routes
router.post('/', authenticateJWT, teamController.createTeam);
router.get('/courses/:courseId', authenticateJWT, teamController.getCourseTeams);
router.get('/:id', authenticateJWT, teamController.getTeamDetails);
router.patch('/:id', authenticateJWT, teamController.updateTeam);
router.post('/:id/members', authenticateJWT, teamController.addMember);
router.delete('/:id/members/:userId', authenticateJWT, teamController.removeMember);

export default router;
