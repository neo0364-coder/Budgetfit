export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active';
export type Equipment = 'none' | 'dumbbell' | 'gym';
export type Level = 'beginner' | 'intermediate';
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
  level: Level;
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
}

export interface Conversation {
  /** 대화 시작 시점에 고정한 시스템 프롬프트 */
  system: string;
  planStamp: string;
  messages: ChatMessage[];
}
