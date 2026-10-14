import { Request, Response } from 'express';
import { IHealthService } from '../../application/services/health.service.interface.js';

export class HealthController {
  constructor(private readonly healthService: IHealthService) {}

  public checkHealth = async (_req: Request, res: Response): Promise<void> => {
    const health = await this.healthService.check();
    res.status(health.status === 'UP' ? 200 : 503).json({ success: true, data: health });
  };
}
