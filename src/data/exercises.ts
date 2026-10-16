import type { Difficulty, Equipment } from '../types';

export type Pattern = 'squat' | 'hinge' | 'push' | 'pull' | 'core' | 'lunge';

export interface Exercise {
  id: string;
  name: string;
  pattern: Pattern;
  /** 이 운동을 할 수 있는 최소 장비 */
  equipment: Equipment;
  /** 이 난이도 이상에서만 추천 */
  minLevel: Difficulty;
  /** 한 줄 자세 팁 */
  cue: string;
  muscles: string;
  steps: string[];
  mistakes: string[];
  /** 유튜브 검색어 */
  video: string;
}

export const EXERCISES: Exercise[] = [
  // 스쿼트
  {
    id: 'chair-squat', name: '의자 스쿼트', pattern: 'squat', equipment: 'none', minLevel: 1,
    cue: '의자에 살짝 앉았다 일어나기', muscles: '허벅지 앞·엉덩이',
    steps: ['의자 앞에 발을 어깨너비로 벌리고 선다', '팔을 앞으로 뻗고 엉덩이를 뒤로 빼며 앉는다', '엉덩이가 의자에 닿으면 바로 발바닥으로 밀며 일어난다'],
    mistakes: ['무릎이 안쪽으로 모이지 않게', '털썩 앉지 말고 살짝만 터치'],
    video: '의자 스쿼트 자세',
  },
  {
    id: 'bw-squat', name: '맨몸 스쿼트', pattern: 'squat', equipment: 'none', minLevel: 1,
    cue: '무릎은 발끝 방향, 엉덩이를 뒤로', muscles: '허벅지 앞·엉덩이',
    steps: ['발을 어깨너비, 발끝은 살짝 바깥으로', '가슴을 펴고 엉덩이를 뒤로 빼며 앉는다', '허벅지가 바닥과 평행해질 때까지 내려간다', '발바닥 전체로 밀며 일어난다'],
    mistakes: ['뒤꿈치가 들리지 않게', '허리가 둥글게 말리지 않게'],
    video: '맨몸 스쿼트 정자세',
  },
  {
    id: 'jump-squat', name: '점프 스쿼트', pattern: 'squat', equipment: 'none', minLevel: 3,
    cue: '부드럽게 착지', muscles: '허벅지·엉덩이·심폐',
    steps: ['스쿼트 자세로 앉는다', '힘껏 위로 점프한다', '발 앞쪽부터 부드럽게 착지하며 다시 스쿼트'],
    mistakes: ['무릎을 편 채로 쿵 착지하지 않기', '층간소음이 걱정되면 맨몸 스쿼트로 대체'],
    video: '점프 스쿼트 자세',
  },
  {
    id: 'goblet-squat', name: '고블릿 스쿼트', pattern: 'squat', equipment: 'dumbbell', minLevel: 1,
    cue: '덤벨을 가슴 앞에, 상체 세우기', muscles: '허벅지 앞·엉덩이·코어',
    steps: ['덤벨 한쪽 끝을 두 손으로 가슴 앞에 든다', '팔꿈치가 무릎 안쪽을 스치도록 앉는다', '발바닥으로 밀며 일어난다'],
    mistakes: ['덤벨이 몸에서 멀어지지 않게', '상체가 앞으로 쏟아지지 않게'],
    video: '고블릿 스쿼트 자세',
  },
  {
    id: 'leg-press', name: '레그 프레스', pattern: 'squat', equipment: 'gym', minLevel: 1,
    cue: '무릎을 완전히 잠그지 않기', muscles: '허벅지·엉덩이',
    steps: ['등과 엉덩이를 패드에 붙이고 발을 어깨너비로', '무릎이 90도가 될 때까지 천천히 내린다', '발바닥 전체로 밀어낸다'],
    mistakes: ['엉덩이가 패드에서 뜨지 않게', '끝에서 무릎을 쭉 펴서 잠그지 않기'],
    video: '레그프레스 자세',
  },
  {
    id: 'barbell-squat', name: '바벨 백스쿼트', pattern: 'squat', equipment: 'gym', minLevel: 3,
    cue: '코어 고정, 허벅지 평행까지', muscles: '하체 전체·코어',
    steps: ['바를 승모근 위에 얹고 숨을 들이마셔 코어를 고정', '엉덩이를 뒤로 빼며 허벅지 평행까지 앉는다', '바닥을 밀며 일어난다'],
    mistakes: ['처음에는 빈 봉으로 자세부터', '안전바를 꼭 설정'],
    video: '바벨 스쿼트 자세 초보',
  },
  // 힌지
  {
    id: 'glute-bridge', name: '글루트 브릿지', pattern: 'hinge', equipment: 'none', minLevel: 1,
    cue: '엉덩이를 조이며 들어올리기', muscles: '엉덩이·허벅지 뒤',
    steps: ['누워서 무릎을 세우고 발을 엉덩이 가까이 둔다', '엉덩이를 조이며 어깨–무릎이 일직선이 될 때까지 들어올린다', '1초 멈췄다가 천천히 내린다'],
    mistakes: ['허리로 들지 말고 엉덩이로', '갈비뼈가 들리지 않게 배에 힘'],
    video: '글루트 브릿지 자세',
  },
  {
    id: 'sl-bridge', name: '싱글 레그 브릿지', pattern: 'hinge', equipment: 'none', minLevel: 3,
    cue: '골반이 기울지 않게', muscles: '엉덩이·허벅지 뒤',
    steps: ['브릿지 자세에서 한쪽 다리를 펴서 든다', '남은 다리로 엉덩이를 들어올린다', '양쪽 번갈아 같은 횟수'],
    mistakes: ['골반이 한쪽으로 처지지 않게'],
    video: '싱글 레그 브릿지',
  },
  {
    id: 'db-rdl', name: '덤벨 루마니안 데드리프트', pattern: 'hinge', equipment: 'dumbbell', minLevel: 2,
    cue: '허리 중립, 햄스트링 늘리기', muscles: '허벅지 뒤·엉덩이·등',
    steps: ['덤벨을 허벅지 앞에 들고 무릎을 살짝 굽힌다', '엉덩이를 뒤로 밀며 덤벨을 다리 따라 내린다', '허벅지 뒤가 당기면 엉덩이를 앞으로 밀며 선다'],
    mistakes: ['등이 굽지 않게 가슴 펴기', '덤벨이 몸에서 멀어지지 않게'],
    video: '덤벨 루마니안 데드리프트 자세',
  },
  {
    id: 'deadlift', name: '바벨 데드리프트', pattern: 'hinge', equipment: 'gym', minLevel: 3,
    cue: '바를 몸에 붙여 끌어올리기', muscles: '등·엉덩이·허벅지 뒤',
    steps: ['바가 발 중앙 위에 오게 선다', '허리를 펴고 바를 잡은 뒤 다리로 바닥을 민다', '바를 몸에 붙인 채로 일어선다'],
    mistakes: ['허리가 굽으면 무게를 낮추기', '처음에는 트레이너에게 자세 확인'],
    video: '데드리프트 자세 초보',
  },
  // 푸시
  {
    id: 'wall-pushup', name: '벽 푸시업', pattern: 'push', equipment: 'none', minLevel: 1,
    cue: '벽 짚고 가슴을 벽 쪽으로', muscles: '가슴·팔 뒤·어깨',
    steps: ['벽에서 한 걸음 떨어져 손을 어깨 높이로 짚는다', '몸을 일직선으로 유지하며 가슴을 벽에 가까이', '손바닥으로 밀어 돌아온다'],
    mistakes: ['엉덩이가 뒤로 빠지지 않게'],
    video: '벽 푸시업 자세',
  },
  {
    id: 'incline-pushup', name: '인클라인 푸시업(책상/의자)', pattern: 'push', equipment: 'none', minLevel: 2,
    cue: '몸을 일직선으로', muscles: '가슴·팔 뒤·어깨',
    steps: ['책상이나 튼튼한 의자 모서리를 짚는다', '몸을 일직선으로 유지하며 가슴을 내린다', '밀어서 올라온다'],
    mistakes: ['허리가 처지지 않게 배에 힘', '팔꿈치가 옆으로 벌어지지 않게(45도)'],
    video: '인클라인 푸시업 자세',
  },
  {
    id: 'pushup', name: '푸시업', pattern: 'push', equipment: 'none', minLevel: 3,
    cue: '팔꿈치 45도', muscles: '가슴·팔 뒤·어깨·코어',
    steps: ['손을 어깨너비보다 조금 넓게 짚고 플랭크 자세', '가슴이 바닥 가까이 갈 때까지 내린다', '몸 전체를 한 덩어리로 밀어 올린다'],
    mistakes: ['엉덩이만 먼저 올라오지 않게', '힘들면 무릎 대고 하기'],
    video: '푸시업 정자세',
  },
  {
    id: 'db-press', name: '덤벨 플로어/벤치 프레스', pattern: 'push', equipment: 'dumbbell', minLevel: 1,
    cue: '견갑 고정', muscles: '가슴·팔 뒤',
    steps: ['누워서 덤벨을 가슴 옆에 든다', '가슴 위로 밀어 올린다', '천천히 팔꿈치가 바닥(벤치 높이)에 닿을 때까지 내린다'],
    mistakes: ['손목이 꺾이지 않게', '어깨가 들리지 않게'],
    video: '덤벨 플로어 프레스',
  },
  {
    id: 'db-ohp', name: '덤벨 숄더 프레스', pattern: 'push', equipment: 'dumbbell', minLevel: 2,
    cue: '허리 꺾지 않기', muscles: '어깨·팔 뒤',
    steps: ['덤벨을 귀 옆 높이로 든다', '머리 위로 밀어 올린다', '천천히 귀 높이까지 내린다'],
    mistakes: ['허리를 젖히지 말고 배에 힘'],
    video: '덤벨 숄더프레스 자세',
  },
  {
    id: 'bench', name: '벤치 프레스', pattern: 'push', equipment: 'gym', minLevel: 2,
    cue: '바를 명치 위로 내리기', muscles: '가슴·팔 뒤·어깨',
    steps: ['벤치에 누워 눈 아래에 바가 오게 한다', '견갑을 모으고 바를 명치 쪽으로 내린다', '가슴으로 밀어 올린다'],
    mistakes: ['엉덩이가 벤치에서 뜨지 않게', '무거우면 보조자와 함께'],
    video: '벤치프레스 자세 초보',
  },
  // 풀
  {
    id: 'superman', name: '슈퍼맨', pattern: 'pull', equipment: 'none', minLevel: 1,
    cue: '등 근육으로 팔다리 들기', muscles: '등·허리·엉덩이',
    steps: ['엎드려 팔을 앞으로 뻗는다', '팔·가슴·다리를 동시에 살짝 든다', '2초 버티고 천천히 내린다'],
    mistakes: ['고개를 너무 젖히지 않게, 시선은 바닥'],
    video: '슈퍼맨 운동 자세',
  },
  {
    id: 'towel-row', name: '수건 로우(문고리)', pattern: 'pull', equipment: 'none', minLevel: 2,
    cue: '견갑을 모으며 당기기', muscles: '등·팔 앞',
    steps: ['닫힌 문 손잡이 양쪽에 수건을 걸고 양손으로 잡는다', '몸을 뒤로 기울여 팔을 편다', '견갑을 모으며 가슴을 문 쪽으로 당긴다'],
    mistakes: ['문이 확실히 잠겼는지 먼저 확인', '팔로만 당기지 말고 등으로'],
    video: '수건 로우 홈트',
  },
  {
    id: 'db-row', name: '원암 덤벨 로우', pattern: 'pull', equipment: 'dumbbell', minLevel: 1,
    cue: '팔꿈치를 골반 쪽으로', muscles: '등·팔 앞',
    steps: ['한 손과 무릎을 의자에 대고 등을 평평하게', '반대 손으로 덤벨을 골반 쪽으로 당긴다', '천천히 내린다'],
    mistakes: ['몸통을 비틀지 않게'],
    video: '원암 덤벨로우 자세',
  },
  {
    id: 'lat-pulldown', name: '랫 풀다운', pattern: 'pull', equipment: 'gym', minLevel: 1,
    cue: '가슴 위쪽으로 당기기', muscles: '등·팔 앞',
    steps: ['바를 어깨보다 넓게 잡고 앉는다', '가슴을 펴고 바를 쇄골 쪽으로 당긴다', '천천히 올린다'],
    mistakes: ['몸을 뒤로 크게 젖히지 않기'],
    video: '랫풀다운 자세',
  },
  {
    id: 'cable-row', name: '시티드 케이블 로우', pattern: 'pull', equipment: 'gym', minLevel: 2,
    cue: '상체 반동 금지', muscles: '등 중앙·팔 앞',
    steps: ['허리를 펴고 앉아 손잡이를 잡는다', '견갑을 모으며 배꼽 쪽으로 당긴다', '천천히 팔을 편다'],
    mistakes: ['허리를 앞뒤로 흔들지 않기'],
    video: '시티드 케이블 로우 자세',
  },
  // 런지
  {
    id: 'step-back', name: '스텝백 (반동작 런지)', pattern: 'lunge', equipment: 'none', minLevel: 1,
    cue: '벽이나 의자를 잡고 해도 OK', muscles: '허벅지·엉덩이',
    steps: ['한 발을 뒤로 작게 내딛는다', '무릎을 살짝만 굽혔다가', '앞발로 밀어 제자리로'],
    mistakes: ['균형이 어려우면 벽을 짚기'],
    video: '초보 런지 자세',
  },
  {
    id: 'reverse-lunge', name: '리버스 런지', pattern: 'lunge', equipment: 'none', minLevel: 2,
    cue: '앞무릎이 안으로 모이지 않게', muscles: '허벅지·엉덩이',
    steps: ['한 발을 크게 뒤로 내딛는다', '뒷무릎이 바닥 가까이 갈 때까지 내려간다', '앞발 뒤꿈치로 밀어 돌아온다'],
    mistakes: ['상체가 앞으로 숙여지지 않게'],
    video: '리버스 런지 자세',
  },
  {
    id: 'split-squat', name: '불가리안 스플릿 스쿼트', pattern: 'lunge', equipment: 'none', minLevel: 3,
    cue: '뒷발은 의자 위', muscles: '허벅지·엉덩이',
    steps: ['의자 앞에서 한쪽 발등을 의자에 올린다', '앞다리로 천천히 앉는다', '앞발로 밀며 일어난다'],
    mistakes: ['앞발이 의자에 너무 가깝지 않게'],
    video: '불가리안 스플릿 스쿼트 자세',
  },
  {
    id: 'db-lunge', name: '덤벨 워킹 런지', pattern: 'lunge', equipment: 'dumbbell', minLevel: 2,
    cue: '보폭 일정하게', muscles: '하체 전체',
    steps: ['덤벨을 양손에 든다', '앞으로 크게 내딛으며 런지', '뒷발을 앞으로 가져오며 반대쪽 반복'],
    mistakes: ['무릎이 흔들리면 덤벨 없이 먼저'],
    video: '덤벨 워킹런지 자세',
  },
  // 코어
  {
    id: 'knee-plank', name: '무릎 플랭크', pattern: 'core', equipment: 'none', minLevel: 1,
    cue: '머리–무릎 일직선', muscles: '복부·코어',
    steps: ['팔꿈치를 어깨 아래에 대고 무릎을 바닥에 둔다', '머리부터 무릎까지 일직선으로 버틴다', '숨은 참지 말고 천천히'],
    mistakes: ['엉덩이가 너무 높지 않게'],
    video: '무릎 플랭크',
  },
  {
    id: 'plank', name: '플랭크', pattern: 'core', equipment: 'none', minLevel: 2,
    cue: '엉덩이가 처지지 않게', muscles: '복부·코어·어깨',
    steps: ['팔꿈치를 어깨 아래에 대고 발끝으로 선다', '배꼽을 당기고 엉덩이를 조인다', '머리부터 발뒤꿈치까지 일직선으로 버틴다'],
    mistakes: ['허리가 처지면 무릎 플랭크로', '숨 참지 않기'],
    video: '플랭크 정자세',
  },
  {
    id: 'dead-bug', name: '데드버그', pattern: 'core', equipment: 'none', minLevel: 1,
    cue: '허리를 바닥에 붙이기', muscles: '복부·코어',
    steps: ['누워서 팔은 천장으로, 무릎은 90도로 든다', '오른팔과 왼다리를 천천히 뻗는다', '돌아와서 반대쪽'],
    mistakes: ['허리가 뜨면 동작을 작게'],
    video: '데드버그 운동',
  },
  {
    id: 'side-plank', name: '사이드 플랭크', pattern: 'core', equipment: 'none', minLevel: 3,
    cue: '몸통 일직선', muscles: '옆구리·코어',
    steps: ['옆으로 누워 팔꿈치를 어깨 아래에 둔다', '골반을 들어 일직선으로 버틴다', '반대쪽도 같은 시간'],
    mistakes: ['골반이 처지지 않게', '힘들면 아래 무릎을 바닥에'],
    video: '사이드 플랭크 자세',
  },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

export function videoUrl(e: Exercise): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(e.video)}`;
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: '맨몸(집)',
  dumbbell: '덤벨 있음',
  gym: '헬스장',
};

export const CARDIO: Record<Equipment, string[]> = {
  none: ['빠르게 걷기', '제자리 걷기 인터벌(1분 빠르게/1분 천천히)', '계단 오르기'],
  dumbbell: ['빠르게 걷기', '덤벨 스러스터 인터벌(30초/30초)', '계단 오르기'],
  gym: ['인클라인 트레드밀 걷기', '실내 사이클', '로잉머신'],
};
