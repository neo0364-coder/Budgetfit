import { useState } from 'react';
import { ALLERGEN_LABELS } from '../data/foods';
import { APP_NAME, DEFAULT_PROFILE, DIET_LEVELS, WORKOUT_LEVELS } from '../lib/profile';
import { DAY_LABELS } from '../lib/time';
import type { Activity, Allergen, Difficulty, Equipment, Goal, Profile, WorkoutTime } from '../types';
import { NumberField } from './ui';

interface Props {
  initial: Profile | null;
  onSave: (p: Profile) => void;
  onCancel?: () => void;
}

const STEPS = [
  { title: '반가워요! 👋', sub: '몸에 맞는 칼로리를 계산하려고 해요. 이름은 비워도 돼요.' },
  { title: '어떤 목표를 원하세요? 🎯', sub: '목표에 맞춰 식단과 운동 강도가 정해져요.' },
  { title: '식비와 식사 습관은요? 🍚', sub: '예산 안에서 장보기까지 짜 드릴게요.' },
  { title: '언제 운동할 수 있어요? 🏃', sub: '생활 패턴에 맞춰 운동 시간을 잡아 드려요.' },
];

const GOALS: { id: Goal; emoji: string; label: string; desc: string }[] = [
  { id: 'lose', emoji: '🔥', label: '체중 감량', desc: '건강하게 살 빼기' },
  { id: 'maintain', emoji: '🌿', label: '유지·체력', desc: '지금 몸 유지, 체력 UP' },
  { id: 'gain', emoji: '💪', label: '근육 늘리기', desc: '탄탄하게 키우기' },
];

const ACTIVITIES: { id: Activity; emoji: string; label: string; desc: string }[] = [
  { id: 'sedentary', emoji: '🪑', label: '주로 앉아 있어요', desc: '사무직·재택' },
  { id: 'light', emoji: '🚶', label: '가끔 걸어요', desc: '출퇴근 걷기 정도' },
  { id: 'moderate', emoji: '🧍', label: '자주 움직여요', desc: '서서 일하거나 주 3회+ 운동' },
  { id: 'active', emoji: '🏋️', label: '아주 활동적', desc: '육체 노동·매일 운동' },
];

const TIMES: { id: WorkoutTime; emoji: string; label: string }[] = [
  { id: 'morning', emoji: '🌅', label: '아침' },
  { id: 'lunch', emoji: '☀️', label: '점심' },
  { id: 'evening', emoji: '🌙', label: '저녁' },
];

const EQUIP: { id: Equipment; emoji: string; label: string }[] = [
  { id: 'none', emoji: '🏠', label: '맨몸(집)' },
  { id: 'dumbbell', emoji: '🏋️', label: '덤벨 있음' },
  { id: 'gym', emoji: '🏟️', label: '헬스장' },
];

const BUDGETS = [30000, 50000, 70000, 100000];
const MINUTES = [15, 20, 30, 45, 60];

export default function Onboarding({ initial, onSave, onCancel }: Props) {
  const [p, setP] = useState<Profile>(initial ?? DEFAULT_PROFILE);
  const [step, setStep] = useState(0);
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setP((prev) => ({ ...prev, [key]: value }));

  const toggleDay = (d: number) =>
    set('workoutDays', p.workoutDays.includes(d) ? p.workoutDays.filter((x) => x !== d) : [...p.workoutDays, d]);
  const toggleExclude = (a: Allergen) =>
    set('exclude', p.exclude.includes(a) ? p.exclude.filter((x) => x !== a) : [...p.exclude, a]);

  const valid = [
    p.age >= 14 && p.age <= 100 && p.heightCm >= 120 && p.heightCm <= 230 && p.weightKg >= 30 && p.weightKg <= 250,
    p.targetWeightKg >= 30 && p.targetWeightKg <= 250,
    p.weeklyBudget >= 10000,
    /^\d\d:\d\d$/.test(p.wakeTime) && /^\d\d:\d\d$/.test(p.sleepTime),
  ];
  const last = step === STEPS.length - 1;

  return (
    <div className="onboarding">
      <div className="brand">
        <img src="./favicon.svg" alt="" />
        {APP_NAME}
      </div>
      <div className="progress-dots" aria-label={`${STEPS.length}단계 중 ${step + 1}단계`}>
        {STEPS.map((_, i) => (
          <span key={i} className={i <= step ? 'on' : ''} />
        ))}
      </div>
      <div className="onboarding-q">
        <h1>{STEPS[step].title}</h1>
        <p>{STEPS[step].sub}</p>
      </div>

      <section className="card form" key={step}>
        {step === 0 && (
          <>
            <div className="field">
              <span className="label">뭐라고 불러 드릴까요?</span>
              <input value={p.name} maxLength={12} onChange={(e) => set('name', e.target.value)} placeholder="예: 민지 (선택)" />
            </div>
            <div className="field">
              <span className="label">성별</span>
              <div className="options two">
                {(
                  [
                    ['female', '👩', '여성'],
                    ['male', '👨', '남성'],
                  ] as const
                ).map(([k, e, l]) => (
                  <button key={k} type="button" className={`option ${p.sex === k ? 'on' : ''}`} onClick={() => set('sex', k)}>
                    <span className="emoji">{e}</span>
                    <b>{l}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className="row3">
              <div className="field">
                <span className="label">나이</span>
                <NumberField label="나이" value={p.age} onChange={(n) => set('age', n)} unit="세" min={14} max={100} />
              </div>
              <div className="field">
                <span className="label">키</span>
                <NumberField label="키" value={p.heightCm} onChange={(n) => set('heightCm', n)} unit="cm" decimal />
              </div>
              <div className="field">
                <span className="label">몸무게</span>
                <NumberField label="몸무게" value={p.weightKg} onChange={(n) => set('weightKg', n)} unit="kg" decimal />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="options three">
              {GOALS.map((g) => (
                <button key={g.id} type="button" className={`option ${p.goal === g.id ? 'on' : ''}`} onClick={() => set('goal', g.id)}>
                  <span className="emoji">{g.emoji}</span>
                  <b>{g.label}</b>
                  <span>{g.desc}</span>
                </button>
              ))}
            </div>
            <div className="field">
              <span className="label">목표 몸무게</span>
              <NumberField label="목표 몸무게" value={p.targetWeightKg} onChange={(n) => set('targetWeightKg', n)} unit="kg" decimal />
            </div>
            <div className="field">
              <span className="label">평소 하루는 어때요?</span>
              <div className="options two">
                {ACTIVITIES.map((a) => (
                  <button key={a.id} type="button" className={`option ${p.activity === a.id ? 'on' : ''}`} onClick={() => set('activity', a.id)}>
                    <span className="emoji">{a.emoji}</span>
                    <b>{a.label}</b>
                    <span>{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="field">
              <span className="label">일주일 식비 예산</span>
              <div className="chips">
                {BUDGETS.map((b) => (
                  <button key={b} type="button" className={`chip ${p.weeklyBudget === b ? 'on' : ''}`} onClick={() => set('weeklyBudget', b)}>
                    {b / 10000}만 원
                  </button>
                ))}
              </div>
              <NumberField label="일주일 식비 예산" value={p.weeklyBudget} onChange={(n) => set('weeklyBudget', n)} unit="원" min={10000} />
              <span className="hint">하루 약 {Math.round(p.weeklyBudget / 7).toLocaleString('ko-KR')}원 · 집밥 기준</span>
            </div>
            <div className="field">
              <span className="label">하루 몇 끼 먹어요?</span>
              <div className="options two">
                {([3, 2] as const).map((n) => (
                  <button key={n} type="button" className={`option ${p.mealsPerDay === n ? 'on' : ''}`} onClick={() => set('mealsPerDay', n)}>
                    <span className="emoji">{n === 3 ? '🍳🍱🍲' : '🍱🍲'}</span>
                    <b>{n}끼</b>
                    <span>{n === 3 ? '아침도 먹어요' : '아침은 걸러요'}</span>
                  </button>
                ))}
              </div>
              <label className="toggle-row">
                <span>🍌 간식도 넣을게요</span>
                <input type="checkbox" checked={p.snacks} onChange={(e) => set('snacks', e.target.checked)} />
              </label>
            </div>
            <div className="field">
              <span className="label">식단 난이도</span>
              <div className="options three">
                {([1, 2, 3] as Difficulty[]).map((d) => (
                  <button key={d} type="button" className={`option ${p.dietLevel === d ? 'on' : ''}`} onClick={() => set('dietLevel', d)}>
                    <span className="emoji">{DIET_LEVELS[d].emoji}</span>
                    <b>{DIET_LEVELS[d].label}</b>
                    <span>{DIET_LEVELS[d].desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="label">못 먹거나 피하는 음식</span>
              <div className="chips">
                {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => (
                  <button key={a} type="button" className={`chip ${p.exclude.includes(a) ? 'on' : ''}`} onClick={() => toggleExclude(a)}>
                    {p.exclude.includes(a) ? '🚫 ' : ''}
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
              <div className="field">
                <span className="label">⏰ 기상</span>
                <input type="time" value={p.wakeTime} onChange={(e) => set('wakeTime', e.target.value)} />
              </div>
              <div className="field">
                <span className="label">😴 취침</span>
                <input type="time" value={p.sleepTime} onChange={(e) => set('sleepTime', e.target.value)} />
              </div>
            </div>
            <div className="field">
              <span className="label">운동할 요일 {p.workoutDays.length ? `(주 ${p.workoutDays.length}회)` : ''}</span>
              <div className="days">
                {DAY_LABELS.map((d, i) => (
                  <button key={d} type="button" className={p.workoutDays.includes(i) ? 'on' : ''} onClick={() => toggleDay(i)}>
                    {d}
                  </button>
                ))}
              </div>
              {p.workoutDays.length === 0 && <span className="hint">요일을 고르지 않으면 식단만 짜 드려요.</span>}
            </div>
            <div className="field">
              <span className="label">한 번에 운동할 시간</span>
              <div className="chips">
                {MINUTES.map((m) => (
                  <button key={m} type="button" className={`chip ${p.workoutMinutes === m ? 'on' : ''}`} onClick={() => set('workoutMinutes', m)}>
                    {m}분
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="label">편한 시간대</span>
              <div className="options three">
                {TIMES.map((t) => (
                  <button key={t.id} type="button" className={`option ${p.workoutTime === t.id ? 'on' : ''}`} onClick={() => set('workoutTime', t.id)}>
                    <span className="emoji">{t.emoji}</span>
                    <b>{t.label}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="label">운동 장소</span>
              <div className="options three">
                {EQUIP.map((t) => (
                  <button key={t.id} type="button" className={`option ${p.equipment === t.id ? 'on' : ''}`} onClick={() => set('equipment', t.id)}>
                    <span className="emoji">{t.emoji}</span>
                    <b>{t.label}</b>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="label">운동 난이도</span>
              <div className="options three">
                {([1, 2, 3] as Difficulty[]).map((d) => (
                  <button key={d} type="button" className={`option ${p.workoutLevel === d ? 'on' : ''}`} onClick={() => set('workoutLevel', d)}>
                    <span className="emoji">{WORKOUT_LEVELS[d].emoji}</span>
                    <b>{WORKOUT_LEVELS[d].label}</b>
                    <span>{WORKOUT_LEVELS[d].desc}</span>
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
        ) : (
          onCancel && (
            <button className="btn ghost" onClick={onCancel}>
              취소
            </button>
          )
        )}
        <button
          className="btn primary"
          disabled={!valid[step]}
          onClick={() => {
            if (last) onSave({ ...p, workoutDays: [...p.workoutDays].sort() });
            else {
              setStep(step + 1);
              window.scrollTo({ top: 0 });
            }
          }}
        >
          {last ? '내 플랜 만들기 ✨' : '다음'}
        </button>
      </footer>
    </div>
  );
}
