import { Request, Response, NextFunction } from 'express';
import { GradeSubmissionAiUseCase } from '../../application/use-cases/grade-submission-ai.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';

export class AiGradingController {
  constructor(private readonly gradeSubmissionAiUseCase: GradeSubmissionAiUseCase) {}

  gradeSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { submissionId } = req.params;
      const result = await this.gradeSubmissionAiUseCase.execute(submissionId);
      sendSuccess(res, result, 'Chấm điểm Rubric AI và đánh giá ngữ nghĩa hoàn tất.', 200);
    } catch (error) {
      next(error);
    }
  };
}
