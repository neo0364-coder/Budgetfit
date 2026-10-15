import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import Meals from './components/Meals';
import Me from './components/Me';
import Onboarding from './components/Onboarding';
import Today from './components/Today';
import Workouts from './components/Workouts';
import { buildSystemPrompt } from './lib/coachPrompt';
import { planMeals } from './lib/mealPlanner';
import { computeTargets } from './lib/nutrition';
import { clearAll, useStored } from './lib/storage';
import { isoDate, mondayOf, weekdayIndex } from './lib/time';
import { planWorkouts } from './lib/workoutPlanner';
import type { Checklist, Conversation, Profile, Targets, WeekPlan, WeightEntry } from './types';

// AI 코치(Claude SDK 포함)는 탭을 열 때만 불러온다
const Coach = lazy(() => import('./components/Coach'));

type Tab = 'today' | 'meals' | 'workouts' | 'coach' | 'me';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: '오늘', icon: '◎' },
  { id: 'meals', label: '식단', icon: '🍚' },
  { id: 'workouts', label: '운동', icon: '💪' },
  { id: 'coach', label: 'AI 코치', icon: '💬' },
  { id: 'me', label: '내 정보', icon: '👤' },
];

function makePlan(profile: Profile, targets: Targets, seed: number): WeekPlan {
  return {
    createdAt: new Date().toISOString(),
    weekStart: isoDate(mondayOf(new Date())),
    seed,
    meals: planMeals(profile, targets, seed),
    workouts: planWorkouts(profile, seed),
  };
}

function newConversation(profile: Profile, targets: Targets, plan: WeekPlan): Conversation {
  return { system: buildSystemPrompt(profile, targets, plan), planStamp: plan.createdAt, messages: [] };
}

export default function App() {
  const [profile, setProfile] = useStored<Profile | null>('profile', null);
  const [plan, setPlan] = useStored<WeekPlan | null>('plan', null);
  const [checks, setChecks] = useStored<Checklist>('checks', {});
  const [weights, setWeights] = useStored<WeightEntry[]>('weights', []);
  const [apiKey, setApiKey] = useStored<string>('apiKey', '');
  const [conversation, setConversation] = useStored<Conversation | null>('conversation', null);
  const [tab, setTab] = useState<Tab>('today');
  const [editing, setEditing] = useState(false);

  const targets = useMemo(() => (profile ? computeTargets(profile) : null), [profile]);
  const now = new Date();
  const today = weekdayIndex(now);
  const todayKey = isoDate(now);

  // 새 주가 시작되면 플랜을 자동으로 새로 만든다
  const thisWeek = isoDate(mondayOf(now));
  useEffect(() => {
    if (profile && targets && (!plan || plan.weekStart !== thisWeek)) {
      setPlan(makePlan(profile, targets, Date.now() % 100000));
    }
  }, [profile, targets, plan, thisWeek, setPlan]);

  if (!profile || editing) {
    return (
      <Onboarding
        initial={profile}
        onCancel={profile ? () => setEditing(false) : undefined}
        onSave={(p) => {
          setProfile(p);
          setPlan(makePlan(p, computeTargets(p), plan?.seed ?? 1));
          if (!profile || p.weightKg !== profile.weightKg) {
            setWeights((w) => [...w.filter((e) => e.date !== todayKey), { date: todayKey, kg: p.weightKg }]);
          }
          setEditing(false);
          setTab('today');
        }}
      />
    );
  }
  if (!plan || !targets) return null;

  const conv = conversation ?? newConversation(profile, targets, plan);
  const done = checks[todayKey] ?? [];
  const toggle = (key: string) =>
    setChecks((c) => {
      const cur = c[todayKey] ?? [];
      return { ...c, [todayKey]: cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key] };
    });

  return (
    <div className="app">
      <main>
        {tab === 'today' && <Today profile={profile} targets={targets} plan={plan} dayIndex={today} done={done} toggle={toggle} />}
        {tab === 'meals' && (
          <Meals
            plan={plan}
            targets={targets}
            today={today}
            weeklyBudget={profile.weeklyBudget}
            onRegenerate={() => setPlan(makePlan(profile, targets, plan.seed + 7919))}
          />
        )}
        {tab === 'workouts' && <Workouts plan={plan} profile={profile} today={today} />}
        {tab === 'coach' && (
          <Suspense fallback={<p className="muted">불러오는 중…</p>}>
          <Coach
            apiKey={apiKey}
            setApiKey={setApiKey}
            conversation={conv}
            setConversation={setConversation}
            planStamp={plan.createdAt}
            onNewConversation={() => setConversation(newConversation(profile, targets, plan))}
          />
          </Suspense>
        )}
        {tab === 'me' && (
          <Me
            profile={profile}
            targets={targets}
            weights={weights}
            onAddWeight={(kg) => {
              setWeights((w) => [...w.filter((e) => e.date !== todayKey), { date: todayKey, kg }]);
              setProfile({ ...profile, weightKg: kg });
            }}
            onEdit={() => setEditing(true)}
            apiKey={apiKey}
            onClearKey={() => setApiKey('')}
            onReset={() => {
              clearAll();
              location.reload();
            }}
          />
        )}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span className="tab-icon" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
