import { DAY_LABELS } from '../lib/time';
import type { Profile, WeekPlan } from '../types';
import WorkoutCard from './WorkoutCard';

interface Props {
  plan: WeekPlan;
  profile: Profile;
  today: number;
}

export default function Workouts({ plan, profile, today }: Props) {
  const byDay = new Map(plan.workouts.map((w) => [w.day, w]));
  return (
    <div className="page">
      <h1>운동</h1>
      <section className="card week">
        {DAY_LABELS.map((d, i) => (
          <div key={d} className={`week-day ${i === today ? 'today' : ''} ${byDay.has(i) ? 'on' : ''}`}>
            <div className="small">{d}</div>
            <div className="small">{byDay.get(i)?.title.split(' ')[0] ?? '휴식'}</div>
          </div>
        ))}
      </section>
      {plan.workouts.length === 0 && (
        <p className="notice">운동 가능한 요일이 없어요. 내 정보에서 요일을 선택하면 운동 플랜이 만들어져요.</p>
      )}
      {plan.workouts.map((w) => (
        <WorkoutCard key={w.day} session={w} showDay />
      ))}
      <p className="muted small">
        다음 주에도 같은 동작을 {profile.level === 'beginner' ? '1~2회' : '조금 더 무겁게'} 더 해 보세요(점진적 과부하). 통증이
        있으면 즉시 멈추고 AI 코치에게 대체 동작을 물어보세요.
      </p>
    </div>
  );
}
