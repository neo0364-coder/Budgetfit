import { CARDIO, EXERCISES, type Pattern } from '../data/exercises';
import type { Equipment, PlannedExercise, Profile, WorkoutSession } from '../types';
import { mealTimes } from './mealPlanner';
import { fromMinutes, toMinutes } from './time';

const EQUIP_RANK: Record<Equipment, number> = { none: 0, dumbbell: 1, gym: 2 };

type SessionKind = 'fullA' | 'fullB' | 'upper' | 'lower' | 'cardio';

const SESSION_PATTERNS: Record<Exclude<SessionKind, 'cardio'>, Pattern[]> = {
  fullA: ['squat', 'push', 'pull', 'hinge', 'core', 'lunge'],
  fullB: ['lunge', 'pull', 'push', 'hinge', 'core', 'squat'],
  upper: ['push', 'pull', 'push', 'pull', 'core', 'core'],
  lower: ['squat', 'hinge', 'lunge', 'core', 'hinge', 'squat'],
};

const SESSION_TITLES: Record<SessionKind, string> = {
  fullA: '전신 A',
  fullB: '전신 B',
  upper: '상체 + 코어',
  lower: '하체 + 코어',
  cardio: '유산소 + 회복',
};

function splitFor(days: number): SessionKind[] {
  if (days <= 3) return ['fullA', 'fullB', 'fullA'].slice(0, days) as SessionKind[];
  if (days === 4) return ['upper', 'lower', 'upper', 'lower'];
  return ['upper', 'lower', 'cardio', 'upper', 'lower', 'cardio', 'fullA'].slice(0, days) as SessionKind[];
}

function pickExercise(pattern: Pattern, profile: Profile, variant: number, used: Set<string>): string | null {
  const options = EXERCISES.filter(
    (e) =>
      e.pattern === pattern &&
      EQUIP_RANK[e.equipment] <= EQUIP_RANK[profile.equipment] &&
      (profile.level === 'intermediate' || !e.advanced) &&
      !used.has(e.id),
  ).sort((a, b) => EQUIP_RANK[b.equipment] - EQUIP_RANK[a.equipment]);
  if (options.length === 0) return null;
  return options[variant % options.length].id;
}

function workoutStart(profile: Profile): string {
  const meals = mealTimes(profile);
  if (profile.workoutTime === 'morning') return fromMinutes(toMinutes(profile.wakeTime) + 30);
  if (profile.workoutTime === 'lunch') return fromMinutes(toMinutes(meals.lunch) - profile.workoutMinutes - 10);
  return fromMinutes(toMinutes(meals.dinner) - profile.workoutMinutes - 20);
}

export function planWorkouts(profile: Profile, seed: number): WorkoutSession[] {
  const days = [...profile.workoutDays].sort((a, b) => a - b);
  const split = splitFor(days.length);
  const start = workoutStart(profile);
  const sets = profile.level === 'beginner' ? 3 : 4;
  const reps =
    profile.goal === 'gain' ? (profile.equipment === 'gym' ? '6~10회' : '10~15회') : profile.goal === 'lose' ? '12~15회' : '10~12회';
  const rest = profile.goal === 'gain' ? 90 : 60;
  const perExercise = (sets * (45 + rest)) / 60; // 분
  const main = Math.max(10, profile.workoutMinutes - 10);
  const strengthShare = profile.goal === 'lose' ? 0.7 : 0.9;
  const count = Math.min(6, Math.max(2, Math.floor((main * strengthShare) / perExercise)));
  const cardioMin = Math.round(main - count * perExercise);

  return days.map((day, i) => {
    const kind = split[i];
    const base = {
      day,
      title: SESSION_TITLES[kind],
      time: start,
      minutes: profile.workoutMinutes,
      warmup: '관절 돌리기 + 제자리 걷기 5분',
      cooldown: '하체·가슴·등 스트레칭 5분',
    };
    if (kind === 'cardio') {
      const options = CARDIO[profile.equipment];
      return {
        ...base,
        exercises: [
          { exerciseId: 'plank', sets: 3, reps: '30~45초', restSec: 30 },
          { exerciseId: 'dead-bug', sets: 3, reps: '10회(양쪽)', restSec: 30 },
        ],
        cardio: `${options[(seed + i) % options.length]} ${Math.max(15, main - 8)}분 (대화 가능한 강도)`,
      };
    }
    const used = new Set<string>();
    const exercises: PlannedExercise[] = [];
    for (const pattern of SESSION_PATTERNS[kind].slice(0, count)) {
      const id = pickExercise(pattern, profile, seed + i + exercises.length, used);
      if (!id) continue;
      used.add(id);
      const isCore = pattern === 'core';
      exercises.push({
        exerciseId: id,
        sets,
        reps: isCore ? (id.includes('plank') ? '30~45초' : '10회(양쪽)') : reps,
        restSec: isCore ? 30 : rest,
      });
    }
    const cardioOptions = CARDIO[profile.equipment];
    return {
      ...base,
      exercises,
      cardio: cardioMin >= 5 ? `${cardioOptions[(seed + i) % cardioOptions.length]} ${cardioMin}분` : undefined,
    };
  });
}
