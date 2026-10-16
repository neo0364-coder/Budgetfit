import { useState } from 'react';
import { EXERCISE_BY_ID, videoUrl, type Exercise } from '../data/exercises';
import { DAY_LABELS } from '../lib/time';
import type { PlannedExercise, WorkoutSession } from '../types';
import { Sheet } from './ui';

export function ExerciseSheet({ exercise, dose, onClose }: { exercise: Exercise; dose?: PlannedExercise; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <div>
        <div className="chip-row">
          <span className="pill green">{exercise.muscles}</span>
          {dose && (
            <span className="pill sun">
              {dose.sets}세트 × {dose.reps} · 휴식 {dose.restSec}초
            </span>
          )}
        </div>
        <h2 style={{ marginTop: 10 }}>{exercise.name}</h2>
      </div>
      <a className="btn coral block" href={videoUrl(exercise)} target="_blank" rel="noreferrer">
        ▶ 유튜브에서 자세 영상 보기
      </a>
      <div className="sheet-section">
        <h4>🧭 이렇게 해요</h4>
        <ol>
          {exercise.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
      <div className="sheet-section">
        <h4>⚠️ 이것만 조심해요</h4>
        <ul>
          {exercise.mistakes.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <p className="notice info">통증이 느껴지면 바로 멈추세요. 더 쉬운 동작이 필요하면 AI 코치에게 물어보세요.</p>
      <button className="btn ghost block" onClick={onClose}>
        닫기
      </button>
    </Sheet>
  );
}

interface Props {
  session: WorkoutSession;
  done?: boolean;
  onToggle?: () => void;
  showDay?: boolean;
}

export default function WorkoutCard({ session, done, onToggle, showDay }: Props) {
  const [open, setOpen] = useState<PlannedExercise | null>(null);
  return (
    <article className="card">
      <div className="workout-head">
        <div>
          <div className="muted small">
            {showDay && `${DAY_LABELS[session.day]}요일 · `}⏰ {session.time} · {session.minutes}분
          </div>
          <h3>
            {done ? '✅ ' : '🏋️ '}
            {session.title}
          </h3>
        </div>
        {onToggle && (
          <button className={`btn ${done ? 'ghost' : 'primary'} sm`} onClick={onToggle}>
            {done ? '완료 취소' : '운동 완료!'}
          </button>
        )}
      </div>
      <div className="ex-extra">🤸 워밍업 · {session.warmup}</div>
      <ol className="ex-list">
        {session.exercises.map((e, i) => {
          const ex = EXERCISE_BY_ID[e.exerciseId];
          return (
            <li key={e.exerciseId}>
              <button className="ex-row" onClick={() => setOpen(e)}>
                <span className="ex-num">{i + 1}</span>
                <span className="ex-info">
                  <span className="ex-name">{ex.name}</span>
                  <br />
                  <span className="ex-dose">
                    {e.sets}세트 × {e.reps}
                  </span>
                  <span className="muted tiny"> · 휴식 {e.restSec}초</span>
                </span>
                <span className="ex-play">▶ 방법</span>
              </button>
            </li>
          );
        })}
      </ol>
      {session.cardio && <div className="ex-extra">❤️ 유산소 · {session.cardio}</div>}
      <div className="ex-extra">🧘 마무리 · {session.cooldown}</div>
      {open && <ExerciseSheet exercise={EXERCISE_BY_ID[open.exerciseId]} dose={open} onClose={() => setOpen(null)} />}
    </article>
  );
}
