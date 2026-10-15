import { useMemo, useState } from 'react';
import { shoppingList, weeklySpend } from '../lib/mealPlanner';
import { DAY_LABELS, won } from '../lib/time';
import type { Targets, WeekPlan } from '../types';
import RecipeCard from './RecipeCard';

interface Props {
  plan: WeekPlan;
  targets: Targets;
  today: number;
  weeklyBudget: number;
  onRegenerate: () => void;
}

export default function Meals({ plan, targets, today, weeklyBudget, onRegenerate }: Props) {
  const [view, setView] = useState<'plan' | 'shop'>('plan');
  const [day, setDay] = useState(today);
  const [have, setHave] = useState<string[]>([]);
  const items = useMemo(() => shoppingList(plan.meals), [plan.meals]);
  const weekCost = weeklySpend(items);
  const buyTotal = weeklySpend(items, have);
  const pantryFirstBuy = items.filter((i) => i.pantry && !have.includes(i.id)).reduce((s, i) => s + i.cost, 0);
  const d = plan.meals[day];
  const avgProtein = Math.round(plan.meals.reduce((s, x) => s + x.protein, 0) / 7);

  return (
    <div className="page">
      <div className="section-head">
        <h1>식단</h1>
        <button className="btn ghost sm" onClick={onRegenerate}>
          다른 메뉴로 다시 짜기
        </button>
      </div>

      <section className="card stats">
        <div>
          <div className={`stat-value ${weekCost > weeklyBudget ? 'warn' : ''}`}>{won(weekCost)}</div>
          <div className="muted small">이번 주 장보기 / 예산 {won(weeklyBudget)}</div>
        </div>
        <div>
          <div className="stat-value">{avgProtein}g</div>
          <div className="muted small">평균 단백질 / {targets.proteinG}g</div>
        </div>
      </section>
      {avgProtein < targets.proteinG * 0.85 && (
        <p className="notice">
          예산 안에서 단백질이 목표보다 하루 {targets.proteinG - avgProtein}g 부족해요. 닭가슴살 100g(약 1,100원, 단백질 23g)이나 두부
          반 모(약 850원, 단백질 12g)를 추가하면 채울 수 있어요.
        </p>
      )}
      {weekCost > weeklyBudget && (
        <p className="notice">이 예산으로는 목표 칼로리·단백질을 모두 채우기 어려워 예산을 조금 넘었어요. 예산을 늘리거나 AI 코치에게 더 저렴한 대안을 물어보세요.</p>
      )}

      <div className="seg wide">
        <button className={view === 'plan' ? 'on' : ''} onClick={() => setView('plan')}>
          요일별 식단
        </button>
        <button className={view === 'shop' ? 'on' : ''} onClick={() => setView('shop')}>
          장보기 목록
        </button>
      </div>

      {view === 'plan' ? (
        <>
          <div className="days">
            {DAY_LABELS.map((label, i) => (
              <button key={label} className={`${day === i ? 'on' : ''} ${today === i ? 'today' : ''}`} onClick={() => setDay(i)}>
                {label}
              </button>
            ))}
          </div>
          <section className="card">
            <div className="section-head">
              <h2>{DAY_LABELS[day]}요일</h2>
              <span className="muted small">
                {d.kcal}kcal · 단백질 {d.protein}g · {won(d.cost)}
              </span>
            </div>
            <div className="list">
              {d.meals.map((m, i) => (
                <RecipeCard key={i} meal={m} />
              ))}
            </div>
          </section>
          <p className="muted small">팁: 주말에 고구마·계란·닭가슴살을 한꺼번에 삶아 두면 평일 조리 시간이 10분 이내로 줄어요.</p>
        </>
      ) : (
        <section className="card">
          <div className="section-head">
            <h2>이번 주 장보기</h2>
            <span className="stat-value sm">{won(buyTotal)}</span>
          </div>
          <p className="muted small">
            이미 집에 있는 재료는 체크하면 금액에서 빠져요. ★ 표시(쌀·오트밀 등)는 몇 주씩 쓰는 품목이라 이번 주 사용분만 합계에 넣었어요
            {pantryFirstBuy > 0 && ` — 처음 한 번은 ${won(pantryFirstBuy)}가 더 들어요`}.
          </p>
          <ul className="shop">
            {items.map((i) => (
              <li key={i.id} className={have.includes(i.id) ? 'have' : ''}>
                <label>
                  <input
                    type="checkbox"
                    checked={have.includes(i.id)}
                    onChange={() => setHave(have.includes(i.id) ? have.filter((x) => x !== i.id) : [...have, i.id])}
                  />
                  <span className="shop-name">
                    {i.pantry && '★ '}
                    {i.name}
                    <span className="muted small">
                      {' '}
                      필요 {i.needed.toLocaleString('ko-KR')}
                      {i.unit} → {i.packLabel} × {i.packs}
                      {!i.pantry && i.leftover > 0 && ` (남는 양 ${Math.round(i.leftover).toLocaleString('ko-KR')}${i.unit})`}
                    </span>
                  </span>
                  <span className="shop-cost">
                    {won(i.pantry ? i.usedCost : i.cost)}
                    {i.pantry && <span className="muted small"> / {won(i.cost)}</span>}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="muted small">가격은 2026년 대형마트·온라인 평균 기준 추정치예요. 할인 상품으로 바꾸면 더 아낄 수 있어요.</p>
        </section>
      )}
    </div>
  );
}
