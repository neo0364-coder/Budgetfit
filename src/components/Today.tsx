import { dailyMessage, greeting } from '../lib/motivation';
import { won } from '../lib/time';
import type { Profile, Targets, WeekPlan } from '../types';
import RecipeCard from './RecipeCard';
import { ProgressRing } from './ui';
import WorkoutCard from './WorkoutCard';

interface Props {
  profile: Profile;
  targets: Targets;
  plan: WeekPlan;
  dayIndex: number;
  done: string[];
  toggle: (key: string) => void;
  streak: number;
  weekStats: { workouts: number; workoutsPlanned: number; meals: number; mealsPlanned: number };
}

export default function Today({ profile, targets, plan, dayIndex, done, toggle, streak, weekStats }: Props) {
  const day = plan.meals[dayIndex];
  const workout = plan.workouts.find((w) => w.day === dayIndex);
  const total = day.meals.length + (workout ? 1 : 0);
  const finished = day.meals.filter((_, i) => done.includes(`meal-${i}`)).length + (workout && done.includes('workout') ? 1 : 0);
  const allDone = total > 0 && finished === total;

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-text">
          <h1>{greeting(profile.name)}</h1>
          <p>{allDone ? '오늘 미션을 모두 끝냈어요! 정말 대단해요 🎉' : dailyMessage()}</p>
          <span className="streak">{streak > 0 ? `🔥 ${streak}일 연속 달성 중` : '🌱 오늘 첫 칸을 채워봐요'}</span>
        </div>
        <ProgressRing value={total ? finished / total : 0}>
          <span>
            {finished}/{total}
            <small>오늘 미션</small>
          </span>
        </ProgressRing>
      </section>

      <div className="tiles">
        <div className="tile">
          <div className="emoji">🔥</div>
          <div className="tile-value">{targets.kcal.toLocaleString('ko-KR')}</div>
          <div className="tile-label">목표 kcal</div>
        </div>
        <div className="tile">
          <div className="emoji">🥚</div>
          <div className="tile-value">{targets.proteinG}g</div>
          <div className="tile-label">단백질</div>
        </div>
        <div className={`tile ${day.cost > targets.dailyBudget ? 'warn' : ''}`}>
          <div className="emoji">💰</div>
          <div className="tile-value">{won(day.cost)}</div>
          <div className="tile-label">오늘 식재료비</div>
        </div>
      </div>

      <section className="card">
        <div className="section-head">
          <h2>오늘 먹을 것 🍽️</h2>
          <span className="muted small">먹고 나서 ✓ 눌러요</span>
        </div>
        <div className="list">
          {day.meals.map((m, i) => (
            <RecipeCard key={i} meal={m} done={done.includes(`meal-${i}`)} onToggle={() => toggle(`meal-${i}`)} />
          ))}
        </div>
      </section>

      {workout ? (
        <WorkoutCard session={workout} done={done.includes('workout')} onToggle={() => toggle('workout')} />
      ) : (
        <section className="card">
          <h2>오늘은 쉬는 날 😌</h2>
          <p className="muted">쉬는 것도 운동이에요. 가볍게 20분 산책하고, {profile.sleepTime}에는 꼭 잠들어요.</p>
        </section>
      )}

      <section className="card">
        <h2>이번 주 기록 📅</h2>
        <div>
          <div className="section-head small">
            <span>💪 운동</span>
            <b>
              {weekStats.workouts}/{weekStats.workoutsPlanned}회
            </b>
          </div>
          <div className="bar">
            <span style={{ width: `${weekStats.workoutsPlanned ? (weekStats.workouts / weekStats.workoutsPlanned) * 100 : 0}%` }} />
          </div>
        </div>
        <div>
          <div className="section-head small">
            <span>🍚 식단</span>
            <b>
              {weekStats.meals}/{weekStats.mealsPlanned}끼
            </b>
          </div>
          <div className="bar">
            <span style={{ width: `${weekStats.mealsPlanned ? (weekStats.meals / weekStats.mealsPlanned) * 100 : 0}%` }} />
          </div>
        </div>
      </section>
    </div>
  );
}
