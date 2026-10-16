# 알뜰핏 💪🍚

내 **예산**, **목표**, **생활 패턴**에 맞춰 운동과 저렴한 집밥 식단을 짜 주는 무료 건강관리 웹앱(PWA)입니다.
휴대폰에서 주소를 열고 "홈 화면에 추가"하면 앱처럼 쓸 수 있어요.

👉 https://neo0364-coder.github.io/Budgetfit/

## 주요 기능

| 탭 | 내용 |
|---|---|
| **오늘** | 인사말·오늘의 한마디, 오늘 미션(식사·운동) 진행 링, 연속 달성일 🔥, 이번 주 기록 |
| **식단** | 7일 식단, 재료·만드는 법·레시피 영상 검색, **팩 단위 장보기 목록**, 식단 난이도(쉬움/보통/도전) |
| **운동** | 주간 루틴, 운동을 누르면 **방법·주의점 + 유튜브 자세 영상** 바로가기, 운동 난이도(쉬움/보통/도전) |
| **코치** | 무료 기본 코치(인터넷 없이 동작) 또는 AI 코치(Claude). 식비 절약·메뉴 교체·통증 시 대체 운동 등 |
| **내 정보** | 배지 10종 🏅, 체중 그래프, 목표 숫자, 화면 테마(밝게/어둡게/기기 설정) |

식사·운동을 완료하면 칭찬 메시지와 축하 효과가 나오고, 오늘 미션을 모두 끝내거나 새 배지를 따면 한 번 더 축하해요.

## 플랜은 어떻게 만들어지나요?

- **목표 칼로리**: Mifflin-St Jeor 기초대사량 × 활동계수. 식단 난이도에 따라 감량 -10/-20/-25%, 증량 +5/+10/+15% (기초대사량 아래로는 내려가지 않음)
- **단백질**: 체중 1kg당 1.2~1.8g (목표·난이도별)
- **식단** (`src/lib/mealPlanner.ts`): 재료는 팩 단위로 사야 해서 메뉴 원가만 더하면 예산을 넘기 쉽습니다.
  그래서 일주일 전체의 **실제 장보기 금액**(일반 재료는 팩 값, 냉동·건조처럼 오래 두는 재료는 사용분)과
  칼로리·단백질 오차, 메뉴 반복을 한 점수로 묶고, 담금질 기법(simulated annealing)으로 재료를 돌려 쓰는 식단을 찾습니다.
  식단 난이도 "쉬움"이면 조리 시간이 짧은 메뉴를 고릅니다.
- **운동** (`src/lib/workoutPlanner.ts`): 주 1~3일 전신, 4일 상·하체 분할, 5일 이상 분할+유산소.
  난이도에 따라 세트 수(2/3/4), 휴식 시간, 고를 수 있는 동작(의자 스쿼트 → 점프 스쿼트 등)이 바뀝니다.

재료 가격은 2026년 대형마트·온라인 평균을 기준으로 한 추정치이며 `src/data/foods.ts`에서 고칠 수 있습니다.
운동 설명과 유튜브 검색어는 `src/data/exercises.ts`에 있습니다.

## 코치: 누구나 쓸 수 있게

코치는 세 가지 방식 중 하나로 동작합니다. 위에서부터 먼저 켜져 있는 방식을 씁니다.

1. **AI 코치 서버** — 운영자가 서버 하나를 올려 두면, 이용자는 **가입이나 API 키 없이** AI 코치를 씁니다.
2. **내 API 키** — 서버가 없을 때, 내 정보 → 고급 설정에서 본인 Claude API 키를 넣은 사람만 AI 코치를 씁니다.
3. **기본 코치** — 위 둘이 없거나 AI 연결이 실패하면, 앱 안의 규칙 기반 코치가 내 플랜 데이터로 답합니다(무료·오프라인).

### AI 코치 서버 올리기 (Cloudflare Workers, 무료 요금제로 시작 가능)

`server/worker.ts`는 운영자의 Anthropic API 키를 서버에만 보관하고 앱의 질문을 Claude에 전달합니다.
아무 글이나 보내는 범용 프록시로 쓰이지 않도록, 시스템 프롬프트는 서버가 직접 만들고
요청 데이터(프로필·플랜·대화)는 정해진 형태와 길이만 받습니다. IP당 10분에 20회까지 질문할 수 있습니다.

1. [Claude Console](https://console.anthropic.com)에서 API 키를 만들고, **Limits에서 월 지출 한도를 꼭 설정**하세요.
2. [Cloudflare](https://dash.cloudflare.com) 계정을 만든 뒤 이 저장소에서:
   ```bash
   npm install
   cd server
   npx wrangler login
   npx wrangler secret put ANTHROPIC_API_KEY   # 키 붙여넣기
   npx wrangler deploy
   ```
   배포가 끝나면 `https://alddeulfit-coach.<계정>.workers.dev` 같은 주소가 나옵니다.
3. GitHub 저장소 **Settings → Secrets and variables → Actions → Variables**에 `COACH_API_URL` = 위 주소를 추가하고,
   Actions에서 "Deploy to GitHub Pages"를 다시 실행하면 앱이 AI 코치 서버를 씁니다.

`server/wrangler.toml`에서 허용 사이트(`ALLOWED_ORIGINS`), 질문 횟수(`RATE_LIMIT`), 모델(`COACH_MODEL`)을 바꿀 수 있습니다.

**비용 참고** (질문 1회, 시스템 프롬프트 약 2천 토큰 + 답변 약 500 토큰 기준 대략값)
- 기본값 `claude-opus-5-5`: 약 $0.02~0.03 (30~40원)
- `claude-haiku-5-5`로 바꾸면: 약 $0.001 미만 (1원 안팎). 답변 품질은 Opus보다 단순할 수 있습니다.

로컬 검사: `npx tsx scripts/test-worker.ts` (가짜 Anthropic API로 검증·CORS·횟수 제한·스트리밍 확인)

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run build      # dist/ 에 정적 파일 생성
npm run preview    # 빌드 결과 미리보기
npx tsx scripts/simulate.ts      # 여러 프로필로 식단 예산·영양 달성도 확인
npx tsx scripts/test-worker.ts   # AI 코치 서버 검사
```

## GitHub Pages 배포

`.github/workflows/deploy.yml`이 푸시할 때마다 빌드해서 Pages에 올립니다. 처음 한 번만 저장소 설정이 필요해요.

1. 저장소가 비공개라면 GitHub Pro 이상이 필요합니다. 무료 계정이면 **Settings → General → Danger Zone → Change visibility**에서 공개로 바꾸세요.
2. **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택하세요.
3. **Actions** 탭에서 "Deploy to GitHub Pages"를 다시 실행하면 `https://neo0364-coder.github.io/Budgetfit/` 에 올라갑니다.

휴대폰에서 주소를 열고 Safari는 공유 → **홈 화면에 추가**, Chrome은 메뉴 → **앱 설치 / 홈 화면에 추가**를 누르면 앱처럼 쓸 수 있어요.

## 구조

```
src/
  data/foods.ts         재료 가격·레시피
  data/exercises.ts     운동 방법·주의점·영상 검색어
  lib/nutrition.ts      칼로리·영양 목표
  lib/mealPlanner.ts    주간 식단 최적화, 장보기 목록
  lib/workoutPlanner.ts 주간 운동 루틴
  lib/motivation.ts     오늘의 한마디, 칭찬, 연속 달성, 배지
  lib/basicCoach.ts     기본 코치(오프라인)
  lib/coachPrompt.ts    AI 코치 시스템 프롬프트
  lib/coachContext.ts   AI 코치 서버의 요청 검사
  lib/coachRequest.ts   Claude 요청 본문 (앱·서버 공용)
  lib/ai.ts             AI 코치 호출 (서버 / 내 키)
  components/           화면
server/                 AI 코치 서버 (Cloudflare Workers)
public/                 PWA 매니페스트, 서비스 워커, 아이콘
```

> 이 앱의 정보는 일반적인 건강 관리용 추정치이며 의학적 조언을 대신하지 않습니다.
