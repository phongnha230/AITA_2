import type { RubricRuleInput } from '../../types/assignment.types';

export const buildReactGradingRubric = (
  structureRequirements: string,
  cleanCodeRequirements: string
): RubricRuleInput[] => [
  {
    criterionName: 'Cấu trúc & kiến trúc React',
    description: structureRequirements.trim(),
    maxPoints: 2,
    weight: 1,
    orderIndex: 1,
    criterionType: 'ALGORITHM',
  },
  {
    criterionName: 'Clean Code React',
    description: cleanCodeRequirements.trim(),
    maxPoints: 1,
    weight: 1,
    orderIndex: 2,
    criterionType: 'CLEAN_CODE',
  },
];
