import { useState } from 'react';
import { COACH_API_URL } from '../lib/coachConfig';
import type { Badge } from '../lib/motivation';
import { bmi, weeksToGoal } from '../lib/nutrition';
import { isoDate } from '../lib/time';
import type { Profile, Targets, WeightEntry } from '../types';
import { NumberField } from './ui';

export type Theme = 'light' | 'dark' | 'system';

interface Props {
  profile: Profile;
  targets: Targets;
  weights: WeightEntry[];
  badges: Badge[];
  onAddWeight: (kg: number) => void;
  onEdit: () => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  onReset: () => void;
}

function Sparkline({ data, target }: { data: WeightEntry[]; target: number }) {
  if (data.length < 2) return <p className="muted small">2번 이상 기록하면 그래프가 나와요 📈</p>;
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
        <circle key={d.date} cx={x(i)} cy={y(d.kg)} r={3.5} className="spark-dot" />
      ))}
    </svg>
  );
}

export default function Me({ profile, targets, weights, badges, onAddWeight, onEdit, apiKey, setApiKey, theme, setTheme, onReset }: Props) {
  const [kg, setKg] = useState(weights.at(-1)?.kg ?? profile.weightKg);
  const [keyDraft, setKeyDraft] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const weeks = weeksToGoal(profile, targets);
  const today = isoDate(new Date());
  const recent = weights.slice(-30);
  const earned = badges.filter((b) => b.earned).length;
  const change = recent.length >= 2 ? Math.round((recent.at(-1)!.kg - recent[0].kg) * 10) / 10 : 0;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>내 정보 🙋</h1>
          <p className="muted small">기록은 이 휴대폰에만 저장돼요</p>
        </div>
        <button className="btn soft sm" onClick={onEdit}>
          ✏️ 프로필 수정
        </button>
      </div>

      <section className="card">
        <div className="section-head">
          <h2>내 배지 🏅</h2>
          <span className="muted small">
            {earned}/{badges.length}개 획득
          </span>
        </div>
        <div className="badges">
          {badges.map((b) => (
            <div key={b.id} className={`badge ${b.earned ? '' : 'locked'}`} title={b.how}>
              <span className="badge-icon">{b.icon}</span>
              {b.name}
              <span className="tiny muted">{b.how}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>체중 기록 ⚖️</h2>
        <form
          className="inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (kg >= 30 && kg <= 250) onAddWeight(kg);
          }}
        >
          <NumberField label="오늘 체중" value={kg} onChange={setKg} unit="kg" decimal />
          <button className="btn primary">{weights.at(-1)?.date === today ? '수정' : '기록'}</button>
        </form>
        <Sparkline data={recent} target={profile.targetWeightKg} />
        {recent.length >= 2 && (
          <p className="small">
            {change === 0 ? '변화 없음' : `${change > 0 ? '+' : ''}${change}kg`} · 점선은 목표 {profile.targetWeightKg}kg
            {((profile.goal === 'lose' && change < 0) || (profile.goal === 'gain' && change > 0)) && ' · 잘하고 있어요! 👏'}
          </p>
        )}
      </section>

      <section className="card">
        <h2>내 목표 숫자 🎯</h2>
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
            {targets.weeklyChangeKg}kg{weeks ? ` · 약 ${weeks}주 뒤 목표` : ''}
          </dd>
        </dl>
        <p className="muted tiny">추정치예요. 2~3주 체중 추세를 보고 조정하세요. 질환이 있거나 임신 중이라면 전문가와 상담하세요.</p>
      </section>

      <section className="card">
        <h2>설정 ⚙️</h2>
        <div className="settings">
          <div className="field">
            <span className="label">화면 테마</span>
            <div className="seg">
              {(
                [
                  ['light', '☀️ 밝게'],
                  ['dark', '🌙 어둡게'],
                  ['system', '📱 기기 설정'],
                ] as const
              ).map(([k, l]) => (
                <button key={k} className={theme === k ? 'on' : ''} onClick={() => setTheme(k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {!COACH_API_URL && (
            <div className="field">
              <button className="btn ghost sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? '고급 설정 닫기' : '🔧 고급: 내 Claude API 키로 AI 코치 쓰기'}
              </button>
              {showAdvanced &&
                (apiKey ? (
                  <div className="toggle-row">
                    <span className="small">API 키 저장됨 · AI 코치 사용 중</span>
                    <button className="btn danger sm" onClick={() => setApiKey('')}>
                      키 삭제
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="hint">
                      <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">
                        Claude Console
                      </a>
                      에서 발급한 키를 넣으면 기본 코치 대신 AI 코치가 답해요. 키는 이 기기에만 저장돼요.
                    </span>
                    <div className="inline">
                      <input type="password" value={keyDraft} onChange={(e) => setKeyDraft(e.target.value)} placeholder="sk-ant-..." autoComplete="off" />
                      <button className="btn primary sm" disabled={!keyDraft.trim()} onClick={() => setApiKey(keyDraft.trim())}>
                        저장
                      </button>
                    </div>
                  </>
                ))}
            </div>
          )}

          <button
            className="btn danger sm"
            onClick={() => {
              if (confirm('모든 기록과 설정을 삭제할까요? 되돌릴 수 없어요.')) onReset();
            }}
          >
            모든 데이터 초기화
          </button>
        </div>
      </section>
    </div>
  );
}
