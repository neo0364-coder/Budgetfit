import { RECIPE_BY_ID, ALLERGEN_LABELS } from '../data/foods';
import { EXERCISE_BY_ID, EQUIPMENT_LABELS } from '../data/exercises';
import type { Profile, Targets, WeekPlan } from '../types';
import { ACTIVITY_LABELS } from './nutrition';
import { DAY_LABELS, won } from './time';

const GOAL_LABEL = { lose: '체중 감량', maintain: '유지·체력 향상', gain: '근육 증가' } as const;

/** 대화 시작 시 한 번 만들어 고정하는 시스템 프롬프트 */
export function buildSystemPrompt(profile: Profile, targets: Targets, plan: WeekPlan): string {
  const meals = plan.meals
    .map((d, i) => {
      const items = d.meals.map((m) => `${m.time} ${RECIPE_BY_ID[m.recipeId].name}${m.portion !== 1 ? ` x${m.portion}` : ''}`);
      return `- ${DAY_LABELS[i]}: ${items.join(' / ')} (${d.kcal}kcal, 단백질 ${d.protein}g, ${won(d.cost)})`;
    })
    .join('\n');
  const workouts = plan.workouts
    .map((w) => {
      const ex = w.exercises.map((e) => `${EXERCISE_BY_ID[e.exerciseId].name} ${e.sets}x${e.reps}`).join(', ');
      return `- ${DAY_LABELS[w.day]} ${w.time} ${w.title}: ${ex}${w.cardio ? ` + ${w.cardio}` : ''}`;
    })
    .join('\n');

  return `당신은 "BudgetFit"의 AI 건강 코치입니다. 사용자의 예산, 목표, 생활 패턴 안에서 실천 가능한 운동과 저렴한 식단을 함께 설계합니다.

원칙:
- 한국어로, 짧고 구체적으로 답합니다. 메뉴·재료·가격(원)·시간·세트/횟수처럼 바로 실행할 수 있는 숫자를 제시합니다.
- 식단 제안은 사용자의 하루 예산과 한국 마트에서 쉽게 살 수 있는 재료를 기준으로 하고, 제외 식품은 절대 포함하지 않습니다.
- 운동은 사용자의 장비·시간·수준에 맞추고, 통증이 있으면 해당 동작을 중단하고 대체 동작을 제시합니다.
- 의학적 진단을 하지 않습니다. 질환, 임신, 섭식장애 징후, 급격한 체중 변화, 흉통·어지럼 같은 증상이 언급되면 전문가 상담을 권합니다. 하루 섭취량을 기초대사량 아래로 낮추라고 권하지 않습니다.

사용자 프로필:
- 이름: ${profile.name || '사용자'} / ${profile.sex === 'male' ? '남성' : '여성'} ${profile.age}세, ${profile.heightCm}cm, ${profile.weightKg}kg → 목표 ${profile.targetWeightKg}kg (${GOAL_LABEL[profile.goal]})
- 활동량: ${ACTIVITY_LABELS[profile.activity]}
- 생활 패턴: 기상 ${profile.wakeTime}, 취침 ${profile.sleepTime}, 하루 ${profile.mealsPerDay}끼${profile.snacks ? ' + 간식' : ''}
- 운동: ${profile.workoutDays.map((d) => DAY_LABELS[d]).join('·')}요일, 회당 ${profile.workoutMinutes}분, ${EQUIPMENT_LABELS[profile.equipment]}, ${profile.level === 'beginner' ? '초보' : '중급'}
- 식비 예산: 주 ${won(profile.weeklyBudget)} (하루 약 ${won(targets.dailyBudget)})
- 제외 식품: ${profile.exclude.length ? profile.exclude.map((a) => ALLERGEN_LABELS[a]).join(', ') : '없음'}

계산된 목표: 하루 ${targets.kcal}kcal (기초대사량 ${targets.bmr}, 활동대사량 ${targets.tdee}), 단백질 ${targets.proteinG}g, 탄수화물 ${targets.carbsG}g, 지방 ${targets.fatG}g

이번 주 식단:
${meals}

이번 주 운동:
${workouts}`;
}
