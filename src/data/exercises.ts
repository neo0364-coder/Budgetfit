import type { Equipment } from '../types';

export type Pattern = 'squat' | 'hinge' | 'push' | 'pull' | 'core' | 'lunge';

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  /** 이 운동을 할 수 있는 최소 장비 */
  equipment: Equipment;
  advanced?: boolean;
  cue: string;
}

export const EXERCISES: Exercise[] = [
  { id: 'bw-squat', name: '맨몸 스쿼트', pattern: 'squat', equipment: 'none', cue: '무릎은 발끝 방향, 엉덩이를 뒤로' },
  { id: 'jump-squat', name: '점프 스쿼트', pattern: 'squat', equipment: 'none', advanced: true, cue: '부드럽게 착지' },
  { id: 'goblet-squat', name: '고블릿 스쿼트', pattern: 'squat', equipment: 'dumbbell', cue: '덤벨을 가슴 앞에, 상체 세우기' },
  { id: 'barbell-squat', name: '바벨 백스쿼트', pattern: 'squat', equipment: 'gym', advanced: true, cue: '코어 고정, 허벅지 평행까지' },
  { id: 'leg-press', name: '레그 프레스', pattern: 'squat', equipment: 'gym', cue: '무릎을 완전히 잠그지 않기' },

  { id: 'glute-bridge', name: '글루트 브릿지', pattern: 'hinge', equipment: 'none', cue: '엉덩이를 조이며 들어올리기' },
  { id: 'sl-bridge', name: '싱글 레그 브릿지', pattern: 'hinge', equipment: 'none', advanced: true, cue: '골반이 기울지 않게' },
  { id: 'db-rdl', name: '덤벨 루마니안 데드리프트', pattern: 'hinge', equipment: 'dumbbell', cue: '허리 중립, 햄스트링 늘리기' },
  { id: 'deadlift', name: '바벨 데드리프트', pattern: 'hinge', equipment: 'gym', advanced: true, cue: '바를 몸에 붙여 끌어올리기' },

  { id: 'incline-pushup', name: '인클라인 푸시업(책상/벽)', pattern: 'push', equipment: 'none', cue: '몸을 일직선으로' },
  { id: 'pushup', name: '푸시업', pattern: 'push', equipment: 'none', advanced: true, cue: '팔꿈치 45도' },
  { id: 'db-press', name: '덤벨 플로어/벤치 프레스', pattern: 'push', equipment: 'dumbbell', cue: '견갑 고정' },
  { id: 'db-ohp', name: '덤벨 숄더 프레스', pattern: 'push', equipment: 'dumbbell', cue: '허리 꺾지 않기' },
  { id: 'bench', name: '벤치 프레스', pattern: 'push', equipment: 'gym', cue: '바를 명치 위로 내리기' },

  { id: 'towel-row', name: '수건 로우(문고리)', pattern: 'pull', equipment: 'none', cue: '견갑을 모으며 당기기' },
  { id: 'superman', name: '슈퍼맨', pattern: 'pull', equipment: 'none', cue: '등 근육으로 팔다리 들기' },
  { id: 'db-row', name: '원암 덤벨 로우', pattern: 'pull', equipment: 'dumbbell', cue: '팔꿈치를 골반 쪽으로' },
  { id: 'lat-pulldown', name: '랫 풀다운', pattern: 'pull', equipment: 'gym', cue: '가슴 위쪽으로 당기기' },
  { id: 'cable-row', name: '시티드 케이블 로우', pattern: 'pull', equipment: 'gym', cue: '상체 반동 금지' },

  { id: 'reverse-lunge', name: '리버스 런지', pattern: 'lunge', equipment: 'none', cue: '앞무릎이 안으로 모이지 않게' },
  { id: 'split-squat', name: '불가리안 스플릿 스쿼트', pattern: 'lunge', equipment: 'none', advanced: true, cue: '뒷발은 의자 위' },
  { id: 'db-lunge', name: '덤벨 워킹 런지', pattern: 'lunge', equipment: 'dumbbell', cue: '보폭 일정하게' },

  { id: 'plank', name: '플랭크', pattern: 'core', equipment: 'none', cue: '엉덩이가 처지지 않게' },
  { id: 'dead-bug', name: '데드버그', pattern: 'core', equipment: 'none', cue: '허리를 바닥에 붙이기' },
  { id: 'side-plank', name: '사이드 플랭크', pattern: 'core', equipment: 'none', cue: '몸통 일직선' },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: '맨몸(집)',
  dumbbell: '덤벨 있음',
  gym: '헬스장',
};

export const CARDIO: Record<Equipment, string[]> = {
  none: ['빠르게 걷기', '제자리 버피 인터벌(20초 운동/40초 휴식)', '계단 오르기'],
  dumbbell: ['빠르게 걷기', '덤벨 스러스터 인터벌(30초/30초)', '계단 오르기'],
  gym: ['인클라인 트레드밀 걷기', '실내 사이클', '로잉머신'],
};
