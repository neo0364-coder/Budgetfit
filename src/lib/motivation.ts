import type { Checklist, WeightEntry } from '../types';
import { isoDate } from './time';

/** 오늘의 한마디 (날짜마다 바뀜) */
const DAILY = [
  '완벽하지 않아도 괜찮아요. 오늘 한 끼, 한 세트면 충분해요.',
  '어제보다 1%만 더! 그게 쌓이면 달라져요.',
  '운동은 기분이 좋아서 하는 게 아니라, 하고 나면 기분이 좋아져요.',
  '아낀 식비도, 늘어난 체력도 모두 내 거예요 💰💪',
  '몸은 거짓말을 안 해요. 오늘 한 만큼 내일 보여줄 거예요.',
  '오늘 컨디션이 별로라면 쉬운 버전으로! 멈추지만 않으면 돼요.',
  '물 한 잔 마시고 시작해 볼까요? 🥤',
  '10분만 해도 0분보다 훨씬 커요.',
  '집밥 한 끼가 지갑도 몸도 지켜줘요 🍚',
  '잠도 운동이에요. 오늘은 조금 일찍 자 봐요 😴',
  '남과 비교하지 말고 어제의 나와 비교해요.',
  '작은 습관이 큰 변화를 만들어요. 오늘도 한 칸 채워봐요!',
  '힘든 날 해낸 운동이 제일 오래 남아요.',
  '천천히 가도 괜찮아요. 방향만 맞으면 돼요.',
];

export function dailyMessage(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86400000);
  return DAILY[day % DAILY.length];
}

const MEAL_PRAISE = [
  '맛있게 먹었어요? 잘했어요! 🍽️',
  '오늘도 알뜰하게 한 끼 성공! 💚',
  '집밥 최고! 지갑이 웃고 있어요 💰',
  '좋아요, 몸이 고마워하고 있어요 😊',
  '계획대로 먹기 성공! 대단해요 👏',
];
const WORKOUT_PRAISE = [
  '운동 완료! 오늘의 나, 정말 멋져요 💪',
  '해냈어요! 땀 흘린 만큼 강해지고 있어요 🔥',
  '최고예요! 내일의 내가 고마워할 거예요 🙌',
  '오늘도 한 걸음 성장! 🌱',
  '와, 진짜 해냈네요! 스스로를 칭찬해 주세요 ⭐',
];

export function praise(kind: 'meal' | 'workout'): string {
  const list = kind === 'meal' ? MEAL_PRAISE : WORKOUT_PRAISE;
  return list[Math.floor(Math.random() * list.length)];
}

export function greeting(name: string, hour = new Date().getHours()): string {
  const who = name ? `${name}님` : '';
  if (hour < 5) return `늦은 밤이에요${who ? `, ${who}` : ''} 🌙`;
  if (hour < 11) return `좋은 아침이에요${who ? `, ${who}` : ''} ☀️`;
  if (hour < 17) return `오늘도 힘내요${who ? `, ${who}` : ''} 🌿`;
  return `오늘 하루 수고했어요${who ? `, ${who}` : ''} 🌆`;
}

/** 하나라도 완료한 날이 며칠 연속인지 (오늘 아직 안 했으면 어제까지 기준) */
export function streak(checks: Checklist, today = new Date()): number {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!checks[isoDate(d)]?.length) d.setDate(d.getDate() - 1);
  let n = 0;
  while (checks[isoDate(d)]?.length) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function longestStreak(checks: Checklist): number {
  const days = Object.keys(checks).filter((k) => checks[k].length).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of days) {
    const [y, m, d] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  how: string;
  earned: boolean;
}

export function badges(checks: Checklist, weights: WeightEntry[]): Badge[] {
  const all = Object.values(checks).flat();
  const workouts = all.filter((k) => k === 'workout').length;
  const meals = all.filter((k) => k.startsWith('meal-')).length;
  const best = longestStreak(checks);
  const list: Omit<Badge, 'earned'>[] = [];
  const add = (id: string, icon: string, name: string, how: string, ok: boolean) => {
    list.push({ id, icon, name, how });
    return ok;
  };
  const earned: Record<string, boolean> = {
    first: add('first', '🌱', '첫 걸음', '첫 미션 완료', all.length > 0),
    w1: add('w1', '💪', '첫 운동', '운동 1회 완료', workouts >= 1),
    w5: add('w5', '🏃', '운동 습관', '운동 5회 완료', workouts >= 5),
    w20: add('w20', '🏆', '운동 마스터', '운동 20회 완료', workouts >= 20),
    m10: add('m10', '🍚', '집밥러', '식단 10끼 완료', meals >= 10),
    m50: add('m50', '👨‍🍳', '알뜰 셰프', '식단 50끼 완료', meals >= 50),
    s3: add('s3', '🔥', '3일 연속', '3일 연속 달성', best >= 3),
    s7: add('s7', '⚡', '일주일 연속', '7일 연속 달성', best >= 7),
    s30: add('s30', '👑', '한 달 연속', '30일 연속 달성', best >= 30),
    wt5: add('wt5', '⚖️', '기록왕', '체중 5회 기록', weights.length >= 5),
  };
  return list.map((b) => ({ ...b, earned: earned[b.id] }));
}
