import { useState } from 'react';
import { ALLERGEN_LABELS } from '../data/foods';
import { EQUIPMENT_LABELS } from '../data/exercises';
import { ACTIVITY_LABELS } from '../lib/nutrition';
import { DAY_LABELS } from '../lib/time';
import type { Activity, Allergen, Equipment, Profile } from '../types';

export const DEFAULT_PROFILE: Profile = {
  name: '',
  sex: 'female',
  age: 30,
  heightCm: 165,
  weightKg: 65,
  targetWeightKg: 60,
  goal: 'lose',
  activity: 'light',
  weeklyBudget: 50000,
  mealsPerDay: 3,
  snacks: true,
  wakeTime: '07:00',
  sleepTime: '23:30',
  workoutDays: [0, 2, 4],
  workoutMinutes: 40,
  workoutTime: 'evening',
  equipment: 'none',
  level: 'beginner',
  exclude: [],
};

interface Props {
  initial: Profile | null;
  onSave: (p: Profile) => void;
  onCancel?: () => void;
}

const STEPS = ['기본 정보', '목표', '예산·식사', '생활 패턴·운동'];

export default function Onboarding({ initial, onSave, onCancel }: Props) {
  const [p, setP] = useState<Profile>(initial ?? DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setP((prev) => ({ ...prev, [key]: value }));
  const num = (key: 'age' | 'heightCm' | 'weightKg' | 'targetWeightKg' | 'weeklyBudget' | 'workoutMinutes') =>
    (e: React.ChangeEvent<HTMLInputElement>) => set(key, Number(e.target.value));

  const toggleDay = (d: number) =>
    set('workoutDays', p.workoutDays.includes(d) ? p.workoutDays.filter((x) => x !== d) : [...p.workoutDays, d]);
  const toggleExclude = (a: Allergen) =>
    set('exclude', p.exclude.includes(a) ? p.exclude.filter((x) => x !== a) : [...p.exclude, a]);

  const valid = [
    p.age >= 14 && p.age <= 100 && p.heightCm >= 120 && p.heightCm <= 230 && p.weightKg >= 30 && p.weightKg <= 250,
    p.targetWeightKg >= 30 && p.targetWeightKg <= 250,
    p.weeklyBudget >= 10000,
    p.workoutMinutes >= 10 && /^\d\d:\d\d$/.test(p.wakeTime) && /^\d\d:\d\d$/.test(p.sleepTime),
  ];
  const last = step === STEPS.length - 1;

  return (
    <div className="onboarding">
      <header className="onboarding-head">
        <div className="brand">BudgetFit</div>
        <p className="muted">예산과 생활 패턴에 맞춘 운동 + 저렴한 식단</p>
        <ol className="stepper">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'active' : i < step ? 'done' : ''}>
              <span>{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </header>

      <section className="card form">
        {step === 0 && (
          <>
            <label>
              이름(선택)
              <input value={p.name} onChange={(e) => set('name', e.target.value)} placeholder="코치가 부를 이름" />
            </label>
            <div className="field">
              <span>성별</span>
              <div className="seg">
                {(['female', 'male'] as const).map((s) => (
                  <button key={s} type="button" className={p.sex === s ? 'on' : ''} onClick={() => set('sex', s)}>
                    {s === 'female' ? '여성' : '남성'}
                  </button>
                ))}
              </div>
            </div>
            <div className="row3">
              <label>
                나이
                <input type="number" inputMode="numeric" value={p.age} onChange={num('age')} />
              </label>
              <label>
                키(cm)
                <input type="number" inputMode="decimal" value={p.heightCm} onChange={num('heightCm')} />
              </label>
              <label>
                체중(kg)
                <input type="number" inputMode="decimal" value={p.weightKg} onChange={num('weightKg')} />
              </label>
            </div>
            <label>
              평소 활동량
              <select value={p.activity} onChange={(e) => set('activity', e.target.value as Activity)}>
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {step === 1 && (
          <>
            <div className="field">
              <span>목표</span>
              <div className="seg">
                {(
                  [
                    ['lose', '체중 감량'],
                    ['maintain', '유지·체력'],
                    ['gain', '근육 증가'],
                  ] as const
                ).map(([k, v]) => (
                  <button key={k} type="button" className={p.goal === k ? 'on' : ''} onClick={() => set('goal', k)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <label>
              목표 체중(kg)
              <input type="number" inputMode="decimal" value={p.targetWeightKg} onChange={num('targetWeightKg')} />
            </label>
            <div className="field">
              <span>운동 경험</span>
              <div className="seg">
                {(
                  [
                    ['beginner', '초보'],
                    ['intermediate', '중급 이상'],
                  ] as const
                ).map(([k, v]) => (
                  <button key={k} type="button" className={p.level === k ? 'on' : ''} onClick={() => set('level', k)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label>
              1주 식비 예산(원)
              <input type="number" inputMode="numeric" step={5000} value={p.weeklyBudget} onChange={num('weeklyBudget')} />
              <small className="muted">하루 약 {Math.round(p.weeklyBudget / 7).toLocaleString('ko-KR')}원 · 집밥 기준</small>
            </label>
            <div className="field">
              <span>하루 식사</span>
              <div className="seg">
                {([2, 3] as const).map((n) => (
                  <button key={n} type="button" className={p.mealsPerDay === n ? 'on' : ''} onClick={() => set('mealsPerDay', n)}>
                    {n}끼{n === 2 ? ' (아침 거름)' : ''}
                  </button>
                ))}
              </div>
            </div>
            <label className="check">
              <input type="checkbox" checked={p.snacks} onChange={(e) => set('snacks', e.target.checked)} />
              간식 포함
            </label>
            <div className="field">
              <span>못 먹거나 피하는 음식</span>
              <div className="chips">
                {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => (
                  <button key={a} type="button" className={p.exclude.includes(a) ? 'chip on' : 'chip'} onClick={() => toggleExclude(a)}>
                    {ALLERGEN_LABELS[a]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="row2">
              <label>
                기상 시간
                <input type="time" value={p.wakeTime} onChange={(e) => set('wakeTime', e.target.value)} />
              </label>
              <label>
                취침 시간
                <input type="time" value={p.sleepTime} onChange={(e) => set('sleepTime', e.target.value)} />
              </label>
            </div>
            <div className="field">
              <span>운동 가능한 요일 ({p.workoutDays.length}일)</span>
              <div className="days">
                {DAY_LABELS.map((d, i) => (
                  <button key={d} type="button" className={p.workoutDays.includes(i) ? 'on' : ''} onClick={() => toggleDay(i)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <label>
              1회 운동 시간: {p.workoutMinutes}분
              <input type="range" min={15} max={90} step={5} value={p.workoutMinutes} onChange={num('workoutMinutes')} />
            </label>
            <div className="field">
              <span>선호 운동 시간대</span>
              <div className="seg">
                {(
                  [
                    ['morning', '아침'],
                    ['lunch', '점심'],
                    ['evening', '저녁'],
                  ] as const
                ).map(([k, v]) => (
                  <button key={k} type="button" className={p.workoutTime === k ? 'on' : ''} onClick={() => set('workoutTime', k)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>운동 환경</span>
              <div className="seg">
                {(Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((k) => (
                  <button key={k} type="button" className={p.equipment === k ? 'on' : ''} onClick={() => set('equipment', k)}>
                    {EQUIPMENT_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <footer className="onboarding-actions">
        {step > 0 ? (
          <button className="btn ghost" onClick={() => setStep(step - 1)}>
            이전
          </button>
        ) : onCancel ? (
          <button className="btn ghost" onClick={onCancel}>
            취소
          </button>
        ) : (
          <span />
        )}
        <button
          className="btn primary"
          disabled={!valid[step]}
          onClick={() => (last ? onSave({ ...p, workoutDays: [...p.workoutDays].sort() }) : setStep(step + 1))}
        >
          {last ? '내 플랜 만들기' : '다음'}
        </button>
      </footer>
    </div>
  );
}
