import { WORKOUT_LEVELS } from '../lib/profile';
import { DAY_LABELS } from '../lib/time';
import type { Difficulty, Profile, WeekPlan } from '../types';
import WorkoutCard from './WorkoutCard';

interface Props {
  plan: WeekPlan;
  profile: Profile;
  today: number;
  doneDays: Set<number>;
  onLevel: (d: Difficulty) => void;
}

export default function Workouts({ plan, profile, today, doneDays, onLevel }: Props) {
  const byDay = new Map(plan.workouts.map((w) => [w.day, w]));
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>이번 주 운동 💪</h1>
          <p className="muted small">운동 이름을 누르면 방법과 영상을 볼 수 있어요</p>
        </div>
      </div>

      <section className="card">
        <div className="section-head">
          <h2>운동 난이도</h2>
          <span className="muted small">{WORKOUT_LEVELS[profile.workoutLevel].desc}</span>
        </div>
        <div className="seg">
          {([1, 2, 3] as Difficulty[]).map((d) => (
            <button key={d} className={profile.workoutLevel === d ? 'on' : ''} onClick={() => onLevel(d)}>
              {WORKOUT_LEVELS[d].emoji} {WORKOUT_LEVELS[d].label}
            </button>
          ))}
        </div>
      </section>

      <div className="week">
        {DAY_LABELS.map((d, i) => {
          const w = byDay.get(i);
          const cls = ['week-day', i === today ? 'today' : '', w ? (doneDays.has(i) ? 'done' : 'on') : ''].join(' ');
          return (
            <div key={d} className={cls}>
              <b>{d}</b>
              {w ? (doneDays.has(i) ? '완료' : w.title.split(' ')[0]) : '휴식'}
            </div>
          );
        })}
      </div>

      {plan.workouts.length === 0 && (
        <p className="notice">운동할 요일이 없어요. 내 정보 → 프로필 수정에서 요일을 고르면 운동 플랜이 생겨요.</p>
      )}
      {plan.workouts.map((w) => (
        <WorkoutCard key={w.day} session={w} showDay />
      ))}
      <p className="muted small">
        💡 너무 쉬우면 난이도를 올리고, 힘들면 내려도 괜찮아요. 꾸준함이 강도보다 중요해요!
      </p>
    </div>
  );
}
