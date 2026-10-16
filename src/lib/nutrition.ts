import type { Activity, Profile, Targets } from '../types';

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  sedentary: '거의 앉아서 생활',
  light: '가벼운 활동(주 1~3회 걷기)',
  moderate: '보통(서서 일하거나 주 3~5회 운동)',
  active: '활동적(육체 노동·매일 운동)',
};

/** Mifflin-St Jeor 기초대사량 */
export function bmr(p: Pick<Profile, 'sex' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return p.sex === 'male' ? base + 5 : base - 161;
}

export function computeTargets(p: Profile): Targets {
  const b = bmr(p);
  // 계획된 운동은 활동량에 이미 일부 포함된다고 보고, 주 3회 이상이면 한 단계 보정
  let factor = ACTIVITY_FACTOR[p.activity];
  if (p.workoutDays.length >= 3 && p.activity === 'sedentary') factor = ACTIVITY_FACTOR.light;
  const tdee = b * factor;

  // 식단 난이도: 쉬움일수록 칼로리 조절 폭이 작다
  const level = p.dietLevel ?? 2;
  let kcal = tdee;
  if (p.goal === 'lose') kcal = tdee * [0.9, 0.8, 0.75][level - 1];
  if (p.goal === 'gain') kcal = tdee * [1.05, 1.1, 1.15][level - 1];
  const floor = p.sex === 'male' ? 1500 : 1200;
  kcal = Math.max(kcal, floor, b);
  kcal = Math.round(kcal / 10) * 10;

  const proteinPerKg = (p.goal === 'maintain' ? [1.2, 1.4, 1.6] : [1.4, 1.6, 1.8])[level - 1];
  const proteinG = Math.round(p.weightKg * proteinPerKg);
  const fatG = Math.round((kcal * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));

  // 지방 1kg ≈ 7,700kcal
  const weeklyChangeKg = Math.round((((kcal - tdee) * 7) / 7700) * 100) / 100;

  return {
    bmr: Math.round(b),
    tdee: Math.round(tdee),
    kcal,
    proteinG,
    carbsG,
    fatG,
    dailyBudget: Math.round(p.weeklyBudget / 7),
    weeklyChangeKg,
  };
}

export function bmi(p: Pick<Profile, 'weightKg' | 'heightCm'>): number {
  const m = p.heightCm / 100;
  return Math.round((p.weightKg / (m * m)) * 10) / 10;
}

/** 목표 체중까지 예상 주 수 (유지 목표나 방향이 다르면 null) */
export function weeksToGoal(p: Profile, t: Targets): number | null {
  const diff = p.targetWeightKg - p.weightKg;
  if (Math.abs(diff) < 0.5 || t.weeklyChangeKg === 0) return null;
  if (Math.sign(diff) !== Math.sign(t.weeklyChangeKg)) return null;
  return Math.ceil(diff / t.weeklyChangeKg);
}
