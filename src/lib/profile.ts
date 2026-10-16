import type { Difficulty, Profile } from '../types';

export const APP_NAME = '알뜰핏';

export const DEFAULT_PROFILE: Profile = {
  name: '',
  sex: 'female',
  age: 30,
  heightCm: 165,
  weightKg: 65,
  targetWeightKg: 60,
  goal: 'lose',
  activity: 'light',
  weeklyBudget: 50000,
  mealsPerDay: 3,
  snacks: true,
  wakeTime: '07:00',
  sleepTime: '23:30',
  workoutDays: [0, 2, 4],
  workoutMinutes: 30,
  workoutTime: 'evening',
  equipment: 'none',
  workoutLevel: 1,
  dietLevel: 2,
  exclude: [],
};

export const WORKOUT_LEVELS: Record<Difficulty, { label: string; emoji: string; desc: string }> = {
  1: { label: '쉬움', emoji: '🌱', desc: '처음이거나 오랜만이에요' },
  2: { label: '보통', emoji: '🔥', desc: '꾸준히 해 본 적 있어요' },
  3: { label: '도전', emoji: '⚡', desc: '강하게 해 보고 싶어요' },
};

export const DIET_LEVELS: Record<Difficulty, { label: string; emoji: string; desc: string }> = {
  1: { label: '쉬움', emoji: '🍙', desc: '간단한 요리 · 여유 있는 칼로리' },
  2: { label: '보통', emoji: '🥗', desc: '균형 잡힌 기본 식단' },
  3: { label: '도전', emoji: '🥊', desc: '빠듯한 칼로리 · 고단백' },
};

/** 예전 버전에 저장된 프로필도 새 필드를 채워서 쓴다 */
export function normalizeProfile(raw: Profile & { level?: 'beginner' | 'intermediate' }): Profile {
  const { level, ...rest } = raw;
  return {
    ...DEFAULT_PROFILE,
    ...rest,
    workoutLevel: rest.workoutLevel ?? (level === 'intermediate' ? 3 : level === 'beginner' ? 2 : 1),
    dietLevel: rest.dietLevel ?? 2,
  };
}
