export const XP_PER_LEVEL = 500;

export const calculateLevel = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getProgress = (xp: number) => ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

export const updateStreak = (lastActiveDate: any) => {
  if (!lastActiveDate) return { increment: true, reset: false };
  
  const last = lastActiveDate.toDate ? lastActiveDate.toDate() : new Date(lastActiveDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = new Date(last);
  lastDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
  
  if (diffDays === 1) return { increment: true, reset: false };
  if (diffDays > 1) return { increment: false, reset: true };
  return { increment: false, reset: false };
};
