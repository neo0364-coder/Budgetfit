import { useState } from 'react';
import { bmi, weeksToGoal } from '../lib/nutrition';
import { isoDate } from '../lib/time';
import type { Profile, Targets, WeightEntry } from '../types';

interface Props {
  profile: Profile;
  targets: Targets;
  weights: WeightEntry[];
  onAddWeight: (kg: number) => void;
  onEdit: () => void;
  apiKey: string;
  onClearKey: () => void;
  onReset: () => void;
}

function Sparkline({ data, target }: { data: WeightEntry[]; target: number }) {
  if (data.length < 2) return null;
  const w = 320;
  const h = 110;
  const pad = 10;
  const values = [...data.map((d) => d.kg), target];
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.kg).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" role="img" aria-label="체중 변화 그래프">
      <line x1={pad} x2={w - pad} y1={y(target)} y2={y(target)} className="spark-target" />
      <path d={path} className="spark-line" />
      {data.map((d, i) => (
        <circle key={d.date} cx={x(i)} cy={y(d.kg)} r={3} className="spark-dot" />
      ))}
    </svg>
  );
}

export default function Me({ profile, targets, weights, onAddWeight, onEdit, apiKey, onClearKey, onReset }: Props) {
  const [kg, setKg] = useState(String(weights.at(-1)?.kg ?? profile.weightKg));
  const weeks = weeksToGoal(profile, targets);
  const today = isoDate(new Date());
  const recent = weights.slice(-30);

  return (
    <div className="page">
      <h1>내 정보</h1>

      <section className="card">
        <h2>체중 기록</h2>
        <form
          className="inline"
          onSubmit={(e) => {
            e.preventDefault();
            const v = Number(kg);
            if (v >= 30 && v <= 250) onAddWeight(v);
          }}
        >
          <input type="number" inputMode="decimal" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} aria-label="오늘 체중(kg)" />
          <button className="btn primary">{weights.at(-1)?.date === today ? '오늘 기록 수정' : '오늘 기록'}</button>
        </form>
        <Sparkline data={recent} target={profile.targetWeightKg} />
        {recent.length >= 2 && (
          <p className="muted small">
            시작 {recent[0].kg}kg → 현재 {recent.at(-1)!.kg}kg (점선: 목표 {profile.targetWeightKg}kg)
          </p>
        )}
      </section>

      <section className="card">
        <div className="section-head">
          <h2>내 목표 계산</h2>
          <button className="btn ghost sm" onClick={onEdit}>
            프로필 수정
          </button>
        </div>
        <dl className="kv">
          <dt>BMI</dt>
          <dd>{bmi(profile)}</dd>
          <dt>기초대사량</dt>
          <dd>{targets.bmr.toLocaleString('ko-KR')} kcal</dd>
          <dt>하루 소모량(추정)</dt>
          <dd>{targets.tdee.toLocaleString('ko-KR')} kcal</dd>
          <dt>하루 섭취 목표</dt>
          <dd>{targets.kcal.toLocaleString('ko-KR')} kcal</dd>
          <dt>탄·단·지</dt>
          <dd>
            {targets.carbsG}g · {targets.proteinG}g · {targets.fatG}g
          </dd>
          <dt>예상 변화</dt>
          <dd>
            주 {targets.weeklyChangeKg > 0 ? '+' : ''}
            {targets.weeklyChangeKg}kg{weeks ? ` · 목표까지 약 ${weeks}주` : ''}
          </dd>
        </dl>
        <p className="muted small">추정치예요. 2~3주 체중 추세를 보고 조정하세요. 질환이 있거나 임신 중이라면 전문가와 상담하세요.</p>
      </section>

      <section className="card">
        <h2>설정</h2>
        <div className="settings">
          <div>
            AI 코치 API 키: {apiKey ? '저장됨' : '없음'}
            {apiKey && (
              <button className="btn ghost sm" onClick={onClearKey}>
                키 삭제
              </button>
            )}
          </div>
          <button
            className="btn danger sm"
            onClick={() => {
              if (confirm('모든 기록과 설정을 삭제할까요?')) onReset();
            }}
          >
            모든 데이터 초기화
          </button>
        </div>
      </section>
    </div>
  );
}
