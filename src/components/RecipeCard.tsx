import { useState } from 'react';
import { INGREDIENTS, RECIPE_BY_ID, recipeCost } from '../data/foods';
import { won } from '../lib/time';
import type { PlannedMeal } from '../types';

export const SLOT_LABELS = { breakfast: '아침', lunch: '점심', dinner: '저녁', snack: '간식' } as const;
const SLOT_EMOJI = { breakfast: '🍳', lunch: '🍱', dinner: '🍲', snack: '🍌' } as const;

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
    <article className={`recipe ${done ? 'done' : ''}`}>
      <div className="recipe-head">
        <span className="mission-emoji">{SLOT_EMOJI[meal.slot]}</span>
        <button className="mission-body" onClick={() => setOpen(!open)} aria-expanded={open}>
          <div className="mission-meta">
            {SLOT_LABELS[meal.slot]} · {meal.time}
          </div>
          <div className="mission-title">
            {r.name}
            {k !== 1 && <span className="muted small"> ×{k}</span>}
          </div>
          <div className="mission-meta">
            {Math.round(r.kcal * k)}kcal · 단백질 {Math.round(r.protein * k)}g · {won(recipeCost(r) * k)}
          </div>
        </button>
        {onToggle ? (
          <button className={`check ${done ? 'on' : ''}`} onClick={onToggle} aria-label={done ? '먹었음 취소' : '먹었어요'}>
            ✓
          </button>
        ) : (
          <span className={`chev ${open ? 'open' : ''}`} aria-hidden>
            ▶
          </span>
        )}
      </div>
      {open && (
        <div className="recipe-detail">
          <div className="chip-row">
            <span className="pill green">⏱ {r.minutes}분</span>
            {r.portable && <span className="pill sun">🥡 도시락 OK</span>}
            <span className="pill">
              탄 {Math.round(r.carbs * k)}g · 지 {Math.round(r.fat * k)}g
            </span>
          </div>
          <div>
            <b>🛒 재료</b>{' '}
            {Object.entries(r.uses)
              .map(([id, q]) => {
                const ing = INGREDIENTS[id];
                const amount = Math.round(q * k * 10) / 10;
                return `${ing.name.replace(/\(.*\)/, '')} ${amount}${ing.unit}`;
              })
              .join(', ')}
          </div>
          <div>
            <b>👩‍🍳 만드는 법</b>
            <ol className="steps">
              {r.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
          <a className="btn soft sm" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(r.name.split('+')[0].trim() + ' 레시피')}`} target="_blank" rel="noreferrer">
            ▶ 레시피 영상 찾아보기
          </a>
        </div>
      )}
    </article>
  );
}
