export type JavaGradingProfile = 'PRO_OOP' | 'CSD_ALGORITHM' | 'JAVA_GENERAL';

export const resolveJavaGradingProfile = (courseCode: string | null | undefined): JavaGradingProfile => {
  const normalizedCode = courseCode?.trim().toUpperCase();

  if (normalizedCode === 'PRO192') return 'PRO_OOP';
  if (normalizedCode === 'CSD201') return 'CSD_ALGORITHM';
  return 'JAVA_GENERAL';
};
