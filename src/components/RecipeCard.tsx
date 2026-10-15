import { useState } from 'react';
import { INGREDIENTS, RECIPE_BY_ID, recipeCost } from '../data/foods';
import { won } from '../lib/time';
import type { PlannedMeal } from '../types';

export const SLOT_LABELS = { breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식' } as const;

interface Props {
  meal: PlannedMeal;
  done?: boolean;
  onToggle?: () => void;
}

export default function RecipeCard({ meal, done, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const r = RECIPE_BY_ID[meal.recipeId];
  const k = meal.portion;
  return (
    <article className={`item ${done ? 'done' : ''}`}>
      <div className="item-main">
        {onToggle && (
          <button className={`tick ${done ? 'on' : ''}`} onClick={onToggle} aria-label={done ? '완료 취소' : '완료'}>
            ✓
          </button>
        )}
        <button className="item-body" onClick={() => setOpen(!open)} aria-expanded={open}>
          <div className="item-top">
            <span className="tag">{SLOT_LABELS[meal.slot]}</span>
            <span className="muted small">{meal.time}</span>
            {r.portable && <span className="tag soft">도시락 OK</span>}
          </div>
          <div className="item-title">
            {r.name}
            {k !== 1 && <span className="muted small"> ×{k}인분</span>}
          </div>
          <div className="muted small">
            {Math.round(r.kcal * k)}kcal · 단백질 {Math.round(r.protein * k)}g · {won(recipeCost(r) * k)} · {r.minutes}분
          </div>
        </button>
      </div>
      {open && (
        <div className="item-detail">
          <div className="small">
            <b>재료</b>{' '}
            {Object.entries(r.uses)
              .map(([id, q]) => {
                const ing = INGREDIENTS[id];
                const amount = Math.round(q * k * 10) / 10;
                return `${ing.name.replace(/\(.*\)/, '')} ${amount}${ing.unit}`;
              })
              .join(', ')}
          </div>
          <ol className="small steps">
            {r.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="muted small">
            탄수화물 {Math.round(r.carbs * k)}g · 지방 {Math.round(r.fat * k)}g
          </div>
        </div>
      )}
    </article>
  );
}
