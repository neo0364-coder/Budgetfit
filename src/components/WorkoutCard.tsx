import { EXERCISE_BY_ID } from '../data/exercises';
import { DAY_LABELS } from '../lib/time';
import type { WorkoutSession } from '../types';

interface Props {
  session: WorkoutSession;
  done?: boolean;
  onToggle?: () => void;
  showDay?: boolean;
}

export default function WorkoutCard({ session, done, onToggle, showDay }: Props) {
  return (
    <article className={`card workout ${done ? 'done' : ''}`}>
      <div className="workout-head">
        <div>
          <div className="muted small">
            {showDay && `${DAY_LABELS[session.day]}요일 · `}
            {session.time} 시작 · {session.minutes}분
          </div>
          <h3>{session.title}</h3>
        </div>
        {onToggle && (
          <button className={`btn ${done ? 'ghost' : 'primary'} sm`} onClick={onToggle}>
            {done ? '완료 취소' : '운동 완료'}
          </button>
        )}
      </div>
      <ol className="ex-list">
        <li className="muted small">워밍업: {session.warmup}</li>
        {session.exercises.map((e) => {
          const ex = EXERCISE_BY_ID[e.exerciseId];
          return (
            <li key={e.exerciseId}>
              <div className="ex-name">
                {ex.name}
                <span className="ex-dose">
                  {e.sets}세트 × {e.reps}
                </span>
              </div>
              <div className="muted small">
                휴식 {e.restSec}초 · {ex.cue}
              </div>
            </li>
          );
        })}
        {session.cardio && (
          <li>
            <div className="ex-name">유산소</div>
            <div className="muted small">{session.cardio}</div>
          </li>
        )}
        <li className="muted small">마무리: {session.cooldown}</li>
      </ol>
    </article>
  );
}
