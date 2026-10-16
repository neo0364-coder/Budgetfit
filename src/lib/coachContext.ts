import { ALLERGEN_LABELS, RECIPE_BY_ID } from '../data/foods';
import { EXERCISE_BY_ID } from '../data/exercises';
import type { Allergen, ChatMessage, CoachContext, DayMeals, Difficulty, Profile, Targets, WorkoutSession } from '../types';

/**
 * AI 코치 서버가 받은 요청을 검사한다.
 * 브라우저가 보낸 값은 믿을 수 없으므로, 알려진 형태·범위로만 다시 만들어서
 * 시스템 프롬프트에 임의의 글이 들어가지 않게 한다.
 */

export class InvalidRequest extends Error {}

const MAX_TURNS = 40;
const MAX_USER_CHARS = 1000;
const MAX_ASSISTANT_CHARS = 6000;

type Json = Record<string, unknown>;

function obj(v: unknown, what: string): Json {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new InvalidRequest(`${what} 형식이 올바르지 않아요`);
  return v as Json;
}
function num(v: unknown, min: number, max: number, what: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max) throw new InvalidRequest(`${what} 값이 올바르지 않아요`);
  return v;
}
function oneOf<T extends string | number>(v: unknown, options: readonly T[], what: string): T {
  if (!options.includes(v as T)) throw new InvalidRequest(`${what} 값이 올바르지 않아요`);
  return v as T;
}
function time(v: unknown, what: string): string {
  if (typeof v !== 'string' || !/^\d\d:\d\d$/.test(v)) throw new InvalidRequest(`${what} 값이 올바르지 않아요`);
  return v;
}
function arr(v: unknown, max: number, what: string): unknown[] {
  if (!Array.isArray(v) || v.length > max) throw new InvalidRequest(`${what} 형식이 올바르지 않아요`);
  return v;
}

function cleanProfile(raw: unknown): Profile {
  const p = obj(raw, '프로필');
  const levels = [1, 2, 3] as const;
  return {
    name: typeof p.name === 'string' ? p.name.replace(/[\n\r`$<>{}]/g, '').slice(0, 12) : '',
    sex: oneOf(p.sex, ['male', 'female'] as const, '성별'),
    age: num(p.age, 10, 110, '나이'),
    heightCm: num(p.heightCm, 100, 250, '키'),
    weightKg: num(p.weightKg, 25, 300, '체중'),
    targetWeightKg: num(p.targetWeightKg, 25, 300, '목표 체중'),
    goal: oneOf(p.goal, ['lose', 'maintain', 'gain'] as const, '목표'),
    activity: oneOf(p.activity, ['sedentary', 'light', 'moderate', 'active'] as const, '활동량'),
    weeklyBudget: num(p.weeklyBudget, 0, 10_000_000, '예산'),
    mealsPerDay: oneOf(p.mealsPerDay, [2, 3] as const, '식사 횟수'),
    snacks: p.snacks === true,
    wakeTime: time(p.wakeTime, '기상 시간'),
    sleepTime: time(p.sleepTime, '취침 시간'),
    workoutDays: [...new Set(arr(p.workoutDays, 7, '운동 요일').map((d) => oneOf(d, [0, 1, 2, 3, 4, 5, 6] as const, '운동 요일')))],
    workoutMinutes: num(p.workoutMinutes, 5, 240, '운동 시간'),
    workoutTime: oneOf(p.workoutTime, ['morning', 'lunch', 'evening'] as const, '운동 시간대'),
    equipment: oneOf(p.equipment, ['none', 'dumbbell', 'gym'] as const, '장비'),
    workoutLevel: oneOf(p.workoutLevel, levels, '운동 난이도') as Difficulty,
    dietLevel: oneOf(p.dietLevel, levels, '식단 난이도') as Difficulty,
    exclude: arr(p.exclude, 10, '제외 식품').map((a) => oneOf(a, Object.keys(ALLERGEN_LABELS) as Allergen[], '제외 식품')),
  };
}

function cleanTargets(raw: unknown): Targets {
  const t = obj(raw, '목표');
  return {
    bmr: Math.round(num(t.bmr, 0, 10000, 'bmr')),
    tdee: Math.round(num(t.tdee, 0, 10000, 'tdee')),
    kcal: Math.round(num(t.kcal, 0, 10000, 'kcal')),
    proteinG: Math.round(num(t.proteinG, 0, 1000, '단백질')),
    carbsG: Math.round(num(t.carbsG, 0, 2000, '탄수화물')),
    fatG: Math.round(num(t.fatG, 0, 1000, '지방')),
    dailyBudget: Math.round(num(t.dailyBudget, 0, 10_000_000, '하루 예산')),
    weeklyChangeKg: num(t.weeklyChangeKg, -10, 10, '변화량'),
  };
}

function cleanDay(raw: unknown): DayMeals {
  const d = obj(raw, '식단');
  return {
    meals: arr(d.meals, 6, '식단').map((m) => {
      const x = obj(m, '식사');
      if (typeof x.recipeId !== 'string' || !RECIPE_BY_ID[x.recipeId]) throw new InvalidRequest('알 수 없는 메뉴예요');
      return {
        slot: oneOf(x.slot, ['breakfast', 'lunch', 'dinner', 'snack'] as const, '끼니'),
        recipeId: x.recipeId,
        time: time(x.time, '식사 시간'),
        portion: num(x.portion, 0.5, 2, '양'),
      };
    }),
    kcal: Math.round(num(d.kcal, 0, 10000, 'kcal')),
    protein: Math.round(num(d.protein, 0, 1000, '단백질')),
    cost: Math.round(num(d.cost, 0, 1_000_000, '비용')),
  };
}

function short(v: unknown, max: number, what: string): string {
  if (typeof v !== 'string' || v.length > max || /[\n\r`$<>{}]/.test(v)) throw new InvalidRequest(`${what} 값이 올바르지 않아요`);
  return v;
}

function cleanWorkout(raw: unknown): WorkoutSession {
  const w = obj(raw, '운동');
  return {
    day: oneOf(w.day, [0, 1, 2, 3, 4, 5, 6] as const, '운동 요일'),
    title: short(w.title, 20, '운동 이름'),
    time: time(w.time, '운동 시간'),
    minutes: num(w.minutes, 5, 240, '운동 시간'),
    warmup: short(w.warmup, 60, '워밍업'),
    cooldown: short(w.cooldown, 60, '마무리'),
    cardio: w.cardio === undefined ? undefined : short(w.cardio, 80, '유산소'),
    exercises: arr(w.exercises, 10, '운동 목록').map((e) => {
      const x = obj(e, '운동');
      if (typeof x.exerciseId !== 'string' || !EXERCISE_BY_ID[x.exerciseId]) throw new InvalidRequest('알 수 없는 운동이에요');
      return {
        exerciseId: x.exerciseId,
        sets: num(x.sets, 1, 10, '세트'),
        reps: short(x.reps, 20, '횟수'),
        restSec: num(x.restSec, 0, 600, '휴식'),
      };
    }),
  };
}

export function cleanContext(raw: unknown): CoachContext {
  const c = obj(raw, '요청');
  const plan = obj(c.plan, '플랜');
  const meals = arr(plan.meals, 7, '식단').map(cleanDay);
  if (meals.length !== 7) throw new InvalidRequest('식단은 7일이어야 해요');
  return {
    profile: cleanProfile(c.profile),
    targets: cleanTargets(c.targets),
    plan: {
      createdAt: typeof plan.createdAt === 'string' ? plan.createdAt.slice(0, 40) : '',
      weekStart: typeof plan.weekStart === 'string' ? plan.weekStart.slice(0, 10) : '',
      seed: typeof plan.seed === 'number' ? plan.seed : 0,
      meals,
      workouts: arr(plan.workouts, 7, '운동').map(cleanWorkout),
    },
  };
}

/** 대화 기록 검사: user/assistant가 번갈아 나오고 마지막은 user */
export function cleanMessages(raw: unknown): ChatMessage[] {
  const list = arr(raw, MAX_TURNS, '대화');
  if (list.length === 0) throw new InvalidRequest('질문이 비어 있어요');
  const out = list.map((m, i) => {
    const x = obj(m, '메시지');
    const role = oneOf(x.role, ['user', 'assistant'] as const, '역할');
    if (role !== (i % 2 === 0 ? 'user' : 'assistant')) throw new InvalidRequest('대화 순서가 올바르지 않아요');
    if (typeof x.text !== 'string') throw new InvalidRequest('메시지 형식이 올바르지 않아요');
    if (role === 'user') {
      if (!x.text.trim() || x.text.length > MAX_USER_CHARS) throw new InvalidRequest(`질문은 ${MAX_USER_CHARS}자까지 보낼 수 있어요`);
      return { role, text: x.text };
    }
    if (x.text.length > MAX_ASSISTANT_CHARS) throw new InvalidRequest('대화가 너무 길어요. 새 대화를 시작해 주세요');
    const blocks = x.blocks === undefined ? undefined : arr(x.blocks, 20, '응답');
    for (const b of blocks ?? []) {
      oneOf(obj(b, '응답').type, ['text', 'thinking', 'redacted_thinking', 'fallback'] as const, '응답 형식');
    }
    if (blocks && JSON.stringify(blocks).length > MAX_ASSISTANT_CHARS * 4) throw new InvalidRequest('대화가 너무 길어요. 새 대화를 시작해 주세요');
    return { role, text: x.text, blocks };
  });
  if (out[out.length - 1].role !== 'user') throw new InvalidRequest('마지막 메시지는 질문이어야 해요');
  return out;
}
