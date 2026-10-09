import {
  StudentPortfolioResponse,
  IDashboardRepository,
} from '../../domain/repositories/dashboard.repository.interface.js';

export { StudentPortfolioResponse };

export class GetStudentPortfolioUseCase {
  constructor(private readonly dashboardRepository: IDashboardRepository) {}

  public async execute(userId: string): Promise<StudentPortfolioResponse> {
    return this.dashboardRepository.getStudentPortfolio(userId);
  }
}
