# Change Notes

## 2026-04-27

### 🌐 Public 저장소 분리 (cypress_public)
- **목적**: 외부 공개를 위한 민감정보 제거 버전 생성
- **브랜치**: `main` 기준으로 `public` 브랜치 생성
- **민감정보 제거**:
  - `.env`, `credentials.json`, `cypress/fixtures/testdata.json` Git 추적 제거
  - `.gitlab-ci.yml.bak`, `.history/` (597개 파일), `cypress-history/` 제거
  - `.gitignore` Public 모드로 전환 (민감 파일 제외)
- **환경변수 분리**:
  - `cypress.config.js`의 모든 하드코딩(ID/PW/계좌번호/주민번호/실명) → `process.env` 참조
  - `dotenv` 패키지 추가 (`require('dotenv').config()`)
  - `.env.example` 전체 환경변수 템플릿 작성
- **테스트 코드 환경변수화**:
  - `gme.cy.js`, `gme_dev.cy.js`, `view/administration.cy.js`, `view/system_security.cy.js`
  - `'sphh'` → `Cypress.env('search_username')`
  - `'philiph'` → `Cypress.env('live_id_gme01')`
- **README.md 전면 업데이트**: Public 저장소 안내, 환경변수 가이드, 88개 테스트 케이스 정리
- **푸시**: GitHub + GitLab `cypress_public` 양쪽 모두

---

## 2026-04-09

### 🔧 Customer Statement — DOM detach 에러 수정
- 포스트백 후 `.then($body =>` 캡처한 body가 분리되어 테이블을 못 찾는 문제
- `.should('not.be.empty')` → `.should($body => { expect(테이블 or No data).to.be.true })` 재시도 패턴으로 변경
- `getMainFrame().find('body')` 오류 수정 — `getMainFrame()`이 이미 body를 반환하므로 제거
- Tab 3(Inbound)만 "No wallet statement found" 허용, 나머지 탭은 테이블 필수로 엄격 검증

### 🆕 Online Remit — 8개 탭 검증 스크립트 신규 작성
- **메뉴 경로**: Administration > Online Customers > Online Remit
- **8개 탭**: Approve Pending, Approved List, Customer Setup, Verify Pending, Audit List, Inactive Customer List, Document Re-Request List, Document Upload List
- Tab 3(Customer Setup)은 등록 폼이므로 화면 진입만 확인
- 나머지 7개 탭: Search By → Native Country → south korea → 날짜(있으면 2026-01-01~04-09) → Filter → 데이터 테이블 확인
- 탭별 고유 DOM ID 차이 대응 (grid_list_, grid_al_, grid_pl_, grid_Il_, grid_listReUp_)

### 🐛 Online Remit 에러 수정
1. `find('button').contains('Filter')` — 첫 번째 button(닫기 버튼) 내부에서 검색 → `contains('button', 'Filter')`로 변경
2. `contains('button', 'Filter')` — `<input type="button" value="Filter">` 형태라 textContent가 비어있어 실패 → `win.jQuery('input[value="Filter"], button:contains("Filter")')` 패턴 적용

### 🐛 debugger 문 이슈 해결
- 애플리케이션 소스(List.aspx)에 `debugger;` 문이 남아있어 DevTools 열린 상태에서 실행 중단
- `debugger;`는 DevTools가 닫혀있으면 자동 무시됨 — DevTools 닫고 실행으로 해결

### 📝 문서 업데이트
- `docs/Cypress-Troubleshooting-Guide.md` — 에러 6건 추가 + 주요 패턴 4개 신규 섹션 추가
- `CHANGE_NOTES.md` — 2026-04-09 변경 내용 추가

---

## 2026-04-07

### 🔧 administration2.cy.js - Customer Statement 상세 검증 구현 완료
- **5개 탭 순회 검색 시나리오** 구현 (Outbound, Account, Inbound, Domestic, Oris)
- Tab 1: jQuery UI autocomplete로 고객 검색 + customerData 저장
- Tab 2~4: 저장된 customerData를 hidden 필드에 직접 설정 (AJAX 엔드포인트 차이 대응)
- Tab 5 (Oris): 고객 ID 형식이 다르므로 (숫자 636027) 자체 autocomplete 실행
- datepicker API로 날짜 설정 + Filter 클릭 → 데이터 테이블 또는 "No wallet statement found" 확인

### 🐛 Customer Statement 에러 수정 이력
1. `#CustomerInfo_aText` display:none → jQuery `$search.show()` 후 autocomplete 호출
2. datepicker 팝업이 End Date 필드를 가림 → `.datepicker('setDate')` API로 직접 날짜 설정
3. jQuery `.val()` 날짜를 서버가 인식 못함 → `.datepicker('setDate').trigger('change')` 동기화
4. Filter 후 결과 페이지에서 탭 못 찾음 → iframe `src` 직접 변경으로 탭 이동
5. 포스트백 후 DOM 분리로 테이블 못 찾음 → `cy.wait(5000)` 추가
6. autocomplete `.click()`이 jQuery UI `select` 이벤트 미트리거 → `$firstItem.data('uiAutocompleteItem')`에서 `id` 추출하여 `aValue` 직접 설정
7. Tab 2~5 autocomplete AJAX 엔드포인트가 달라 `ERR_EMPTY_RESPONSE` → Tab 1에서만 autocomplete, Tab 2~4는 직접 설정
8. `CheckFormValidation()` AJAX 에러 콜백에서 alert 발생 → `win.alert` 재정의로 억제
9. Tab 5 Oris 고객 ID 형식 차이 (M587W9405 vs 636027) → Oris 전용 autocomplete 실행

### 📝 docs/Cypress-Troubleshooting-Guide.md 업데이트
- Customer Statement 관련 에러/수정 내용 9건 추가
- 자동 업데이트 정책 적용 중

---

## 2026-04-03

### 🛡️ validatePage DOM detach 방어 로직 추가
- **문제**: iframe 로딩 중 DOM이 갱신되어 `should()` 체인에서 detached 에러 간헐 발생
- **해결**: 1단계와 2단계 사이에 iframe 안정화 대기 로직 추가
  - `.panel`이 나타날 때까지 단일 체인으로 재시도 (timeout: 20초)
  - 테스트용 `console.log` 블록 제거
- **결과**: 71개 전체 통과 확인 (runs/8)

### 📝 administration2.cy.js 타이틀 검증 추가
- 17개 테스트 항목에 `h4.panel-title label` 타이틀 확인 코드 추가
- 2초 딜레이 + `should('have.text', '타이틀')` 패턴 적용
- **88개 전체 통과 확인** (runs/12)

### 🔍 administration2.cy.js 상세 검증 추가 (수동 작업)
- Customer Statement: 5개 탭 검색 시나리오 (autocomplete + datepicker + Filter)
- Receiver Details: 검색 + View 팝업 상세정보 검증
- Customer ID Verification: 검색 + Verification + intercept로 alert 검증

---

## 2026-03-30

### 🔄 Cypress Cloud 프로젝트 변경
- **사유**: 기존 프로젝트(`zhpyoq`) 무료 플랜 용량 초과
- **변경**: 새 프로젝트(`tagp8n`)로 전환
- `cypress.config.js`: `projectId` 변경 (`zhpyoq` → `tagp8n`)
- `.env`: `CYPRESS_RECORD_KEY` 변경
- Cloud 기록 정상 확인 완료 (runs/3)

### ✅ View 테스트 Docker 실행 검증
- `docker compose --profile view run --rm cypress-view` 실행
- **71개 테스트 전체 통과** (10분 46초)
  - administration(17), inbound(9), other_services(10), remittance(30), system_security(5)
- Cloud 기록: https://cloud.cypress.io/projects/tagp8n/runs/4
- HTML 리포트 저장 및 이메일 발송 정상 확인

---

## 2026-03-17

### 🔍 페이지 진입 유효성 검사 구현

#### iframe.js - validatePage 함수 추가
- **5단계 유효성 검사**: iframe 로딩 → 서버 에러 → 레이아웃 요소 → 로딩 완료 → 통과
- **검증 요소 변경**: 기존 `.panel, .container, .content-wrapper` (OR 조건, 느슨한 검증)
  → `.page-wrapper` (1개), `.panel` (1개 이상) AND 조건 개별 검증으로 강화
- **`#form1` 제거**: 일부 페이지(Customer Statement 등)에 존재하지 않아 제외
- **선정 근거**: 실제 페이지 분석 결과 `.container`, `.content-wrapper`는 iframe 내부에 0개

#### view 폴더 테스트 파일 생성
- `cypress/e2e/test/GME/view/` 폴더에 메뉴별 페이지 진입 테스트 배치
  - `customer_management.cy.js` - Customer Management 하위 11개 메뉴
  - `administration.cy.js` - Administration 하위 메뉴
  - `system_security.cy.js` - System Security 하위 메뉴
  - `other_services.cy.js` - Other Services 하위 메뉴
  - `remittance.cy.js` - Remittance 하위 메뉴
  - `inbound.cy.js` - Inbound 하위 메뉴

#### Docker View 프로필 추가
- **docker-compose.yml**: `cypress-view` 서비스 추가 (profile: view)
- **shell/run-customer.sh**: view 폴더 전용 실행 스크립트
  - `SPEC_FILE` 환경변수로 개별 파일 실행 가능
  - CRLF → LF 줄바꿈 수정
  - Cypress 바이너리 설치: `yarn cypress install` → `npx cypress install`로 변경
- **실행**: `docker compose --profile view up cypress-view`
- **개별 실행**: `SPEC_FILE=cypress/e2e/test/GME/view/inbound.cy.js docker compose --profile view up cypress-view`

#### cypress.config.js 수정
- `specPattern`: `GME/*.cy.js` → `GME/**/*.cy.js` (view 하위 폴더 포함)

---

## 2026-03-13

### 🔒 Private 저장소 민감정보 푸시 정책 변경

#### GIT_RULES.md 업데이트
- **Private 저장소**: 민감정보 스캔 불필요, `.env`/`credentials.json`/`testdata.json` 모두 푸시 허용
- **Public 저장소**: 기존대로 민감정보 스캔/제거 필수
- `.gitignore` 전환 가이드 추가 (Private ↔ Public)
- 요약 테이블 업데이트

#### .gitignore 수정
- `credentials.json`, `.env`, `testdata.json` → 주석 처리 (Private 저장소이므로 푸시 허용)
- Public 전환 시 주석 해제하면 되도록 가이드 유지

---

## 2026-03-12

### 🐳 Docker Dev 환경 구축 및 Chrome 크래시 수정

#### Docker Dev 환경 (프로필 기반 분리)
- **구조**: `docker compose up` (메인) / `docker compose --profile dev up` (개발) 분리
- **cypress-dev 서비스**: Dockerfile 빌드, Xvfb + xdotool로 headed 모드 + 네이티브 팝업 처리
- **파일**: `docker-compose.yml`, `Dockerfile`, `shell/run-sample.sh`

#### Chrome SIGABRT 크래시 수정
- **문제**: Docker dev 컨테이너에서 Chrome이 SIGABRT로 강제 종료
- **원인 1**: Docker 기본 공유 메모리(64MB)가 Chrome에 부족
- **해결**: `docker-compose.yml`에 `shm_size: '2gb'` 추가
- **원인 2**: Xvfb lock 파일 충돌 (`/tmp/.X99-lock`)
- **해결**: `run-sample.sh`에서 Xvfb 시작 전 lock 파일 정리 추가
- **원인 3**: Docker 환경 Chrome 호환성
- **해결**: `cypress.config.js`에 Chrome 플래그 추가 (`--no-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`)

#### click_alert.py 환경별 분기 구현
- Windows: pyautogui 사용 (기존)
- Linux/Docker: xdotool 사용 (신규)
- 환경 자동 감지 (`platform.system()`, `/.dockerenv`)

### 🔧 Docker 실행 환경 버그 수정

#### 1. Cypress headless 모드 추가
- **파일**: `shell/run-test.sh`
- **문제**: Docker 컨테이너에 X server(디스플레이)가 없어 Chrome 시작 실패 → Cypress Cloud에 기록 안 됨
- **에러**: `Missing X server or $DISPLAY`, `The platform failed to initialize. Exiting.`
- **해결**: `--headless` 플래그 추가

#### 2. SMTP 이메일 발송 실패 수정
- **파일**: `docker-compose.yml`
- **문제**: 환경변수명 불일치로 SMTP 비밀번호가 비어있어 Gmail 인증 실패
- **에러**: `535-5.7.8 Username and Password not accepted`
- **원인**: docker-compose.yml에서 `${SMTP_RELAY_USER}`, `${SMTP_RELAY_PASSWORD}`를 참조했으나 .env 파일에는 `SMTP_USER`, `SMTP_PASS`로 정의되어 있었음
- **해결**: `${SMTP_RELAY_USER}` → `${SMTP_USER}`, `${SMTP_RELAY_PASSWORD}` → `${SMTP_PASS}`로 수정

### 🗂️ Shell 스크립트 정리

#### 미사용 파일 아카이브
- 미사용 파일 8개를 `shell/archive/`로 이동
  - 실행 스크립트: `gme_main.sh`, `gme_dev.sh`, `gme_test3.sh`, `test.sh`
  - 이메일 스크립트: `curl.sh`(구버전), `curl_copy.sh`
  - 유틸리티: `generate-summary.mjs`, `upload-to-drive.js`

#### 파일명 정리
- `shell/curl3.sh` → `shell/curl.sh`로 변경
- 참조 파일 일괄 수정: `run-test.sh`, `run-sample.sh`, CHANGE_NOTES.md, README.md

#### 문서 추가
- `docs/Shell-Scripts-Guide.md` 신규 작성 (활성 파일 용도, 호출 관계도, 아카이브 목록)

#### .env.example 동기화
- 환경변수명 `.env`와 일치하도록 수정 (`SMTP_RELAY_*` → `SMTP_*`)
- `ENVIRONMENT` 변수 추가
- README.md의 `.env` 예시도 동기화

---

## 2026-02-09

### 🎉 브라우저 Alert 자동 처리 구현 성공

#### Cypress + Python 하이브리드 솔루션
- **핵심 문제 해결**: Form submit으로 인한 페이지 reload 후 발생하는 Alert 자동 처리
- **기술 스택**: Cypress (브라우저 레벨) + Python pyautogui (OS 레벨)
- **cy.task() 활용**: Node.js에서 Python 스크립트 실행

#### 구현 파일
- **`cypress/e2e/module/click_alert.py`** (신규)
  - pyautogui로 Enter 키 입력
  - 5초 대기 후 Alert 자동 확인
- **`cypress.config.js`** (수정)
  - clickAlert task 추가
  - 백그라운드 실행으로 즉시 반환
- **`cypress/e2e/test/GME/gme_dev.cy.js`** (수정)
  - Modify Customer Bank 테스트 완전 자동화
  - cy.pause() 제거
  - Python 스크립트 실행 로직 추가

#### 테스트 성공
- **Modify Customer Bank**: CHECK 버튼 클릭 → Alert 자동 확인 → 계좌 검증 완료 ✅
- **조건부 은행 선택**: Old Bank 확인 후 자동으로 다른 은행 선택
- **Old Bank 변경 확인**: MODIFY 후 재검색하여 은행 변경 검증
- **완전 자동화**: 전체 프로세스 자동 실행 (cy.pause() 제거)

---

### 📚 종합 가이드 문서 작성

#### `docs/Cypress-Browser-Alert-Handler.md` (신규)
- **두 가지 Alert 처리 방법 정리**
  - 방법 1: Cypress Stub (페이지 reload 없는 경우)
  - 방법 2: Cypress + Python (페이지 reload 있는 경우)
- **실제 사례 비교**
  - New Device Login: Cypress Stub 성공 사례
  - Modify Customer Bank: Python 하이브리드 성공 사례
- **상세 구현 가이드**
  - 단계별 코드 예시
  - 핵심 포인트 (타이밍, Non-blocking, 대기 시간)
  - 비교표 (14개 항목)
- **디버깅 섹션**
  - 각 방법별 흔한 문제와 해결책
  - Python 스크립트 단독 테스트 방법
  - 로그 확인 방법
- **응용 사례**
  - 다른 키 입력 (ESC, Tab+Enter)
  - 조건부 Alert 처리
  - 여러 Alert 연속 처리

#### 문서 주요 특징
- ✅ 실무 중심 설명
- ✅ 코드 주석 한국어
- ✅ 비교 표 및 선택 가이드
- ✅ 체크리스트 제공
- ✅ 완전한 코드 예시

---

### 🔧 파일 구조 개선

#### 모듈 폴더 통합
- `shell/click_alert.py` → `cypress/e2e/module/click_alert.py`로 이동
- iframe 헬퍼와 동일한 위치로 구조 통일

#### 관련 경로 수정
- `cypress.config.js` - Python 스크립트 경로 업데이트
- `docs/Cypress-Browser-Alert-Handler.md` - 모든 경로 참조 수정

---

### 💡 기술적 성과

#### 문제 해결 과정
- **8가지 이상의 시도**: Cypress Stub, Override, 다양한 타이밍 조정
- **근본 원인 파악**: Form submit → 페이지 reload → Stub 무효화
- **혁신적 해결**: 브라우저 레벨 + OS 레벨 하이브리드 접근

#### 핵심 인사이트
1. **페이지 reload 여부**가 해결 방법 결정의 핵심
2. **타이밍**이 가장 중요 (Python 먼저 실행 → 버튼 클릭)
3. **Non-blocking 실행**으로 Cypress 명령 큐 차단 방지
4. **간단한 방법 우선** (Cypress Stub → Python 하이브리드)

#### 실무 적용 가능성
- ✅ 레거시 시스템 (ASP.NET, iframe)
- ✅ Form submit 기반 페이지
- ✅ CI/CD 파이프라인 (headless 모드)
- ✅ 모든 브라우저 네이티브 팝업

---

### 📁 업데이트된 파일 목록

#### 신규 파일
- `cypress/e2e/module/click_alert.py` - Python Alert 핸들러
- `docs/Cypress-Browser-Alert-Handler.md` - 종합 가이드

#### 수정된 파일
- `cypress.config.js` - clickAlert task 추가
- `cypress/e2e/test/GME/gme_dev.cy.js` - 완전 자동화
- `cypress/e2e/module/iframe.js` - (기존 유지, 문서화만 추가)

#### 삭제된 파일
- `shell/click_alert.py` - module 폴더로 이동
- `docs/Cypress-Python-Alert-Handler.md` - 새 버전으로 교체

---

### 📝 문서 업데이트 및 향후 계획

#### `Todo.md` 업데이트
- **포커스 이슈 문서화**
  - pyautogui 사용 시 Chrome 포커스 필수 설명
  - OS 레벨 키보드 입력 메커니즘 설명
  - 권장 테스트 환경 가이드 추가
- **Docker 환경 대응 계획 추가**
  - 환경별 분기 처리 (Windows/Linux)
  - xdotool 사용 계획
  - Dockerfile 및 docker-compose.yml 설정 방향
  - 향후 개선 작업 목록

#### 주요 인사이트
- **현재 제약사항**: Windows 로컬 환경에서만 검증 완료
- **향후 과제**: Docker 리눅스 환경 대응 필요
- **해결 방향**:
  - 환경 자동 감지 (platform.system(), /.dockerenv 확인)
  - Windows → pyautogui / Linux → xdotool 분기
  - Xvfb를 통한 가상 디스플레이 구성

---

## 2026-02-02

### 프로젝트 구조 개선
- **e2e 폴더 재구성**
  - `e2e/sample/GME/` → `e2e/test/GME/`로 변경 (GME 테스트)
  - Floaty 테스트 파일을 `e2e/sample/floaty/`로 이동
- **설정 파일 경로 일괄 수정**
  - `cypress.config.js`, `docker-compose.yml`
  - `shell/run-test.sh`, `shell/gme_main.sh` 등 쉘 스크립트

### 환경 설정 파일 추가
- **Example 파일 추가** (민감 정보 제외 템플릿)
  - `.env.example`
  - `credentials.example.json`
  - `cypress/fixtures/testdata.example.json`
- **README.md 업데이트**
  - 환경 설정 파일 생성 가이드 추가
  - 프로젝트 구조 트리 업데이트

---

## 2026-01-28

### 브랜치 통합 및 환경 수정
- **CRLF → LF 변환**: 셸 스크립트 파일들의 줄바꿈 문제 해결
  - `shell/run-test.sh`
  - `shell/curl.sh`
  - `shell/visualization.js`
- **`.env` 파일 복구**: Git 이력에서 환경변수 파일 복원
- **GitHub/GitLab 브랜치 동기화**: main, test 브랜치 양쪽 저장소 통합
- **커밋 메시지 정리**: 한글로 변경사항 상세 기술

### 문서 개선
- **README.md 전면 개선**
  - 프로젝트 개요 및 주요 기능 설명 추가
  - Tech Stack 테이블 추가
  - 설치 및 실행 방법 상세화 (Docker, 로컬)
  - 프로젝트 구조 트리 추가
  - 환경 변수 설정 가이드 추가
  - 사용 예시 코드 추가 (테스트 구조, Chrome Popup 처리)
  - CI/CD 및 테스트 결과 확인 방법 추가
- **CHANGE_NOTES.md 신규 생성**: 날짜별 변경 이력 문서화

### 공개용 저장소 생성
- **cypress_public 저장소 신규 생성**
  - 민감 정보 제외한 공개용 버전
  - 제외된 파일: `.env`, `credentials.json`, `testdata.json`
  - 템플릿 파일 추가: `.env.example`, `credentials.example.json`, `testdata.example.json`
  - GitHub: https://github.com/sphh12/cypress_public
  - GitLab: https://gitlab.com/sphh12/cypress_public

---

## 2026-01-12

### README 및 설정 업데이트
- `README.md` 업데이트 (GME Core 시스템 설명)
- `credentials.json`을 `.gitignore`에 추가
- GitHub/GitLab 머지 충돌 해결

---

## 2026-01-09

### 기능 개선
- **Chrome native popup 처리 추가**
  - `Confirm(true)` 자동 확인
  - `Alert(bypass)` 자동 무시
  - 팝업 메시지 검증 기능
- **날짜 가져오기 방식 변경**
  - dayjs 라이브러리 삭제
  - 네이티브 방식으로 변경

---

## 2026-01-08

### HTML 리포트 기능
- HTML 리포트 파일 로컬 저장 기능 추가
- `cypress-history` 폴더에 타임스탬프 기반 저장

---

## 2026-01-07

### 테스트 안정화
- User Log 진입 시 wait 시간 10초로 변경

---

## 2025-12-31

### 프로젝트 초기 설정
- 프로젝트 정리 및 GME 테스트 추가
- README.md 머지 충돌 해결

---

## 2024-09 (이전 작업)

### 초기 개발
- Cypress 테스트 프레임워크 구축
- 이메일 발송 기능 구현
- iframe 로드 처리
- 전체 스크립트 실행 환경 구성

---

## 저장소 정보

| 저장소 | URL |
|--------|-----|
| GitLab | https://gitlab.com/sphh12/cypress |
| GitHub | https://github.com/sphh12/cypress |

---

## 주요 파일 구조

```
gme_test/
├── cypress/
│   └── e2e/test/GME/gme.cy.js      # 메인 테스트 파일
├── shell/
│   ├── run-test.sh                  # 테스트 실행 스크립트
│   ├── curl.sh                     # 이메일 발송 스크립트
│   └── visualization.js             # 결과 시각화
├── docker-compose.yml               # Docker 설정
├── .env                             # 환경변수 (SMTP, Cypress 키)
└── CHANGE_NOTES.md                  # 이 파일
```
