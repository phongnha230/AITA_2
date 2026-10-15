import { Request, Response, NextFunction } from 'express';
import { ManageApiKeysUseCase } from '../../application/use-cases/manage-api-keys.use-case.js';
import { sendSuccess } from '../../../../shared/presentation/utils/api-response.util.js';

export class AiApiKeyController {
  constructor(private readonly manageApiKeysUseCase: ManageApiKeysUseCase) {}

  createKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const apiKey = await this.manageApiKeysUseCase.createKey(req.body);
      sendSuccess(res, apiKey, 'Thêm mới và mã hóa AI API Key thành công!', 201);
    } catch (error) {
      next(error);
    }
  };

  listKeys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.manageApiKeysUseCase.listKeys();
      sendSuccess(res, list, 'Lấy danh sách AI API Keys thành công.');
    } catch (error) {
      next(error);
    }
  };

  toggleKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive } = req.body ?? {};
      const updated = await this.manageApiKeysUseCase.toggleKey(req.params.id, isActive);
      sendSuccess(res, updated, 'Cập nhật trạng thái API Key thành công.');
    } catch (error) {
      next(error);
    }
  };

  deleteKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.manageApiKeysUseCase.deleteKey(req.params.id);
      sendSuccess(res, null, result.message, 200);
    } catch (error) {
      next(error);
    }
  };
}
