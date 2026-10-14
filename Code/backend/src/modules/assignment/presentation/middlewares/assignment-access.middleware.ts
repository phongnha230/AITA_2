import { NextFunction, Request, Response } from 'express';
import prisma from '../../../../infrastructure/database/prisma.client.js';
import { UnauthorizedError } from '../../../../shared/domain/exceptions/app.error.js';
import { PrismaAssignmentAccessPolicy } from '../../infrastructure/policies/prisma-assignment-access.policy.js';

const policy = new PrismaAssignmentAccessPolicy(prisma);

const actorFrom = (req: Request) => {
  if (!req.user) throw new UnauthorizedError();
  return { userId: req.user.userId, role: req.user.role };
};

type AccessCheck = (req: Request) => Promise<void>;

const accessMiddleware = (check: AccessCheck) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      await check(req);
      next();
    } catch (error) {
      next(error);
    }
  };

export const requireAssignmentView = accessMiddleware((req) =>
  policy.assertCanViewAssignment(actorFrom(req), req.params.id)
);

export const requireAssignmentManage = accessMiddleware((req) =>
  policy.assertCanManageAssignment(actorFrom(req), req.params.id ?? req.params.assignmentId)
);

export const requireCourseView = accessMiddleware((req) =>
  policy.assertCanViewCourse(actorFrom(req), req.params.courseId)
);

export const requireTestCaseManage = accessMiddleware((req) =>
  policy.assertCanManageTestCase(actorFrom(req), req.params.testCaseId)
);

export const requireSubmissionAccess = accessMiddleware((req) =>
  policy.assertCanAccessSubmission(actorFrom(req), req.params.submissionId ?? req.params.id)
);
