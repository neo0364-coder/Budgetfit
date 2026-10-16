export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active';
export type Equipment = 'none' | 'dumbbell' | 'gym';
/** 난이도: 1 쉬움, 2 보통, 3 도전 */
export type Difficulty = 1 | 2 | 3;
export type WorkoutTime = 'morning' | 'lunch' | 'evening';
export type Allergen = 'dairy' | 'egg' | 'seafood' | 'peanut' | 'soy' | 'pork' | 'gluten';

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  goal: Goal;
  activity: Activity;
  /** 1주 식비 예산(원) */
  weeklyBudget: number;
  mealsPerDay: 2 | 3;
  snacks: boolean;
  wakeTime: string; // "07:00"
  sleepTime: string; // "23:30"
  /** 0=월 ... 6=일 */
  workoutDays: number[];
  workoutMinutes: number;
  workoutTime: WorkoutTime;
  equipment: Equipment;
  /** 운동 난이도 */
  workoutLevel: Difficulty;
  /** 식단 난이도 (칼로리 조절 폭, 조리 난이도) */
  dietLevel: Difficulty;
  exclude: Allergen[];
}

export interface Targets {
  bmr: number;
  tdee: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  dailyBudget: number;
  weeklyChangeKg: number;
}

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlannedMeal {
  slot: MealSlot;
  recipeId: string;
  time: string;
  /** 1인분 대비 양 (0.8 ~ 1.6) */
  portion: number;
}

export interface DayMeals {
  meals: PlannedMeal[];
  kcal: number;
  protein: number;
  cost: number;
}

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  restSec: number;
}

export interface WorkoutSession {
  day: number;
  title: string;
  time: string;
  minutes: number;
  warmup: string;
  exercises: PlannedExercise[];
  cardio?: string;
  cooldown: string;
}

export interface WeekPlan {
  createdAt: string;
  weekStart: string; // YYYY-MM-DD (월요일)
  seed: number;
  meals: DayMeals[]; // 7일
  workouts: WorkoutSession[];
}

export interface WeightEntry {
  date: string;
  kg: number;
}

/** date -> 완료한 항목 키 목록 (예: "meal-0", "workout") */
export type Checklist = Record<string, string[]>;

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  /** assistant 응답의 원본 content 블록 (다음 요청에 그대로 다시 보냄) */
  blocks?: unknown[];
  /** 기본 코치가 답한 대화 (AI에는 보내지 않음) */
  local?: boolean;
}

/** 코치가 참고하는 사용자 정보 (대화 시작 시점에 고정) */
export interface CoachContext {
  profile: Profile;
  targets: Targets;
  plan: WeekPlan;
}

export interface Conversation {
  context: CoachContext;
  planStamp: string;
  messages: ChatMessage[];
}
