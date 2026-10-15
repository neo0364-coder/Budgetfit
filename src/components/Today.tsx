import { won } from '../lib/time';
import type { Profile, Targets, WeekPlan } from '../types';
import RecipeCard from './RecipeCard';
import WorkoutCard from './WorkoutCard';

interface Props {
  profile: Profile;
  targets: Targets;
  plan: WeekPlan;
  dayIndex: number;
  done: string[];
  toggle: (key: string) => void;
}

export default function Today({ profile, targets, plan, dayIndex, done, toggle }: Props) {
  const day = plan.meals[dayIndex];
  const workout = plan.workouts.find((w) => w.day === dayIndex);
  const eaten = day.meals.filter((_, i) => done.includes(`meal-${i}`));
  const progress = day.meals.length ? eaten.length / day.meals.length : 0;
  const hour = new Date().getHours();
  const greet = hour < 11 ? '좋은 아침이에요' : hour < 17 ? '오늘도 화이팅' : '오늘 하루 수고했어요';

  return (
    <div className="page">
      <h1>
        {greet}
        {profile.name ? `, ${profile.name}님` : ''}
      </h1>

      <section className="card stats">
        <div>
          <div className="stat-value">{targets.kcal.toLocaleString('ko-KR')}</div>
          <div className="muted small">목표 kcal</div>
        </div>
        <div>
          <div className="stat-value">{targets.proteinG}g</div>
          <div className="muted small">단백질</div>
        </div>
        <div>
          <div className="stat-value">{won(day.cost)}</div>
          <div className="muted small">오늘 식재료비 / {won(targets.dailyBudget)}</div>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>오늘 식단</h2>
          <span className="muted small">
            {eaten.length}/{day.meals.length} 완료
          </span>
        </div>
        <div className="bar">
          <span style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="list">
          {day.meals.map((m, i) => (
            <RecipeCard key={i} meal={m} done={done.includes(`meal-${i}`)} onToggle={() => toggle(`meal-${i}`)} />
          ))}
        </div>
        <p className="muted small">
          합계 {day.kcal}kcal · 단백질 {day.protein}g
        </p>
      </section>

      {workout ? (
        <WorkoutCard session={workout} done={done.includes('workout')} onToggle={() => toggle('workout')} />
      ) : (
        <section className="card">
          <h2>오늘은 쉬는 날</h2>
          <p className="muted">가벼운 산책 20~30분과 스트레칭으로 회복하세요. 수면 {profile.sleepTime} 취침을 지키는 것도 운동입니다.</p>
        </section>
      )}
    </div>
  );
}
