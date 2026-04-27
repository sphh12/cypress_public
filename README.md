# GME Core - Cypress E2E Test Automation (Public)

## 📌 Overview

이 프로젝트는 **Cypress 기반의 GME Core 관리자 페이지 E2E 자동화 테스트** 저장소의 **공개용 버전**입니다.

GME Core 시스템의 관리자 기능(회원 조회, 승인/거부 처리, 로그 모니터링)에 대한 자동화 테스트를 실행하고, 결과를 이메일 및 Cypress Cloud로 리포팅합니다.

> ⚠️ **공개 저장소 안내**
> 이 저장소는 민감 정보가 모두 환경 변수로 분리되어 있습니다.
> 실제 실행을 위해서는 `.env` 파일을 생성하고 본인의 환경 정보를 입력해야 합니다.

### 주요 기능
- 관리자 로그인 및 회원 정보 조회 자동화
- 승인/거부 워크플로우 테스트
- Chrome native popup (Alert, Confirm) 자동 처리
- iframe 페이지 진입 유효성 검사 (`validatePage()`)
- 테스트 결과 이메일 발송
- Cypress Cloud 연동 및 대시보드 기록
- HTML 리포트 + 실패 시 비디오 자동 저장

---

## 🚀 Tech Stack

| 구분 | 기술 |
|------|------|
| 테스트 프레임워크 | Cypress 15.x |
| 언어 | JavaScript |
| 컨테이너 | Docker |
| CI/CD | Cypress Cloud |
| 리포트 | HTML Report, Video, Email |

---

## 📦 Installation

### 사전 요구사항
- Node.js v18 이상
- Docker Desktop
- VPN 연결 (내부망 서버 접속 시)

### 설치
```bash
yarn install
# 또는
npm install
```

### 환경 설정 파일 생성

이 저장소는 **공개용**이므로 민감 정보가 포함된 파일들이 모두 제외되어 있습니다.
실제 실행을 위해서는 아래 example 파일을 복사하여 본인의 환경에 맞게 수정해야 합니다:

```bash
# 환경 변수 파일
cp .env.example .env

# Google API 인증 파일
cp credentials.example.json credentials.json

# 테스트 데이터 파일
cp cypress/fixtures/testdata.example.json cypress/fixtures/testdata.json
```

| Example 파일 | 생성 파일 | 용도 |
|-------------|----------|------|
| `.env.example` | `.env` | SMTP, Cypress Cloud, 사이트 URL, 계정 정보, 테스트 데이터 |
| `credentials.example.json` | `credentials.json` | Google API 인증 정보 |
| `cypress/fixtures/testdata.example.json` | `cypress/fixtures/testdata.json` | 테스트 데이터 |

> ⚠️ `.env` 파일에는 다음 정보들이 포함됩니다:
> - SMTP 계정 (이메일 발송용)
> - Cypress Cloud Record Key
> - 사이트 URL (Live, Staging)
> - 테스트 계정 ID/PW
> - 고객 테스트 데이터 (주민번호, 계좌번호 등)

---

## ▶ How to Run

### Docker로 실행 (권장)
```bash
# 메인 테스트
docker compose up

# 개발 테스트 (Xvfb + xdotool, headed 모드)
docker compose --profile dev up

# View 폴더 전체 (페이지 진입 검증)
docker compose --profile view run --rm cypress-view
```

### 로컬에서 실행
```bash
# Cypress GUI 모드
yarn cypress open

# Headless 모드 (전체)
yarn cypress run

# 특정 테스트 파일 실행
yarn cypress run --spec "cypress/e2e/test/GME/gme.cy.js"

# Cypress Cloud에 기록
yarn cypress run --record --key $CYPRESS_RECORD_KEY
```

---

## 📁 Project Structure

```
cypress/
├── cypress/
│   ├── e2e/
│   │   ├── test/GME/
│   │   │   ├── gme.cy.js               # 메인 테스트 파일
│   │   │   ├── gme_dev.cy.js           # 개발 테스트 파일
│   │   │   └── view/                   # 메뉴별 페이지 진입 검증
│   │   │       ├── administration.cy.js
│   │   │       ├── inbound.cy.js
│   │   │       ├── other_services.cy.js
│   │   │       ├── remittance.cy.js
│   │   │       └── system_security.cy.js
│   │   └── module/
│   │       ├── iframe.js               # iframe 처리 + validatePage()
│   │       ├── click_alert.py          # 브라우저 Alert 자동 처리
│   │       └── *.module.js             # 공용 모듈
│   ├── fixtures/                       # 테스트 데이터
│   └── support/                        # 전역 설정
├── shell/
│   ├── run-test.sh                     # 메인 테스트 실행
│   ├── run-sample.sh                   # 개발 테스트 실행
│   ├── run-customer.sh                 # View 테스트 실행
│   ├── curl.sh                         # 이메일 발송
│   └── visualization.js                # 결과 시각화
├── docs/                               # 가이드 문서
├── docker-compose.yml                  # Docker 설정 (3개 프로필)
├── Dockerfile                          # Docker 이미지 빌드
├── cypress.config.js                   # Cypress 설정 (env vars)
├── .env.example                        # 환경 변수 템플릿
├── credentials.example.json            # Google API 템플릿
├── GIT_RULES.md                        # Git 푸시 규칙
└── CHANGE_NOTES.md                     # 변경 이력
```

---

## ⚙ Configuration

### 환경 변수 (.env)

`.env.example`을 복사하여 `.env`를 생성하고 본인의 환경에 맞게 수정합니다.

```env
# Cypress Cloud
CYPRESS_RECORD_KEY=your_cypress_record_key

# Gmail SMTP
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# 사이트 URL
LIVE_GME=http://your-server:port/Admin
STG_GME=http://your-stg-server:port/Admin

# 테스트 계정
LIVE_ID_GME01=your_username
LIVE_PW_GME01=your_password
LIVE_CODE_GME01=your_company_code

# 검색 키워드
SEARCH_USERNAME=test_username

# 고객 테스트 데이터
CUSTOMER_ID_NUMBER=YYMMDD-XXXXXXX
CUSTOMER_NAME=홍길동
BANK_A_NAME=Bank A
BANK_A_ACCOUNT=0000000000000
BANK_B_NAME=Bank B
BANK_B_ACCOUNT=0000000000000
```

### Cypress 환경 변수 사용 (테스트 코드)
```javascript
cy.visit(Cypress.env('live_gme'));
cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
```

---

## 💡 Usage Examples

### 기본 테스트 코드 구조
```javascript
import { getMainFrame, validatePage } from '../../module/iframe';

describe('GME - Core', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080);
        cy.visit(Cypress.env('live_gme'));
        cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
        cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
        cy.get('[name="btnLogin"]').click();
    });

    it('Login Logs - Login Success', () => {
        // 메뉴 진입
        cy.contains('Login Success').click();

        // iframe 페이지 진입 검증
        validatePage();

        // iframe 내부 요소 접근
        getMainFrame().find('h4.panel-title label').should('have.text', 'User Log');
    });
});
```

### iframe Alert/Confirm 처리
```javascript
import { stubIframeDialogs } from '../../module/iframe';

// 페이지 reload 없는 경우: Cypress Stub
stubIframeDialogs(true);
getMainFrame().find('#btnApprove').click();
cy.get('@confirmStub').should('have.been.calledWith', '예상 메시지');

// 페이지 reload 있는 경우: Python 하이브리드
cy.task('clickAlert');  // OS 레벨 Enter 입력
getMainFrame().find('#checkBtn').click();
```

---

## 🔄 CI/CD

### Cypress Cloud
- 테스트 실행 시 `--record` 플래그로 결과 자동 기록
- 비디오, 스크린샷, Test Replay 자동 업로드
- Project ID 및 Record Key는 `.env`에 설정

### Docker 실행 흐름
```
docker compose up
    ↓
1. Cypress 바이너리 설치
2. 테스트 실행 (Chrome headless)
3. 결과 Cypress Cloud 전송
4. HTML 리포트 + 비디오 저장 (실패 시만)
5. 이메일 발송
```

### 테스트 결과 확인
| 위치 | 설명 |
|------|------|
| Cypress Cloud | 실시간 대시보드, 비디오 기록 |
| `cypress-history/report_*/` | HTML 리포트 + 실패 비디오 |
| `result/result.txt` | 콘솔 결과 요약 |
| 이메일 | 테스트 완료 후 자동 발송 |

---

## 📋 Test Cases

### GME Core 관리자 기능
| 테스트 파일 | 테스트 수 | 설명 |
|------------|---------|------|
| `gme.cy.js` | 3 | Login 로그, 회원 정보 변경, New Device Login |
| `gme_dev.cy.js` | 2 | Modify Customer Bank, Bank Validation |
| `view/administration.cy.js` | 17 | Customer Management, KJ API, Online Customers |
| `view/inbound.cy.js` | 9 | Inbound, Receiver Initiated Inbound |
| `view/other_services.cy.js` | 10 | Coupon, Penny Test, GMEPay, TopUp 등 |
| `view/remittance.cy.js` | 30 | Compliance, OFAC Management, Reports |
| `view/system_security.cy.js` | 5 | Core System Logs, Mobile App Logs |

상세 페이지 목록은 [docs/View-Test-Pages.md](docs/View-Test-Pages.md) 참고

---

## 📚 Documentation

| 문서 | 설명 |
|------|------|
| [CHANGE_NOTES.md](CHANGE_NOTES.md) | 변경 이력 |
| [GIT_RULES.md](GIT_RULES.md) | Git 푸시 규칙 |
| [docs/Cypress-Browser-Alert-Handler.md](docs/Cypress-Browser-Alert-Handler.md) | Alert 처리 가이드 |
| [docs/Shell-Scripts-Guide.md](docs/Shell-Scripts-Guide.md) | Shell 스크립트 사용법 |
| [docs/Mac-Dev-Setup-Guide.md](docs/Mac-Dev-Setup-Guide.md) | Mac 개발 환경 설정 |

---

## 📝 Change Notes

변경 이력은 [CHANGE_NOTES.md](CHANGE_NOTES.md) 참고
