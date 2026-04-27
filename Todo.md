# Todo

## 2026-03-12

### ~~Docker 실행 환경 버그 수정~~ ✅
- ~~run-test.sh: --headless 플래그 추가 (X server 없는 Docker 환경 대응)~~
- ~~docker-compose.yml: SMTP 환경변수명 불일치 수정~~
- ~~GIT_RULES.md: Git 푸시 규칙 문서 추가~~

### ~~Shell 스크립트 정리~~ ✅
- ~~미사용 파일 8개 → shell/archive/ 이동~~
- ~~curl3.sh → curl.sh 파일명 변경 + 참조 수정~~
- ~~docs/Shell-Scripts-Guide.md 문서 추가~~
- ~~.env.example 환경변수명 동기화~~

### ~~Docker 리눅스 환경 대응~~ ✅
- ~~`click_alert.py` 환경별 분기 코드 추가 (pyautogui/xdotool)~~
- ~~`Dockerfile` 작성 (xdotool, Xvfb, python3 포함)~~
- ~~`docker-compose.yml` dev 프로필 추가 (DISPLAY, shm_size 설정)~~
- ~~`shell/run-sample.sh` headed 모드 + Xvfb lock 정리~~
- ~~`cypress.config.js` Chrome 안정성 플래그 추가~~

### ~~페이지 진입 유효성 검사 구현~~ ✅
- ~~iframe.js validatePage 함수 추가 (5단계 검증)~~
- ~~검증 요소 실제 페이지 분석 후 변경 (.page-wrapper, .panel AND 조건 / #form1 제거)~~
- ~~view 폴더에 메뉴별 테스트 파일 6개 배치~~
- ~~Docker view 프로필 및 run-customer.sh 실행 스크립트 추가~~
- ~~cypress.config.js specPattern 하위 폴더 포함으로 수정~~

### Docker View 환경 검증 ✅ (2026-03-30)
- [x] Cloud 프로젝트 변경 (`zhpyoq` → `tagp8n`) — 무료 플랜 용량 초과 대응
- [x] `docker compose --profile view run --rm cypress-view` 실행 — 71개 전체 통과
- [x] Cypress Cloud 기록 정상 반영 확인
- [x] 이메일 발송 정상 확인

### ~~administration2 타이틀 검증 확인~~ ✅ (2026-04-06)
- ~~17개 테스트에 타이틀 확인 코드 추가~~
- ~~Docker 실행 — 88개 전체 통과 (runs/12)~~
- ~~Customer Statement 5개 탭 검색, Receiver Details 상세검증, Customer ID Verification 추가~~

### ~~administration2 상세 검증 시나리오 구현~~ ✅ (2026-04-07)
- ~~Customer Statement: 5개 탭 순회 (autocomplete + datepicker + Filter + 결과 확인)~~
- ~~Receiver Details: 검색 → View 버튼 → 모달 상세정보 검증~~
- ~~Customer ID Verification: 검색 → Verification Details → cy.intercept로 Success alert 검증~~
- ~~GME Pay / Point Statement: sphh 검색 → Wallet Account Number + 테이블 데이터 확인~~
- ~~Inbound Bank List: Email 필터 → sphh 검색 → 테이블 데이터 확인~~
- 상세 구현 완료: **7개 / 17개** (it.only 해제 후 전체 실행 필요)

### ~~Customer Statement DOM detach 수정 + Online Remit 8탭 검증~~ ✅ (2026-04-09)
- ~~Customer Statement: `.should()` 콜백 재시도 패턴으로 포스트백 대기 변경~~
- ~~Customer Statement: Tab 3만 "No wallet" 허용, 나머지 테이블 필수~~
- ~~Online Remit: 8개 탭 순회 검증 스크립트 신규 작성~~
  - ~~Tab 3(Customer Setup): 화면 진입만 확인~~
  - ~~Tab 1,2,4~8: Search By(Native Country) → south korea → 날짜 → Filter → 데이터 확인~~
  - ~~탭별 고유 DOM ID 차이 대응 (5종 prefix)~~
  - ~~Filter 버튼: jQuery로 input/button 모두 대응~~
- 상세 구현 완료: **8개 / 17개** (it.only 해제 후 전체 실행 필요)

### Docker Dev 환경 검증 (진행 중)
- [ ] `docker compose --profile dev up --build` 실행하여 Chrome 크래시 해결 확인
- [ ] Cypress Cloud 기록 정상 반영 확인
- [ ] 이메일 발송 내용 정상 확인
- [ ] CI/CD 파이프라인 통합

---

# ✅ Modify Customer Bank - Alert 팝업 자동 처리 **[완료]**

## 📌 문제 상황

### 목표
- **테스트**: Modify Customer Bank - CHECK 버튼 클릭 시 발생하는 브라우저 alert 팝업을 자동으로 처리
- **파일**: `cypress/e2e/test/GME/gme_dev.cy.js`

### 최종 상태 ✅
- ✅ **완전 자동화 성공** - Cypress + Python 하이브리드 솔루션
- ✅ CHECK/MODIFY 버튼 클릭 시 Alert 자동 처리
- ✅ 조건부 은행 선택 로직 구현
- ✅ Old Bank 변경 확인 기능 추가

### Alert 메시지
```
Success(SecondaryId) - Customer Account Name: 한승필
```

---

## 🔄 시도한 해결 방법

### 시도 1: stubIframeDialogs + stub 존재 확인
```javascript
stubIframeDialogs(true);
cy.get('@alertStub').should('exist');
cy.get('@confirmStub').should('exist');
getMainFrame().find('#checkBtn').click();
```
**결과**: ❌ 실패 - stub 존재 확인 코드가 실행 순서를 방해

---

### 시도 2: stubIframeDialogs (stub 존재 확인 제거)
```javascript
stubIframeDialogs(true);
getMainFrame().find('#checkBtn').click();
cy.get('@alertStub').should('have.been.called');
```
**결과**: ❌ 실패 - 브라우저 alert 팝업이 계속 나타남

---

### 시도 3: callsFake로 메시지 캡처
```javascript
let alertMessage = '';
getMainFrame().its('0.contentWindow').then((iframeWindow) => {
    cy.stub(iframeWindow, 'alert').callsFake((message) => {
        alertMessage = message;
        return true;
    }).as('alertStub');
});
getMainFrame().find('#checkBtn').click();
```
**결과**: ❌ 실패 - `getMainFrame()`은 body를 반환하므로 contentWindow 접근 불가

---

### 시도 4: iframe 직접 접근
```javascript
cy.get('iframe#mainFrame').then($iframe => {
    const iframeWindow = $iframe[0].contentWindow;
    cy.stub(iframeWindow, 'alert').as('alertStub');
});
getMainFrame().find('#checkBtn').click();
```
**결과**: ❌ 실패 - 여전히 브라우저 alert 팝업 나타남

---

### 시도 5: New Device Login 패턴 완전 복사 (현재)
```javascript
stubIframeDialogs(true);
getMainFrame().find('#checkBtn').click();
cy.get('@alertStub').should('have.been.calledWith', 'Success(SecondaryId) - Customer Account Name: 한승필');
```
**결과**: ❌ 실패 - 여전히 브라우저 alert 팝업 나타남

---

## ✅ New Device Login (정상 작동)

### 코드
```javascript
stubIframeDialogs(true);
getMainFrame().find('#btnApprove').click({ force: true });

cy.get('@confirmStub').should('have.been.calledWith', 'Are you sure you want to approve this mobile id?');
cy.get('@alertStub').should('have.been.calledWith', 'Face Verification is successfully approved.');
```

### 실행 결과 (Cypress 로그)
```
73. getiframe#mainFrame
74. its.0.contentWindow
75. wrapfunction(){} @confirmStub
76. wrapfunction(){} @alertStub
77. getiframe#mainFrame
78. its.0.contentDocument.body
...
82. find#btnApprove
83. click{force: true}
84. (xhr)POST 200 /ApplicationLog/UserLogs/NewDeviceLogin.aspx  ← XHR 완료
85. get@confirmStub
86. assertexpected confirm to have been called... ✅ 성공
```

---

## 🔍 핵심 차이점 분석

| 항목 | New Device Login (성공) | Modify Customer Bank (실패) |
|------|------------------------|---------------------------|
| **버튼 위치** | Modal 안의 버튼 | 일반 페이지의 버튼 |
| **팝업 종류** | Confirm → Alert | Alert만 |
| **XHR 로그** | ✅ 표시됨 | ❌ 표시 안됨 (alert에서 멈춤) |
| **Stub 작동** | ✅ 정상 | ❌ 실패 |
| **iframe Reload** | ❌ 없음 | ⚠️ 의심됨 |

---

## 🤔 추정되는 원인

### 가능성 1: CHECK 버튼이 페이지 Reload 트리거
- ASP.NET `__doPostBack` 같은 메서드로 페이지 postback 발생
- Stub이 설정된 후 iframe이 reload되어 stub 무효화

### 가능성 2: Alert 발생 타이밍 이슈
- CHECK 버튼 클릭 → XHR 요청 → **새로운 실행 컨텍스트**에서 alert 호출
- Stub이 설정된 window 객체와 다른 컨텍스트에서 실행

### 가능성 3: 버튼 동작 방식의 차이
- New Device Login: Modal 내부 JavaScript 함수 호출
- Modify Customer Bank: Form submit 또는 다른 방식

---

## 🎯 다음 단계 제안

### 옵션 1: 개발자 도구로 CHECK 버튼 분석 ⭐ 추천
1. 브라우저 개발자 도구 열기
2. CHECK 버튼 우클릭 → 검사
3. `onclick` 이벤트 확인
4. Network 탭에서 XHR/Fetch 요청 확인
5. `__doPostBack` 같은 함수 호출 여부 확인

**필요한 정보:**
- 버튼의 onclick 속성
- 발생하는 XHR 요청 URL 및 응답
- 페이지 reload 여부

---

### 옵션 2: XHR Intercept 방식
```javascript
cy.intercept('POST', '**/ModifyCustomerBank.aspx').as('checkAccount');

stubIframeDialogs(true);
getMainFrame().find('#checkBtn').click();

cy.wait('@checkAccount').then(() => {
    cy.get('@alertStub').should('have.been.called');
});
```

---

### 옵션 3: Alert 검증 포기 → DOM 변화로 검증
```javascript
getMainFrame().find('#checkBtn').click();

// Alert 대신 DOM 변화로 성공 여부 확인
getMainFrame().find('#successMessage').should('be.visible');
// 또는
getMainFrame().find('#accountStatus').should('contain', 'Verified');
```

---

### 옵션 4: 수동 개입 (임시 해결책)
```javascript
getMainFrame().find('#checkBtn').click();

// 수동으로 alert 확인 버튼 클릭
cy.pause();  // 테스터가 수동으로 확인

// 이후 검증 계속
getMainFrame().find('#nextStep').click();
```
⚠️ **문제점**: 자동화 테스트의 의미 상실

---

## 📁 관련 파일

- **테스트 파일**: `cypress/e2e/test/GME/gme_dev.cy.js` (23-67줄)
- **Helper 함수**: `cypress/e2e/module/iframe.js` (10-25줄)
- **설정 파일**: `cypress.config.js`

---

## 📝 참고사항

### stubIframeDialogs 함수 구조
```javascript
export const stubIframeDialogs = (confirmReturn = true) => {
  return cy
    .get('iframe#mainFrame', { timeout: 10000 })
    .its('0.contentWindow')
    .then((iframeWindow) => {
      const confirmStub = Cypress.sinon.stub(iframeWindow, 'confirm').returns(confirmReturn);
      const alertStub = Cypress.sinon.stub(iframeWindow, 'alert');

      cy.wrap(confirmStub).as('confirmStub');
      cy.wrap(alertStub).as('alertStub');

      return null;
    });
};
```

### Cypress 환경
- Cypress 버전: (확인 필요)
- 브라우저: Chrome
- 테스트 환경: http://gmeremitcore.gmeremit.com.kr:9321/Admin

---

---

## ✅ 최종 해결 방법 (2026-02-09)

### Cypress + Python 하이브리드 솔루션

#### 핵심 원인
- Form submit → 페이지 reload → Cypress Stub 무효화
- Alert이 새로 로드된 페이지에서 발생 → Stub 적용 불가

#### 해결책
**OS 레벨 자동화 (pyautogui)**를 통한 Alert 처리

### 구현 파일

#### 1. `cypress/e2e/module/click_alert.py` (신규)
```python
import pyautogui
import time

time.sleep(5)  # Alert 대기
pyautogui.press('enter')  # Enter 키로 Alert 확인
```

#### 2. `cypress.config.js` 수정
```javascript
clickAlert() {
  exec('python ./cypress/e2e/module/click_alert.py', ...);
  return Promise.resolve({ success: true });  // 즉시 반환
}
```

#### 3. `gme_dev.cy.js` 수정
```javascript
// Python 스크립트 백그라운드 실행
cy.task('clickAlert');

// CHECK 버튼 클릭
getMainFrame().find('#checkBtn').click();

// 대기 (10초)
cy.wait(10000);
```

### 추가 구현 기능

#### 조건부 은행 선택
- Old Bank가 A은행 → New Bank에 B은행 선택
- Old Bank가 B은행 → New Bank에 A은행 선택

#### Old Bank 변경 확인
- 초기 Old Bank 값 저장
- MODIFY 후 재검색
- 변경 전후 비교 및 검증

### 최종 결과
✅ **완전 자동화 성공**
- CHECK 버튼 Alert 자동 처리
- MODIFY 버튼 Alert 자동 처리
- Old Bank 변경 확인
- 전체 프로세스 자동 실행

---

## ⚠️ 중요 주의사항

### Python pyautogui 사용 시 포커스 이슈
- **현상**: Chrome이 아닌 다른 애플리케이션에 포커스가 있으면 Native 팝업 동작이 실패함
- **영향**:
  - VS Code, 탐색기, 메모장 등 다른 프로그램이 활성화되어 있으면 Enter 키 입력이 해당 프로그램으로 전달됨
  - Alert 팝업이 닫히지 않고 테스트 실패
- **원인**:
  - pyautogui는 **OS 레벨**에서 키보드 입력을 시뮬레이션
  - 현재 **활성화된 창(포커스된 창)**에만 키 입력이 전달됨
  - Chrome에 포커스가 없으면 `pyautogui.press('enter')`가 다른 프로그램에 전달됨
- **해결 방법**:
  - 테스트 실행 중에는 Chrome 브라우저에 포커스 유지
  - 다른 작업(코드 편집, 파일 탐색 등)을 하지 않음
  - 자동화 실행 시 Chrome 창을 전면에 배치
  - CI/CD 환경에서는 문제없음 (headless 모드 또는 전용 테스트 환경)

### 권장 테스트 환경
```
✅ 추천:
- CI/CD 파이프라인에서 실행 (Docker, Jenkins, GitHub Actions 등)
- 전용 테스트 PC에서 실행 (다른 작업 없이 테스트만 실행)
- Virtual Machine 환경

⚠️ 주의:
- 로컬 개발 PC에서 실행 시 Chrome에 포커스 유지 필수
- 테스트 중 다른 애플리케이션 사용 금지
- 테스트 시작 후 Chrome 창을 클릭하거나 이동하지 않기
```

---

## 📚 관련 문서
- `docs/Cypress-Browser-Alert-Handler.md` - 상세 가이드

---

## 🚀 향후 개선 계획

### Docker 리눅스 환경 대응 (미적용)
- **목표**: Docker 컨테이너 환경에서도 Alert 자동 처리 동작
- **현재 상태**: Windows 환경에서만 테스트 완료 (pyautogui 사용)
- **개선 필요사항**:
  - 환경별 분기 처리 (Windows/Linux 자동 감지)
  - Linux 환경에서 xdotool 사용
  - Dockerfile 작성 (xdotool, Xvfb 설치)
  - docker-compose.yml 설정 (가상 디스플레이)

### 예상 구현 방식
```python
# click_alert.py - 환경별 분기
import platform
import os

system = platform.system()
is_docker = os.path.exists('/.dockerenv')

if system == "Windows" and not is_docker:
    import pyautogui
    pyautogui.press('enter')  # Windows
elif system == "Linux" or is_docker:
    import subprocess
    subprocess.run(['xdotool', 'key', 'Return'])  # Linux/Docker
```

### 필요 작업 목록
- [ ] `click_alert.py` 환경별 분기 코드 추가
- [ ] `Dockerfile` 작성 (xdotool, Xvfb 포함)
- [ ] `docker-compose.yml` 작성 (DISPLAY 환경변수 설정)
- [ ] Linux 환경에서 테스트 및 검증
- [ ] CI/CD 파이프라인 통합

### 참고 사항
- **xdotool**: Linux 전용 키보드/마우스 시뮬레이션 도구
- **Xvfb**: X Virtual Framebuffer (가상 디스플레이)
- **장점**: Docker headless 환경에서도 GUI 애플리케이션 실행 가능
- **타이밍**: Docker 배포 전에 적용 예정

---

## ✍️ 작성 일시
- 작성: 2026-02-09
- 완료: 2026-02-09
- 작성자: QA
