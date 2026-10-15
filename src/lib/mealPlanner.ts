import { INGREDIENTS, RECIPES, RECIPE_BY_ID, SEASONING_COST, recipeAllergens, recipeCost, type Recipe } from '../data/foods';
import type { DayMeals, MealSlot, PlannedMeal, Profile, Targets } from '../types';
import { awakeSpan, fromMinutes, rng, toMinutes } from './time';

function allowed(profile: Profile): Recipe[] {
  return RECIPES.filter((r) => !recipeAllergens(r).some((a) => profile.exclude.includes(a)));
}

/** 생활 패턴(기상·취침)에 맞춘 식사 시각 */
export function mealTimes(profile: Profile): Record<MealSlot, string> {
  const wake = toMinutes(profile.wakeTime);
  const span = awakeSpan(profile.wakeTime, profile.sleepTime);
  const lastMeal = wake + span - 180; // 취침 3시간 전까지 마무리
  if (profile.mealsPerDay === 2) {
    const first = wake + Math.min(150, span * 0.2);
    return {
      breakfast: fromMinutes(first),
      lunch: fromMinutes(first),
      dinner: fromMinutes(lastMeal),
      snack: fromMinutes((first + lastMeal) / 2),
    };
  }
  const breakfast = wake + 40;
  const dinner = Math.max(breakfast + 8 * 60, Math.min(lastMeal, wake + 12 * 60));
  const lunch = breakfast + Math.min(5 * 60, (dinner - breakfast) / 2);
  return {
    breakfast: fromMinutes(breakfast),
    lunch: fromMinutes(lunch),
    dinner: fromMinutes(dinner),
    snack: fromMinutes((lunch + dinner) / 2),
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * 7일 식단 생성.
 *
 * 실제 장보기는 팩 단위라서 "메뉴별 원가"를 더하는 방식으로는 예산을 지킬 수 없다
 * (재료 종류가 늘수록 남는 팩이 늘어난다). 그래서 일주일 전체를 한 번에 평가한다.
 *   - 일반 재료: 필요한 팩 수 × 팩 가격
 *   - 오래 보관 가능한 재료(pantry): 이번 주 사용량만큼
 * 점수 = 칼로리·단백질 오차 + 예산 초과 + 메뉴 반복 벌점
 * 무작위 식단에서 시작해 담금질 기법(simulated annealing)으로 한 끼씩 바꿔 가며
 * 점수가 낮은 주간 식단을 찾는다. 하루 양은 칼로리 목표에 맞춰 0.8~1.6인분으로 조절한다.
 */
export function planMeals(profile: Profile, targets: Targets, seed: number): DayMeals[] {
  const pool = allowed(profile);
  const times = mealTimes(profile);
  const random = rng(seed);
  const pick = <T,>(arr: T[]) => arr[Math.floor(random() * arr.length)];

  const slots: MealSlot[] =
    profile.mealsPerDay === 3 ? ['breakfast', 'lunch', 'dinner'] : ['lunch', 'dinner'];
  if (profile.snacks) slots.push('snack');
  // 각 끼니 자리에 올 수 있는 레시피 index (-1 = 간식 없음)
  const options = slots.map((slot) => {
    const ids = pool.map((r, i) => (r.slots.includes(slot === 'dinner' ? 'lunch' : slot) ? i : -1)).filter((i) => i >= 0);
    return slot === 'snack' ? [-1, ...ids] : ids;
  });
  if (options.some((o) => o.length === 0) || options.filter((_, i) => slots[i] !== 'snack').flat().length < 2) {
    return Array.from({ length: 7 }, () => ({ meals: [], kcal: 0, protein: 0, cost: 0 }));
  }

  const ingIds = Object.keys(INGREDIENTS);
  const ingIndex = new Map(ingIds.map((id, i) => [id, i]));
  const ings = ingIds.map((id) => INGREDIENTS[id]);
  const uses = pool.map((r) => Object.entries(r.uses).map(([id, q]) => [ingIndex.get(id)!, q] as const));

  // 시드마다 메뉴 선호를 조금씩 달리해서 "다시 짜기"를 누르면 다른 식단이 나오게 한다
  const taste = pool.map(() => random() * 0.08);

  const portionOf = (day: number[]) => {
    let base = 0;
    for (const r of day) if (r >= 0) base += pool[r].kcal;
    return Math.min(1.6, Math.max(0.8, round1(targets.kcal / base)));
  };

  const totals = new Float64Array(ings.length);
  const counts = new Int32Array(pool.length);
  const evaluate = (week: number[][]) => {
    totals.fill(0);
    counts.fill(0);
    let fit = 0;
    let cost = 0;
    let penalty = 0;
    for (let d = 0; d < 7; d++) {
      const day = week[d];
      const portion = portionOf(day);
      let kcal = 0;
      let protein = 0;
      for (let k = 0; k < day.length; k++) {
        const r = day[k];
        if (r < 0) continue;
        const m = slots[k] === 'snack' ? 1 : portion;
        kcal += pool[r].kcal * m;
        protein += pool[r].protein * m;
        cost += SEASONING_COST;
        for (const [i, q] of uses[r]) totals[i] += q * m;
        counts[r]++;
        penalty += taste[r];
        // 같은 날 같은 메뉴, 전날과 같은 메뉴
        for (let j = 0; j < k; j++) if (day[j] === r) penalty += 3;
        if (d > 0 && week[d - 1].includes(r)) penalty += 0.15;
      }
      fit += (Math.abs(kcal - targets.kcal) / targets.kcal) * 6 + (Math.max(0, targets.proteinG - protein) / targets.proteinG) * 14;
    }
    for (let i = 0; i < ings.length; i++) {
      if (totals[i] <= 0) continue;
      const ing = ings[i];
      cost += ing.pantry
        ? (ing.packPrice / ing.packSize) * totals[i]
        : Math.ceil(totals[i] / ing.packSize - 1e-9) * ing.packPrice;
    }
    for (const n of counts) if (n > 1) penalty += (n - 1) ** 1.5 * 0.1;
    const over = Math.max(0, cost - profile.weeklyBudget) / targets.dailyBudget;
    return fit / 7 + over * 5 + (cost / profile.weeklyBudget) * 0.5 + penalty;
  };

  let best: number[][] = [];
  let bestScore = Infinity;
  const iterations = 15000;
  // 국소 최적에 갇히지 않도록 여러 번 시작해서 가장 좋은 결과를 쓴다
  for (let restart = 0; restart < 6; restart++) {
    let week = Array.from({ length: 7 }, () => options.map((o) => pick(o)));
    let score = evaluate(week);
    for (let it = 0; it < iterations; it++) {
      const temp = 0.4 * (1 - it / iterations) + 0.002;
      const next = week.map((d) => d.slice());
      const d = Math.floor(random() * 7);
      const k = Math.floor(random() * slots.length);
      const move = random();
      if (move < 0.3) {
        // 다른 요일의 같은 끼니를 가져온다 → 재료 공유
        next[d][k] = week[Math.floor(random() * 7)][k];
      } else if (move < 0.45) {
        // 두 요일 맞바꾸기 → 연속 반복 줄이기
        const o = Math.floor(random() * 7);
        [next[d], next[o]] = [next[o], next[d]];
      } else {
        next[d][k] = pick(options[k]);
      }
      const s = evaluate(next);
      if (s < score || random() < Math.exp((score - s) / temp)) {
        week = next;
        score = s;
        if (s < bestScore) {
          best = next;
          bestScore = s;
        }
      }
    }
  }

  return best.map((day) => {
    const portion = portionOf(day);
    return summarize(
      day.flatMap((r, k) =>
        r < 0
          ? []
          : [{ slot: slots[k], recipeId: pool[r].id, time: times[slots[k]], portion: slots[k] === 'snack' ? 1 : portion }],
      ),
    );
  });
}

export function summarize(meals: PlannedMeal[]): DayMeals {
  let kcal = 0;
  let protein = 0;
  let cost = 0;
  for (const m of meals) {
    const r = RECIPE_BY_ID[m.recipeId];
    kcal += r.kcal * m.portion;
    protein += r.protein * m.portion;
    cost += recipeCost(r) * m.portion;
  }
  return { meals, kcal: Math.round(kcal), protein: Math.round(protein), cost: Math.round(cost) };
}

export interface ShoppingItem {
  id: string;
  name: string;
  needed: number;
  unit: string;
  packs: number;
  packLabel: string;
  cost: number;
  /** 이번 주 사용분만 계산한 금액 */
  usedCost: number;
  leftover: number;
  pantry: boolean;
}

export function shoppingList(week: DayMeals[]): ShoppingItem[] {
  const totals = new Map<string, number>();
  for (const day of week) {
    for (const m of day.meals) {
      const r = RECIPE_BY_ID[m.recipeId];
      for (const [id, qty] of Object.entries(r.uses)) {
        totals.set(id, (totals.get(id) ?? 0) + qty * m.portion);
      }
    }
  }
  const items: ShoppingItem[] = [];
  for (const [id, needed] of totals) {
    const ing = INGREDIENTS[id];
    const packs = Math.ceil(needed / ing.packSize - 1e-9);
    items.push({
      id,
      name: ing.name,
      needed: ing.unit === '개' ? Math.ceil(needed) : Math.round(needed / 10) * 10,
      unit: ing.unit,
      packs,
      packLabel: `${ing.packSize.toLocaleString('ko-KR')}${ing.unit}`,
      cost: packs * ing.packPrice,
      usedCost: Math.round((ing.packPrice / ing.packSize) * needed),
      leftover: packs * ing.packSize - needed,
      pantry: !!ing.pantry,
    });
  }
  return items.sort((a, b) => Number(a.pantry) - Number(b.pantry) || b.cost - a.cost);
}

/** 이번 주 실제 장보기 비용: 일반 재료는 팩 값, 오래 쓰는 품목은 사용분만 */
export function weeklySpend(items: ShoppingItem[], have: string[] = []): number {
  return items
    .filter((i) => !have.includes(i.id))
    .reduce((s, i) => s + (i.pantry ? i.usedCost : i.cost), 0);
}
