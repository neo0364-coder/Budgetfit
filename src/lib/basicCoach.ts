import { EXERCISES, EXERCISE_BY_ID } from '../data/exercises';
import { INGREDIENTS, RECIPES, RECIPE_BY_ID, recipeAllergens, recipeCost } from '../data/foods';
import type { CoachContext } from '../types';
import { DAY_LABELS, weekdayIndex, won } from './time';

/**
 * 인터넷·API 키 없이 동작하는 기본 코치.
 * 질문의 키워드로 의도를 고르고, 사용자의 이번 주 플랜 데이터로 답을 만든다.
 */
export function basicAnswer(question: string, ctx: CoachContext): string {
  const q = question.replace(/\s+/g, ' ').trim();
  const has = (...words: string[]) => words.some((w) => q.includes(w));
  const { profile, targets, plan } = ctx;
  const today = weekdayIndex(new Date());
  const allowed = RECIPES.filter((r) => !recipeAllergens(r).some((a) => profile.exclude.includes(a)));

  // 운동 방법
  const tokens = q.split(/[\s,?!.]+/).map((t) => t.replace(/(은|는|이|가|을|를|도|랑|하는|할|해)$/, '')).filter((t) => t.length >= 2);
  const ex =
    EXERCISES.find((e) => q.includes(e.name.replace(/\(.*\)/, '').trim())) ??
    (has('어떻게', '방법', '자세', '알려')
      ? EXERCISES.filter((e) => e.minLevel <= profile.workoutLevel).find((e) => tokens.some((t) => e.name.includes(t)))
      : undefined);
  if (ex) {
    return [
      `🏋️ ${ex.name} (${ex.muscles})`,
      '',
      ...ex.steps.map((s, i) => `${i + 1}. ${s}`),
      '',
      `⚠️ ${ex.mistakes.join(' / ')}`,
      '',
      '운동 탭에서 이 운동을 누르면 유튜브 자세 영상도 바로 볼 수 있어요.',
    ].join('\n');
  }

  // 통증·부상
  if (has('아파', '아픈', '통증', '부상', '시큰', '저려')) {
    const part = has('무릎') ? 'knee' : has('허리') ? 'back' : has('어깨') ? 'shoulder' : has('손목') ? 'wrist' : 'general';
    const tips: Record<string, string> = {
      knee: '무릎이 아프면 점프·런지·깊은 스쿼트는 쉬고, 글루트 브릿지·의자 스쿼트(얕게)·데드버그로 바꿔요. 걷기는 평지에서 천천히!',
      back: '허리가 아프면 데드리프트·슈퍼맨은 쉬고, 데드버그·무릎 플랭크·가벼운 걷기로 바꿔요. 무거운 걸 들 때는 무릎을 굽혀요.',
      shoulder: '어깨가 아프면 푸시업·숄더 프레스는 쉬고, 하체 운동과 데드버그 위주로 해요. 팔을 머리 위로 드는 동작은 피해요.',
      wrist: '손목이 아프면 푸시업·플랭크 대신 팔꿈치를 대는 무릎 플랭크, 하체 운동 위주로 바꿔요.',
      general: '아픈 동작은 바로 멈추고 그 부위를 쓰지 않는 운동으로 바꿔요. 걷기·스트레칭 위주로 하루 이틀 쉬어도 괜찮아요.',
    };
    return `😣 무리하지 마세요!\n\n${tips[part]}\n\n통증이 3일 넘게 가거나 붓기·저림이 있으면 꼭 병원(정형외과)에 가 보세요.`;
  }

  // 편의점
  if (has('편의점')) {
    return [
      '🏪 편의점 고단백 알뜰 조합 (2026년 대략 가격)',
      '',
      '• 삶은 계란 2개 + 바나나 우유 → 약 3,500원 · 단백질 18g',
      '• 닭가슴살 소시지 + 두유 → 약 4,000원 · 단백질 20g',
      '• 그릭요거트 + 삼각김밥 1개 → 약 4,500원 · 단백질 15g',
      '• 반숙란 2개 + 고구마 → 약 3,500원 · 단백질 13g',
      '',
      '💡 컵라면·튀김류는 피하고, 1+1 행사 상품을 노려요!',
    ].join('\n');
  }

  // 냉장고 재료로 메뉴 추천
  const mentioned = Object.entries(INGREDIENTS)
    .filter(([, ing]) => q.includes(ing.name.replace(/\(.*\)/, '').replace(/^(냉동|냉동 손질|플레인|통밀) /, '').trim()))
    .map(([id]) => id);
  if (mentioned.length > 0 && has('있', '남', '냉장고', '재료', '뭐 만들', '만들')) {
    const scored = allowed
      .map((r) => ({ r, hit: Object.keys(r.uses).filter((id) => mentioned.includes(id)).length }))
      .filter((x) => x.hit > 0)
      .sort((a, b) => b.hit - a.hit || recipeCost(a.r) - recipeCost(b.r))
      .slice(0, 3);
    if (scored.length) {
      return [
        '🧑‍🍳 가진 재료로 만들 수 있는 메뉴예요',
        '',
        ...scored.map(({ r }) => `• ${r.name} — ${r.kcal}kcal · 단백질 ${r.protein}g · 약 ${won(recipeCost(r))} · ${r.minutes}분\n  ${r.steps.join(' → ')}`),
      ].join('\n');
    }
  }

  // 식비 절약
  if (has('식비', '돈', '저렴', '절약', '아끼', '싸게', '비싸', '예산')) {
    const counts = new Map<string, number>();
    plan.meals.forEach((d) => d.meals.forEach((m) => counts.set(m.recipeId, (counts.get(m.recipeId) ?? 0) + 1)));
    const priciest = [...counts.entries()]
      .map(([id, n]) => ({ r: RECIPE_BY_ID[id], spend: recipeCost(RECIPE_BY_ID[id]) * n }))
      .sort((a, b) => b.spend - a.spend)[0];
    const slot = priciest.r.slots.find((s) => s !== 'snack') ?? 'snack';
    const cheaper = allowed
      .filter((r) => r.slots.includes(slot) && recipeCost(r) < recipeCost(priciest.r) && r.protein >= priciest.r.protein * 0.8)
      .sort((a, b) => recipeCost(a) - recipeCost(b))[0];
    return [
      `💰 이번 주 식비가 가장 많이 드는 메뉴는 "${priciest.r.name}"(1회 약 ${won(recipeCost(priciest.r))})예요.`,
      cheaper ? `→ "${cheaper.name}"(약 ${won(recipeCost(cheaper))}, 단백질 ${cheaper.protein}g)로 바꾸면 더 아낄 수 있어요.` : '',
      '',
      '알뜰 팁',
      '• 닭가슴살은 1kg 냉동 대용량이 100g당 1,100원대로 제일 싸요',
      '• 두부·계란·콩나물은 가성비 최고 단백질 식재료예요',
      '• 마감 할인(저녁 8시 이후) 채소·고기를 노려요',
      '• 장보기 목록에서 집에 있는 재료를 체크하면 금액이 빠져요',
      '',
      '식단 탭에서 "다시 짜기"를 누르면 예산 안에서 새 조합을 찾아 드려요.',
    ]
      .filter((l, i, a) => l || a[i - 1])
      .join('\n');
  }

  // 바쁜 날·못 한 날
  if (has('야근', '바빠', '바쁘', '시간 없', '시간이 없', '못 했', '못했', '빠졌', '빼먹')) {
    return [
      '⏱ 바쁜 날엔 10분 미니 루틴!',
      '',
      '1. 의자 스쿼트 15회',
      '2. 벽 푸시업 10회',
      '3. 글루트 브릿지 15회',
      '4. 무릎 플랭크 30초',
      '→ 2바퀴 돌리면 약 10분이에요.',
      '',
      '운동을 한 번 빠져도 괜찮아요. 다음 운동일에 평소대로 하면 되고, 몰아서 두 번 하지는 않아요. 식단은 편의점 고단백 조합으로 버텨요 💪',
    ].join('\n');
  }

  // 동기부여
  if (has('힘들', '포기', '의욕', '귀찮', '하기 싫', '우울', '지쳐', '동기')) {
    return [
      '🫶 그런 날도 있어요. 정말 잘하고 있어요!',
      '',
      '• 오늘 목표를 "운동복 입기"나 "10분 걷기"로 확 낮춰 봐요. 시작하면 생각보다 더 하게 돼요.',
      '• 운동 난이도를 "쉬움"으로 바꿔도 괜찮아요. 꾸준함이 강도보다 중요해요.',
      '• 지금까지 해낸 기록은 내 정보 탭의 배지에서 확인할 수 있어요 🏅',
      '',
      '완벽하지 않아도 계속하는 사람이 결국 이겨요!',
    ].join('\n');
  }

  // 체중 정체
  if (has('정체', '안 빠', '안빠', '그대로', '늘었', '쪘')) {
    return [
      '⚖️ 체중은 하루에도 1~2kg씩 오르내려요. 1~2주 평균으로 봐요!',
      '',
      '• 아침 공복, 화장실 다녀온 뒤 같은 시간에 재요',
      '• 2주 넘게 그대로면: 간식 1개 빼기, 하루 걷기 20분 추가',
      `• 지금 목표: 하루 ${targets.kcal}kcal · 단백질 ${targets.proteinG}g`,
      '• 잠이 부족하면 식욕이 늘어요. 7시간 이상 자요',
      '',
      '근육이 늘면 몸무게는 그대로여도 몸이 달라져요. 허리둘레도 같이 재 보세요!',
    ].join('\n');
  }

  // 단백질
  if (has('단백질', '프로틴')) {
    const avg = Math.round(plan.meals.reduce((s, d) => s + d.protein, 0) / 7);
    return [
      `🥚 하루 단백질 목표는 ${targets.proteinG}g, 이번 주 식단은 평균 ${avg}g이에요.`,
      avg < targets.proteinG ? `→ 하루 ${targets.proteinG - avg}g 정도 더 챙기면 좋아요.` : '→ 잘 챙기고 있어요! 👍',
      '',
      '싸고 좋은 단백질 (2026년 대략 가격)',
      '• 냉동 닭가슴살 100g ≈ 1,100원 → 23g',
      '• 두부 반 모(150g) ≈ 850원 → 12g',
      '• 계란 2개 ≈ 650원 → 12g',
      '• 두유 1팩 ≈ 620원 → 6g',
    ].join('\n');
  }

  // 오늘 식단·운동
  if (has('오늘', '뭐 먹', '메뉴', '저녁', '점심', '아침')) {
    const d = plan.meals[today];
    const w = plan.workouts.find((x) => x.day === today);
    return [
      `📅 오늘(${DAY_LABELS[today]}요일) 플랜이에요`,
      '',
      ...d.meals.map((m) => `• ${m.time} ${RECIPE_BY_ID[m.recipeId].name}`),
      '',
      w ? `💪 ${w.time} ${w.title}: ${w.exercises.map((e) => EXERCISE_BY_ID[e.exerciseId].name).join(', ')}` : '😌 오늘은 쉬는 날이에요. 가볍게 걸어요!',
      '',
      '메뉴를 바꾸고 싶으면 "계란이랑 두부 있어"처럼 가진 재료를 알려 주세요.',
    ].join('\n');
  }

  // 수면·물
  if (has('잠', '수면', '물')) {
    return '💧 물은 하루 1.5~2L(몸무게×30ml)를 조금씩 나눠 마셔요.\n😴 잠은 7~8시간! 자기 1시간 전에는 휴대폰을 내려놓으면 더 잘 자요. 잠이 부족하면 식욕이 늘고 근육 회복이 느려져요.';
  }

  return [
    '🤖 저는 이런 걸 도와드릴 수 있어요!',
    '',
    '• "식비 더 줄이고 싶어" — 비싼 메뉴 바꾸기',
    '• "계란이랑 두부 있어" — 가진 재료로 메뉴 추천',
    '• "편의점에서 뭐 먹지?" — 고단백 조합',
    '• "무릎이 아파" — 대체 운동',
    '• "야근이라 못 했어" — 10분 루틴',
    '• "스쿼트 어떻게 해?" — 운동 방법',
    '• "살이 안 빠져" / "단백질 부족해?" / "의욕이 없어"',
  ].join('\n');
}
