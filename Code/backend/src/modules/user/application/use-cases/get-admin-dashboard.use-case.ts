import {
  AdminDashboardResponse,
  IDashboardRepository,
} from '../../domain/repositories/dashboard.repository.interface.js';

export { AdminDashboardResponse };

export class GetAdminDashboardUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  public async execute(): Promise<AdminDashboardResponse> {
    return this.dashboardRepository.getAdminDashboard();
  }
}
