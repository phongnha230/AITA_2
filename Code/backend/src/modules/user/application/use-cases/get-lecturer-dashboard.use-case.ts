import {
  LecturerDashboardResponse,
  IDashboardRepository,
} from '../../domain/repositories/dashboard.repository.interface.js';

export { LecturerDashboardResponse };

export class GetLecturerDashboardUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  public async execute(lecturerId: string): Promise<LecturerDashboardResponse> {
    return this.dashboardRepository.getLecturerDashboard(lecturerId);
  }
}
