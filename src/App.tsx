import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import Meals from './components/Meals';
import Me, { type Theme } from './components/Me';
import Onboarding from './components/Onboarding';
import Today from './components/Today';
import Workouts from './components/Workouts';
import { Confetti } from './components/ui';
import { planMeals } from './lib/mealPlanner';
import { badges as computeBadges, praise, streak as computeStreak } from './lib/motivation';
import { computeTargets } from './lib/nutrition';
import { normalizeProfile } from './lib/profile';
import { clearAll, useStored } from './lib/storage';
import { isoDate, mondayOf, weekdayIndex } from './lib/time';
import { planWorkouts } from './lib/workoutPlanner';
import type { Checklist, Conversation, Difficulty, Profile, Targets, WeekPlan, WeightEntry } from './types';

// 코치(Claude SDK 포함)는 탭을 열 때만 불러온다
const Coach = lazy(() => import('./components/Coach'));

type Tab = 'today' | 'meals' | 'workouts' | 'coach' | 'me';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: '오늘', icon: '🏠' },
  { id: 'meals', label: '식단', icon: '🍚' },
  { id: 'workouts', label: '운동', icon: '💪' },
  { id: 'coach', label: '코치', icon: '💬' },
  { id: 'me', label: '내 정보', icon: '🙋' },
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
  return { context: { profile, targets, plan }, planStamp: plan.createdAt, messages: [] };
}

export default function App() {
  const [storedProfile, setProfile] = useStored<Profile | null>('profile', null);
  const [plan, setPlan] = useStored<WeekPlan | null>('plan', null);
  const [checks, setChecks] = useStored<Checklist>('checks', {});
  const [weights, setWeights] = useStored<WeightEntry[]>('weights', []);
  const [apiKey, setApiKey] = useStored<string>('apiKey', '');
  const [storedConversation, setConversation] = useStored<Conversation | null>('conversation', null);
  const [theme, setTheme] = useStored<Theme>('theme', 'light');
  const [seenBadges, setSeenBadges] = useStored<string[] | null>('badgesSeen', null);
  const [tab, setTab] = useState<Tab>('today');
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [party, setParty] = useState(0);
  const toastTimer = useRef<number | undefined>(undefined);

  const profile = useMemo(() => (storedProfile ? normalizeProfile(storedProfile) : null), [storedProfile]);
  const targets = useMemo(() => (profile ? computeTargets(profile) : null), [profile]);
  // 예전 형식(system 문자열)으로 저장된 대화는 버린다
  const conversation = storedConversation && 'context' in storedConversation ? storedConversation : null;
  const now = new Date();
  const today = weekdayIndex(now);
  const todayKey = isoDate(now);
  const thisWeek = isoDate(mondayOf(now));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // 새 주가 시작되면 플랜을 자동으로 새로 만든다
  useEffect(() => {
    if (profile && targets && (!plan || plan.weekStart !== thisWeek)) {
      setPlan(makePlan(profile, targets, Date.now() % 100000));
    }
  }, [profile, targets, plan, thisWeek, setPlan]);

  const badgeList = useMemo(() => computeBadges(checks, weights), [checks, weights]);
  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  // 새 배지를 따면 알려준다 (처음 실행 때는 이미 딴 배지를 조용히 기록만)
  useEffect(() => {
    const earned = badgeList.filter((b) => b.earned).map((b) => b.id);
    if (seenBadges === null) {
      setSeenBadges(earned);
      return;
    }
    const fresh = badgeList.find((b) => b.earned && !seenBadges.includes(b.id));
    if (fresh) {
      setSeenBadges(earned);
      const t = window.setTimeout(() => {
        setParty((n) => n + 1);
        showToast(`🏅 새 배지 획득! "${fresh.name}"`);
      }, 1400);
      return () => window.clearTimeout(t);
    }
  }, [badgeList, seenBadges, setSeenBadges]);

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
          if (!profile) showToast('🎉 나만의 플랜이 완성됐어요!');
        }}
      />
    );
  }
  if (!plan || !targets) return null;

  const conv = conversation ?? newConversation(profile, targets, plan);
  const done = checks[todayKey] ?? [];
  const todayWorkout = plan.workouts.some((w) => w.day === today);
  const todayTotal = plan.meals[today].meals.length + (todayWorkout ? 1 : 0);

  const toggle = (key: string) => {
    const wasDone = done.includes(key);
    const next = wasDone ? done.filter((k) => k !== key) : [...done, key];
    setChecks((c) => ({ ...c, [todayKey]: next }));
    if (wasDone) return;
    const count = next.filter((k) => k === 'workout' || plan.meals[today].meals[Number(k.split('-')[1])]).length;
    if (count >= todayTotal) {
      setParty((n) => n + 1);
      showToast('🎉 오늘 미션 올클리어! 정말 최고예요!');
    } else {
      if (key === 'workout') setParty((n) => n + 1);
      showToast(praise(key === 'workout' ? 'workout' : 'meal'));
    }
  };

  const changeLevel = (field: 'workoutLevel' | 'dietLevel', d: Difficulty) => {
    if (profile[field] === d) return;
    const p = { ...profile, [field]: d };
    setProfile(p);
    setPlan(makePlan(p, computeTargets(p), plan.seed));
    showToast(field === 'workoutLevel' ? '💪 운동 난이도를 바꿨어요' : '🍚 식단 난이도를 바꿨어요');
  };

  // 이번 주 기록
  const monday = mondayOf(now);
  const weekDates = Array.from({ length: 7 }, (_, i) => isoDate(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i)));
  const doneDays = new Set(weekDates.map((d, i) => ((checks[d] ?? []).includes('workout') ? i : -1)).filter((i) => i >= 0));
  const weekStats = {
    workouts: plan.workouts.filter((w) => doneDays.has(w.day)).length,
    workoutsPlanned: plan.workouts.length,
    meals: weekDates.reduce((s, d) => s + (checks[d] ?? []).filter((k) => k.startsWith('meal-')).length, 0),
    mealsPlanned: plan.meals.reduce((s, d) => s + d.meals.length, 0),
  };

  return (
    <div className="app">
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {party > 0 && <Confetti key={party} />}
      <main>
        {tab === 'today' && (
          <Today
            profile={profile}
            targets={targets}
            plan={plan}
            dayIndex={today}
            done={done}
            toggle={toggle}
            streak={computeStreak(checks, now)}
            weekStats={weekStats}
          />
        )}
        {tab === 'meals' && (
          <Meals
            plan={plan}
            targets={targets}
            today={today}
            weeklyBudget={profile.weeklyBudget}
            dietLevel={profile.dietLevel}
            onLevel={(d) => changeLevel('dietLevel', d)}
            onRegenerate={() => {
              setPlan(makePlan(profile, targets, plan.seed + 7919));
              showToast('🔄 새 메뉴로 다시 짰어요');
            }}
          />
        )}
        {tab === 'workouts' && (
          <Workouts plan={plan} profile={profile} today={today} doneDays={doneDays} onLevel={(d) => changeLevel('workoutLevel', d)} />
        )}
        {tab === 'coach' && (
          <Suspense fallback={<p className="muted">불러오는 중…</p>}>
            <Coach
              apiKey={apiKey}
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
            badges={badgeList}
            onAddWeight={(kg) => {
              setWeights((w) => [...w.filter((e) => e.date !== todayKey), { date: todayKey, kg }]);
              setProfile({ ...profile, weightKg: kg });
              showToast('⚖️ 기록 완료! 꾸준히 재는 것만으로도 대단해요');
            }}
            onEdit={() => setEditing(true)}
            apiKey={apiKey}
            setApiKey={setApiKey}
            theme={theme}
            setTheme={setTheme}
            onReset={() => {
              clearAll();
              location.reload();
            }}
          />
        )}
      </main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'on' : ''}
            onClick={() => {
              setTab(t.id);
              window.scrollTo({ top: 0 });
            }}
          >
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
