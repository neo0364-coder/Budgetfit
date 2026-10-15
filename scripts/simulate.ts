// 여러 프로필로 식단을 생성해 예산·칼로리·단백질 달성도를 확인하는 스크립트
// 실행: npx tsx scripts/simulate.ts
import { DEFAULT_PROFILE } from '../src/components/Onboarding';
import { RECIPE_BY_ID } from '../src/data/foods';
import { planMeals, shoppingList, weeklySpend } from '../src/lib/mealPlanner';
import { computeTargets } from '../src/lib/nutrition';
import type { Profile } from '../src/types';

const cases: [string, Partial<Profile>][] = [
  ['기본(여 65kg 감량, 5만원)', {}],
  ['남 80kg 증량, 7만원', { sex: 'male', weightKg: 80, heightCm: 178, goal: 'gain', targetWeightKg: 85, weeklyBudget: 70000, activity: 'moderate' }],
  ['남 90kg 감량, 4만원, 2끼', { sex: 'male', weightKg: 90, heightCm: 175, goal: 'lose', targetWeightKg: 78, weeklyBudget: 40000, mealsPerDay: 2 }],
  ['여 55kg 유지, 3만원, 계란·유제품 제외', { weightKg: 55, goal: 'maintain', targetWeightKg: 55, weeklyBudget: 30000, exclude: ['egg', 'dairy'] }],
];

for (const [label, patch] of cases) {
  const p = { ...DEFAULT_PROFILE, ...patch } as Profile;
  const t = computeTargets(p);
  for (const seed of [1, 7920]) {
    const week = planMeals(p, t, seed);
    const spend = weeklySpend(shoppingList(week));
    const kcal = Math.round(week.reduce((s, d) => s + d.kcal, 0) / 7);
    const protein = Math.round(week.reduce((s, d) => s + d.protein, 0) / 7);
    const distinct = new Set(week.flatMap((d) => d.meals.map((m) => m.recipeId))).size;
    console.log(
      `${label} seed=${seed}: 장보기 ${spend}/${p.weeklyBudget}원, ${kcal}/${t.kcal}kcal, 단백질 ${protein}/${t.proteinG}g, 메뉴 ${distinct}종`,
    );
    if (seed === 1) console.log('   ', week.map((d) => d.meals.map((m) => RECIPE_BY_ID[m.recipeId].name).join(' / ')).join('\n    '));
  }
}
