import type { Allergen, MealSlot } from '../types';

export interface Ingredient {
  name: string;
  /** 판매 단위 크기 (g, ml 또는 개) */
  packSize: number;
  unit: 'g' | 'ml' | '개';
  /** 판매 단위 가격(원) — 2026년 대형마트/온라인 평균가 기준 대략값 */
  packPrice: number;
  /** 냉동·건조·통조림처럼 일주일 안에 다 쓰지 않아도 되는 품목 */
  pantry?: boolean;
  allergens?: Allergen[];
}

export const INGREDIENTS: Record<string, Ingredient> = {
  rice: { name: '쌀(잡곡)', packSize: 10000, unit: 'g', packPrice: 34000, pantry: true },
  oats: { name: '오트밀', packSize: 1000, unit: 'g', packPrice: 6500, pantry: true },
  bread: { name: '통밀 식빵', packSize: 12, unit: '개', packPrice: 3800, allergens: ['gluten'] },
  pasta: { name: '파스타면', packSize: 500, unit: 'g', packPrice: 2500, pantry: true, allergens: ['gluten'] },
  egg: { name: '계란', packSize: 15, unit: '개', packPrice: 4900, allergens: ['egg'] },
  chickenBreast: { name: '냉동 닭가슴살', packSize: 1000, unit: 'g', packPrice: 10900, pantry: true },
  chickenThigh: { name: '닭다리살', packSize: 500, unit: 'g', packPrice: 6900 },
  pork: { name: '돼지 앞다리살', packSize: 600, unit: 'g', packPrice: 8900, allergens: ['pork'] },
  mackerel: { name: '냉동 손질 고등어', packSize: 400, unit: 'g', packPrice: 5900, pantry: true, allergens: ['seafood'] },
  tuna: { name: '참치캔(150g)', packSize: 1, unit: '개', packPrice: 2600, pantry: true, allergens: ['seafood'] },
  tofu: { name: '두부', packSize: 300, unit: 'g', packPrice: 1700, allergens: ['soy'] },
  soyMilk: { name: '두유(190ml)', packSize: 16, unit: '개', packPrice: 9900, pantry: true, allergens: ['soy'] },
  milk: { name: '우유', packSize: 1000, unit: 'ml', packPrice: 2900, allergens: ['dairy'] },
  yogurt: { name: '플레인 그릭요거트', packSize: 400, unit: 'g', packPrice: 4900, allergens: ['dairy'] },
  peanutButter: { name: '땅콩버터', packSize: 500, unit: 'g', packPrice: 6900, pantry: true, allergens: ['peanut'] },
  banana: { name: '바나나', packSize: 6, unit: '개', packPrice: 4200 },
  sweetPotato: { name: '고구마', packSize: 1000, unit: 'g', packPrice: 5500 },
  potato: { name: '감자', packSize: 1000, unit: 'g', packPrice: 4300 },
  cabbage: { name: '양배추(반 통)', packSize: 750, unit: 'g', packPrice: 2200 },
  onion: { name: '양파', packSize: 1500, unit: 'g', packPrice: 4200 },
  carrot: { name: '당근', packSize: 500, unit: 'g', packPrice: 2000 },
  spinach: { name: '시금치', packSize: 300, unit: 'g', packPrice: 2600 },
  beanSprout: { name: '콩나물', packSize: 300, unit: 'g', packPrice: 1400, allergens: ['soy'] },
  broccoli: { name: '브로콜리', packSize: 300, unit: 'g', packPrice: 2700 },
  mushroom: { name: '느타리버섯', packSize: 200, unit: 'g', packPrice: 1900 },
  kimchi: { name: '김치', packSize: 500, unit: 'g', packPrice: 4500 },
  tomatoSauce: { name: '토마토소스', packSize: 600, unit: 'g', packPrice: 4300, pantry: true },
};

/** 간장·고추장·기름 등 기본 양념 1회분 비용 */
export const SEASONING_COST = 120;

export interface Recipe {
  id: string;
  name: string;
  slots: MealSlot[];
  minutes: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** ingredientId -> 사용량(재료 단위 기준) */
  uses: Record<string, number>;
  steps: string[];
  /** 도시락으로 싸가기 좋은지 */
  portable?: boolean;
}

export const RECIPES: Recipe[] = [
  // 아침
  {
    id: 'oat-banana', name: '오트밀 바나나 우유볼', slots: ['breakfast'], minutes: 5,
    kcal: 420, protein: 16, carbs: 68, fat: 9,
    uses: { oats: 50, milk: 200, banana: 1 },
    steps: ['오트밀에 우유를 붓고 전자레인지 2분', '바나나를 썰어 올린다'],
  },
  {
    id: 'egg-toast', name: '양배추 계란 토스트', slots: ['breakfast'], minutes: 10,
    kcal: 410, protein: 19, carbs: 42, fat: 17,
    uses: { egg: 2, bread: 2, cabbage: 50 },
    steps: ['채 썬 양배추와 계란을 섞어 부친다', '구운 식빵 사이에 끼운다'],
    portable: true,
  },
  {
    id: 'yogurt-bowl', name: '그릭요거트 오트볼', slots: ['breakfast', 'snack'], minutes: 3,
    kcal: 330, protein: 17, carbs: 48, fat: 8,
    uses: { yogurt: 150, oats: 30, banana: 0.5 },
    steps: ['요거트에 오트밀과 바나나를 올린다'],
  },
  {
    id: 'pb-toast', name: '땅콩버터 바나나 토스트 + 두유', slots: ['breakfast'], minutes: 5,
    kcal: 560, protein: 20, carbs: 70, fat: 22,
    uses: { bread: 2, peanutButter: 20, banana: 1, soyMilk: 1 },
    steps: ['식빵을 굽고 땅콩버터를 바른다', '바나나를 올리고 두유와 함께'],
    portable: true,
  },
  {
    id: 'egg-sweetpotato', name: '삶은 계란 3개 + 고구마', slots: ['breakfast'], minutes: 3,
    kcal: 480, protein: 21, carbs: 62, fat: 15,
    uses: { egg: 3, sweetPotato: 200 },
    steps: ['주말에 계란·고구마를 한꺼번에 삶아 냉장 보관', '꺼내서 먹기만 하면 끝'],
    portable: true,
  },
  // 점심·저녁
  {
    id: 'chicken-cabbage-bowl', name: '닭가슴살 양배추 덮밥', slots: ['lunch', 'dinner'], minutes: 15,
    kcal: 600, protein: 45, carbs: 80, fat: 7,
    uses: { rice: 80, chickenBreast: 130, cabbage: 80, onion: 50 },
    steps: ['닭가슴살·양배추·양파를 간장 양념에 볶는다', '밥 위에 올린다'],
    portable: true,
  },
  {
    id: 'tofu-kimchi', name: '두부김치 + 밥', slots: ['lunch', 'dinner'], minutes: 15,
    kcal: 650, protein: 34, carbs: 78, fat: 21,
    uses: { tofu: 200, kimchi: 100, pork: 60, rice: 80 },
    steps: ['돼지고기와 김치를 볶는다', '데친 두부와 함께 밥과 곁들인다'],
  },
  {
    id: 'tuna-kimchi-rice', name: '참치 김치볶음밥', slots: ['lunch', 'dinner'], minutes: 10,
    kcal: 680, protein: 35, carbs: 78, fat: 23,
    uses: { tuna: 1, kimchi: 80, rice: 90, egg: 1 },
    steps: ['기름 뺀 참치와 김치를 볶다가 밥을 넣는다', '계란 프라이를 올린다'],
    portable: true,
  },
  {
    id: 'pork-bulgogi', name: '저지방 제육 덮밥', slots: ['lunch', 'dinner'], minutes: 20,
    kcal: 720, protein: 35, carbs: 82, fat: 26,
    uses: { pork: 120, onion: 60, cabbage: 60, rice: 90 },
    steps: ['앞다리살을 고추장 양념에 재운다', '양파·양배추와 함께 볶아 밥에 올린다'],
    portable: true,
  },
  {
    id: 'mackerel-set', name: '고등어구이 + 시금치나물 정식', slots: ['lunch', 'dinner'], minutes: 20,
    kcal: 640, protein: 33, carbs: 68, fat: 25,
    uses: { mackerel: 130, rice: 80, spinach: 100 },
    steps: ['고등어를 에어프라이어 180℃ 12분', '시금치를 데쳐 소금·참기름에 무친다'],
  },
  {
    id: 'thigh-veggie', name: '닭다리살 채소 오븐구이', slots: ['lunch', 'dinner'], minutes: 25,
    kcal: 600, protein: 38, carbs: 45, fat: 27,
    uses: { chickenThigh: 150, potato: 150, broccoli: 100, carrot: 50 },
    steps: ['재료를 한입 크기로 썰어 소금·후추·올리브유', '에어프라이어 200℃ 18분'],
    portable: true,
  },
  {
    id: 'sprout-gukbap', name: '콩나물국밥 + 계란', slots: ['lunch', 'dinner', 'breakfast'], minutes: 15,
    kcal: 520, protein: 22, carbs: 78, fat: 12,
    uses: { beanSprout: 150, egg: 2, rice: 80, kimchi: 50 },
    steps: ['콩나물을 끓여 국을 만든다', '밥을 말고 계란을 풀어 넣는다'],
  },
  {
    id: 'tomato-pasta', name: '닭가슴살 토마토 버섯 파스타', slots: ['lunch', 'dinner'], minutes: 20,
    kcal: 650, protein: 38, carbs: 95, fat: 10,
    uses: { pasta: 90, tomatoSauce: 120, mushroom: 70, chickenBreast: 80 },
    steps: ['면을 삶는다', '닭가슴살·버섯을 볶다 소스와 면을 넣는다'],
    portable: true,
  },
  {
    id: 'egg-spinach-rice', name: '계란 시금치 볶음밥', slots: ['lunch', 'dinner'], minutes: 10,
    kcal: 580, protein: 25, carbs: 70, fat: 20,
    uses: { rice: 80, egg: 3, spinach: 80, onion: 40 },
    steps: ['양파·시금치를 볶다 계란을 스크램블', '밥을 넣고 간장으로 간한다'],
    portable: true,
  },
  {
    id: 'tofu-steak', name: '두부 스테이크 + 양배추 샐러드', slots: ['lunch', 'dinner'], minutes: 15,
    kcal: 560, protein: 30, carbs: 63, fat: 20,
    uses: { tofu: 300, cabbage: 80, rice: 70 },
    steps: ['두부 물기를 빼고 노릇하게 굽는다', '간장 소스를 졸여 끼얹는다'],
  },
  {
    id: 'chicken-sp-box', name: '닭가슴살 고구마 도시락', slots: ['lunch', 'dinner'], minutes: 10,
    kcal: 450, protein: 37, carbs: 60, fat: 4,
    uses: { chickenBreast: 130, sweetPotato: 150, cabbage: 80, carrot: 40 },
    steps: ['닭가슴살과 고구마를 찐다(전자레인지 가능)', '채소와 함께 담는다'],
    portable: true,
  },
  {
    id: 'tofu-egg-jeon', name: '두부 계란 부침 + 밥', slots: ['lunch', 'dinner'], minutes: 15,
    kcal: 560, protein: 36, carbs: 58, fat: 20,
    uses: { tofu: 300, egg: 2, rice: 70, onion: 30 },
    steps: ['두부를 도톰하게 썰어 계란물을 입힌다', '노릇하게 부쳐 양념간장과 함께'],
  },
  {
    id: 'chicken-kimchi', name: '닭가슴살 김치볶음 + 밥', slots: ['lunch', 'dinner'], minutes: 10,
    kcal: 560, protein: 48, carbs: 70, fat: 8,
    uses: { chickenBreast: 150, kimchi: 80, onion: 40, rice: 80 },
    steps: ['닭가슴살을 깍둑 썰어 김치·양파와 볶는다', '밥과 함께 담는다'],
    portable: true,
  },
  {
    id: 'soy-egg-banana', name: '두유 + 삶은 계란 2개 + 바나나', slots: ['breakfast'], minutes: 1,
    kcal: 370, protein: 20, carbs: 45, fat: 13,
    uses: { soyMilk: 1, egg: 2, banana: 1 },
    steps: ['미리 삶아 둔 계란과 함께 들고 나간다'],
    portable: true,
  },
  // 간식
  {
    id: 'banana-milk', name: '바나나 + 우유', slots: ['snack'], minutes: 1,
    kcal: 230, protein: 8, carbs: 40, fat: 5, uses: { banana: 1, milk: 200 }, steps: ['그대로 먹는다'],
  },
  {
    id: 'boiled-eggs', name: '삶은 계란 2개', slots: ['snack'], minutes: 1,
    kcal: 150, protein: 12, carbs: 1, fat: 10, uses: { egg: 2 }, steps: ['미리 삶아 둔 계란'], portable: true,
  },
  {
    id: 'soymilk-sp', name: '두유 + 고구마', slots: ['snack'], minutes: 1,
    kcal: 230, protein: 8, carbs: 38, fat: 5, uses: { soyMilk: 1, sweetPotato: 100 }, steps: ['그대로 먹는다'], portable: true,
  },
  {
    id: 'pb-bread', name: '땅콩버터 식빵 1장', slots: ['snack'], minutes: 2,
    kcal: 190, protein: 7, carbs: 18, fat: 10, uses: { bread: 1, peanutButter: 15 }, steps: ['식빵에 땅콩버터를 바른다'], portable: true,
  },
];

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export function recipeCost(recipe: Recipe): number {
  let cost = recipe.slots.includes('snack') && recipe.slots.length === 1 ? 0 : SEASONING_COST;
  for (const [id, qty] of Object.entries(recipe.uses)) {
    const ing = INGREDIENTS[id];
    cost += (ing.packPrice / ing.packSize) * qty;
  }
  return Math.round(cost);
}

export function recipeAllergens(recipe: Recipe): Allergen[] {
  const set = new Set<Allergen>();
  for (const id of Object.keys(recipe.uses)) INGREDIENTS[id].allergens?.forEach((a) => set.add(a));
  return [...set];
}

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: '유제품',
  egg: '계란',
  seafood: '해산물',
  peanut: '땅콩',
  soy: '대두(콩)',
  pork: '돼지고기',
  gluten: '밀(글루텐)',
};
