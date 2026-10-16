/** AI 코치 서버 주소 (배포할 때 VITE_COACH_API_URL로 지정). 없으면 서버 모드는 꺼진다. */
export const COACH_API_URL: string = import.meta.env.VITE_COACH_API_URL ?? '';

export type CoachMode = 'server' | 'key' | 'basic';

export function coachMode(apiKey: string): CoachMode {
  if (COACH_API_URL) return 'server';
  if (apiKey) return 'key';
  return 'basic';
}
