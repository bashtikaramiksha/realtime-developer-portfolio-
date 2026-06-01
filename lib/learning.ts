export interface SkillItem {
  id: string;
  skillName: string;
  progress: number;
  resourceUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculates the average progress completion percentage across all registered learning skills.
 */
export function calculateAverageProgress(skills: { progress: number }[]): number {
  if (!skills || skills.length === 0) return 0;
  const sum = skills.reduce((acc, curr) => acc + curr.progress, 0);
  return parseFloat((sum / skills.length).toFixed(1));
}

/**
 * Groups a collection of learning skills into standard developer milestones:
 * - Beginner: progress < 30%
 * - Intermediate: 30% to 70% (inclusive)
 * - Advanced: progress > 70%
 */
export function categorizeSkills(skills: { progress: number }[]) {
  const categories = { beginner: 0, intermediate: 0, advanced: 0 };
  
  skills.forEach(skill => {
    if (skill.progress < 30) {
      categories.beginner++;
    } else if (skill.progress <= 70) {
      categories.intermediate++;
    } else {
      categories.advanced++;
    }
  });
  
  return categories;
}
