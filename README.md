# BudgetFit 💪🍚

예산, 목표, 생활 패턴에 맞춰 **운동**과 **저렴한 식단**을 설계해 주는 AI 건강관리 웹앱(PWA)입니다.
휴대폰 브라우저에서 열고 "홈 화면에 추가"하면 앱처럼 쓸 수 있어요.

## 주요 기능

| 탭 | 내용 |
|---|---|
| **오늘** | 오늘 먹을 식단과 운동을 체크리스트로 확인 |
| **식단** | 7일 식단, 메뉴별 재료·조리법·가격, **팩 단위 장보기 목록**(집에 있는 재료 체크 시 금액 차감) |
| **운동** | 가능한 요일·시간·장비·수준에 맞춘 주간 루틴(세트·횟수·휴식·자세 팁) |
| **AI 코치** | Claude 기반 상담. 내 프로필과 이번 주 플랜을 알고 메뉴 교체·예산 절약·운동 대체를 도와줌 |
| **내 정보** | 체중 기록 그래프, 기초대사량·목표 칼로리·탄단지, 목표 도달 예상 기간 |

## 플랜은 어떻게 만들어지나요?

- **목표 칼로리**: Mifflin-St Jeor 기초대사량 × 활동계수, 감량 -20% / 증량 +10% (기초대사량 아래로는 내려가지 않음)
- **단백질**: 감량·증량 체중 1kg당 1.6g, 유지 1.4g
- **식단** (`src/lib/mealPlanner.ts`): 실제 장보기는 팩 단위라서 메뉴 원가만 더하면 예산을 넘기 쉽습니다.
  그래서 일주일 전체의 **실제 장보기 금액**(일반 재료는 팩 값, 냉동·건조 등 오래 두는 재료는 사용분)과
  칼로리·단백질 오차, 메뉴 반복을 한 점수로 묶고, 담금질 기법(simulated annealing)으로 재료를 돌려 쓰는 식단을 찾습니다.
  하루 양은 목표 칼로리에 맞춰 0.8~1.6인분으로 조절합니다. 알레르기·기피 식품은 제외됩니다.
- **식사 시간**: 기상·취침 시간으로 계산(취침 3시간 전까지 저녁 마무리)
- **운동** (`src/lib/workoutPlanner.ts`): 주 1~3일 전신, 4일 상·하체 분할, 5일 이상 분할+유산소.
  목표에 따라 횟수·휴식을 바꾸고, 남는 시간은 유산소로 채웁니다. 선호 시간대에 맞춰 시작 시간을 잡습니다(저녁이면 저녁 식사 전).

재료 가격은 2026년 대형마트·온라인 평균을 기준으로 한 추정치이며 `src/data/foods.ts`에서 수정할 수 있습니다.

## AI 코치 (Claude)

- 모델: `claude-opus-5-5`, 스트리밍 응답, 서버 측 거절 폴백(`fallbacks: "default"`) 사용
- [Claude Console](https://console.anthropic.com/settings/keys)에서 발급한 **본인 API 키**를 앱에 입력해 사용합니다.
  키는 브라우저 localStorage에만 저장되고 Anthropic API로 직접 전송됩니다(별도 서버 없음).
  여러 사람에게 배포할 서비스라면 키를 서버에 두는 백엔드 프록시로 바꾸는 것을 권장합니다.
- 대화 시작 시 프로필·플랜을 시스템 프롬프트로 고정하고, 이후 대화는 응답 원문을 그대로 이어 붙입니다.
  플랜을 바꾸면 "새 대화"로 최신 플랜을 반영하세요.

AI 키가 없어도 식단·운동·장보기·기록 기능은 모두 오프라인으로 동작합니다.

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm run build      # dist/ 에 정적 파일 생성 (아무 정적 호스팅에나 올리면 됨)
npm run preview    # 빌드 결과 미리보기
npx tsx scripts/simulate.ts   # 여러 프로필로 식단 예산·영양 달성도 확인
```

`vite.config.ts`의 `base: './'` 덕분에 GitHub Pages 같은 하위 경로에서도 동작합니다.

## GitHub Pages 배포

`.github/workflows/deploy.yml`이 푸시할 때마다 빌드해서 Pages에 올립니다. 처음 한 번만 저장소 설정이 필요해요.

1. 저장소가 비공개라면 GitHub Pro 이상이 필요합니다. 무료 계정이면 **Settings → General → Danger Zone → Change visibility**에서 공개로 바꾸세요.
2. **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 선택하세요.
3. **Actions** 탭에서 "Deploy to GitHub Pages"를 다시 실행하면 `https://neo0364-coder.github.io/Budgetfit/` 에 올라갑니다.

휴대폰에서 주소를 열고 Safari는 공유 → **홈 화면에 추가**, Chrome은 메뉴 → **앱 설치 / 홈 화면에 추가**를 누르면 앱처럼 쓸 수 있어요.

## 구조

```
src/
  data/foods.ts         재료 가격·레시피 DB
  data/exercises.ts     운동 DB
  lib/nutrition.ts      칼로리·영양 목표 계산
  lib/mealPlanner.ts    주간 식단 최적화, 장보기 목록
  lib/workoutPlanner.ts 주간 운동 루틴
  lib/ai.ts             Claude API 호출
  lib/coachPrompt.ts    코치 시스템 프롬프트
  components/           화면
public/                 PWA 매니페스트, 서비스 워커, 아이콘
```

> 이 앱의 정보는 일반적인 건강 관리용 추정치이며 의학적 조언을 대신하지 않습니다.
