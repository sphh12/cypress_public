# Cypress로 브라우저 Alert 자동 처리하기 - 완벽 가이드

## 📌 개요

Cypress E2E 테스트에서 브라우저 네이티브 Alert/Confirm 팝업을 자동으로 처리하는 두 가지 방법을 다룹니다.

### 대상 환경
- **프레임워크**: Cypress E2E 테스트
- **환경**: iframe 내부의 ASP.NET 웹 애플리케이션
- **문제**: 브라우저 네이티브 Alert/Confirm 팝업 자동 처리

---

## 🎯 두 가지 Alert 처리 방법

### 방법 비교표

| 항목 | Cypress Stub (방법 1) | Cypress + Python (방법 2) |
|------|----------------------|---------------------------|
| **적용 가능 조건** | 페이지 reload 없음 | 페이지 reload 있음 |
| **버튼 동작** | AJAX, Modal 등 | Form submit, 새 페이지 이동 |
| **Alert 발생 위치** | 같은 페이지 | 새로 로드된 페이지 |
| **복잡도** | ⭐ 간단 | ⭐⭐⭐ 복잡 |
| **외부 의존성** | 없음 | Python, pyautogui |
| **타이밍 민감도** | 낮음 | 높음 |
| **사례** | New Device Login | Modify Customer Bank |

### 언제 어떤 방법을 사용할까?

#### ✅ **Cypress Stub 사용 (우선 시도)**
다음 조건을 **모두** 만족하면:
- 버튼 클릭 후 페이지 reload가 **없음**
- Alert이 현재 페이지에서 발생
- AJAX 호출이나 Modal 방식

#### ✅ **Cypress + Python 사용**
다음 조건 중 **하나라도** 해당되면:
- 버튼 클릭 후 페이지 reload 발생
- Form submit으로 인한 페이지 전환
- Cypress Stub 방법을 시도했지만 실패

---

## 🎯 방법 1: Cypress Stub (간단한 경우)

### 사례: New Device Login

#### 상황 설명
- **기능**: 모바일 앱 신규 기기 로그인 승인
- **버튼**: Modal 내부의 "Approve" 버튼
- **동작**: AJAX 호출 (페이지 reload 없음)
- **팝업**: Confirm → Alert 순서로 발생

#### 왜 Cypress Stub이 작동하는가?

```
1. Approve 버튼 클릭
   ↓
2. AJAX 호출 (백그라운드 처리)
   ↓
3. Confirm/Alert 팝업 발생
   ↓ (페이지는 그대로!)
4. Stub이 여전히 유효 ✅
```

**핵심**: 페이지가 reload되지 않으므로 iframe의 window 객체가 유지되고, Stub도 계속 작동합니다.

---

### 구현 코드

#### 1. Helper 함수 (iframe.js)

**파일**: `cypress/e2e/module/iframe.js`

```javascript
// iframe의 body에 접근하는 헬퍼
export const getMainFrame = () => {
  return cy
    .get('iframe#mainFrame', { timeout: 10000 })
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap)
}

// iframe의 alert/confirm을 Stub으로 대체
export const stubIframeDialogs = (confirmReturn = true) => {
  return cy
    .get('iframe#mainFrame', { timeout: 10000 })
    .its('0.contentWindow')
    .then((iframeWindow) => {
      // Sinon stub 생성
      const confirmStub = Cypress.sinon.stub(iframeWindow, 'confirm').returns(confirmReturn);
      const alertStub = Cypress.sinon.stub(iframeWindow, 'alert');

      // alias로 저장 (검증용)
      cy.wrap(confirmStub).as('confirmStub');
      cy.wrap(alertStub).as('alertStub');

      return null;
    });
};
```

#### 2. 테스트 코드

**파일**: `cypress/e2e/test/GME/gme.cy.js`

```javascript
import { getMainFrame, stubIframeDialogs } from '../../module/iframe';

it('New Device Login - Approve', function () {
    // ... 로그인 및 페이지 진입 ...

    // 검색
    getMainFrame().find('[name="grdNewDeviceLogin_createdBy"]').type('testuser');
    getMainFrame().find('[Value="Filter"]').click({ force: true });

    getMainFrame().find('[title="View and Approve"]').click({ force: true });
    cy.wait(2000);

    // Remark 및 Reason 입력
    getMainFrame().find('#txtRemark').type('qa test - automation');
    getMainFrame().find('#remarks1').type('qa test');

    // ⭐ Stub 설정 - Approve 버튼 클릭 전에 호출
    stubIframeDialogs(true);

    // Approve 버튼 클릭
    getMainFrame().find('#btnApprove').click({ force: true });

    // 메시지 검증
    cy.get('@confirmStub').should('have.been.calledWith',
        'Are you sure you want to approve this mobile id?');
    cy.get('@alertStub').should('have.been.calledWith',
        'Face Verification is successfully approved.');

    cy.log('✅ Approve - New Device Login 성공!');
});
```

#### 3. 핵심 포인트

```javascript
✅ 올바른 순서:
stubIframeDialogs(true);        // 1. Stub 설정
getMainFrame().find('#btn').click();  // 2. 버튼 클릭
cy.get('@alertStub').should(...);     // 3. 검증

❌ 잘못된 순서:
getMainFrame().find('#btn').click();  // 버튼 먼저 클릭
stubIframeDialogs(true);              // Stub 설정 (이미 늦음!)
```

**중요**: Stub은 반드시 Alert이 발생하기 **전**에 설정해야 합니다.

---

### Cypress 로그 (성공 시)

```
73. get iframe#mainFrame
74. its 0.contentWindow
75. wrap function(){} @confirmStub
76. wrap function(){} @alertStub
77. get iframe#mainFrame
78. its 0.contentDocument.body
...
82. find #btnApprove
83. click {force: true}
84. (xhr) POST 200 /NewDeviceLogin.aspx  ← AJAX 완료
85. get @confirmStub
86. assert expected confirm to have been called... ✅
87. get @alertStub
88. assert expected alert to have been called... ✅
```

**특징**:
- XHR 요청이 정상 완료됨
- Stub이 호출됨을 검증
- 페이지 reload 없음

---

## 🎯 방법 2: Cypress + Python 하이브리드 (복잡한 경우)

### 사례: Modify Customer Bank

#### 상황 설명
- **기능**: 고객 은행 계좌 정보 수정
- **버튼**: 일반 페이지의 CHECK 버튼 (type="submit")
- **동작**: Form submit → 페이지 reload
- **팝업**: Alert만 발생

#### 왜 Cypress Stub이 실패하는가?

```
1. CHECK 버튼 클릭
   ↓
2. Form submit
   ↓
3. 페이지 완전히 reload ⚠️
   ↓ (Stub이 무효화됨!)
4. 새 페이지에서 Alert 발생
   ↓
5. Stub이 없어서 실제 Alert 표시 ❌
   ↓
6. 모든 JavaScript 실행 차단
```

**핵심 문제**:
1. **Form submit → 페이지 reload** → 모든 JavaScript override가 무효화됨
2. **Alert 팝업 발생** → 모든 JavaScript 실행이 차단됨 (Cypress 명령도 멈춤)
3. **iframe 내부** → Cypress의 alert 이벤트 핸들러가 작동하지 않음

---

### 해결 방법: OS 레벨 자동화

#### 핵심 아이디어
- **Cypress**: 브라우저 레벨 자동화 (클릭, 입력 등)
- **Python (pyautogui)**: OS 레벨 자동화 (키보드 입력)
- **cy.task()**: Cypress에서 Node.js 코드 실행 → Python 스크립트 호출

#### 실행 흐름
```
1. cy.task('clickAlert') 호출
   → Node.js가 Python 스크립트를 백그라운드에서 실행
   → Python은 5초간 대기 (Alert 기다림)

2. CHECK 버튼 클릭
   → Form submit
   → 페이지 reload
   → Alert 팝업 발생

3. Python이 Enter 키 입력
   → Alert 자동 확인

4. 페이지 reload 완료

5. 검증 계속 진행
```

---

### 구현 코드

#### 1. Python 스크립트 작성

**파일**: `cypress/e2e/module/click_alert.py`

```python
import pyautogui
import time

print("Alert 클릭 스크립트 시작...")
print("Alert 대기 중...")

# Alert이 나타날 때까지 충분히 대기 (5초)
time.sleep(5)

print("Enter 키 입력 시도...")
pyautogui.press('enter')  # Enter 키로 Alert 확인
print("Enter 키 입력 완료")
time.sleep(0.5)
print("Alert 클릭 완료!")
```

**의존성 설치**:
```bash
pip install pyautogui
```

---

#### 2. Cypress Config에 Task 등록

**파일**: `cypress.config.js`

```javascript
const { defineConfig } = require('cypress');
const { exec } = require('child_process');

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            on('task', {
                clickAlert() {
                    // ⭐ 핵심: 백그라운드에서 실행하고 즉시 반환
                    exec('python ./cypress/e2e/module/click_alert.py', (error, stdout, stderr) => {
                        if (error) {
                            console.error('Python 스크립트 실행 오류:', error.message);
                        } else {
                            console.log('Python stdout:', stdout);
                        }
                        if (stderr) {
                            console.error('Python stderr:', stderr);
                        }
                    });

                    // 즉시 반환 (백그라운드에서 계속 실행)
                    return Promise.resolve({
                        success: true,
                        message: 'Alert 클릭 스크립트 백그라운드 실행 시작'
                    });
                }
            });

            return config;
        }
    }
});
```

**⚠️ 중요**: `exec()` 콜백 안에서 `resolve()`를 호출하면 Python 스크립트가 완료될 때까지 대기합니다. 즉시 반환해야 합니다!

---

#### 3. 테스트 코드 작성

**파일**: `cypress/e2e/test/GME/gme_dev.cy.js`

```javascript
it('Customer Management - Modify Customer Bank', function () {
    // ... 로그인 및 페이지 진입 ...

    // 검색 및 데이터 입력
    getMainFrame().find('#searchBy').select('Alien/National Id');
    getMainFrame().find('#searchValue').type(idNumber);
    getMainFrame().find('#searchButton').click();
    cy.wait(3000);

    getMainFrame().find('#newBank').select('Nonghyup Bank(NH)');
    getMainFrame().find('#newAccountNumber').type('3120188942501');
    cy.log('✅ 계좌 정보 입력 완료');

    // ⭐ 핵심: CHECK 버튼 클릭 **전**에 Python 스크립트 실행
    cy.task('clickAlert').then(result => {
        cy.log('✅ Python 스크립트 실행 시작:', result.message);
    });

    // CHECK 버튼 클릭 (Alert 발생)
    getMainFrame().find('#checkBtn').click();
    cy.log('✅ CHECK 버튼 클릭 완료');

    // Python이 Alert을 자동으로 클릭할 때까지 대기
    // (Python 5초 대기 + Alert 처리 + 페이지 reload)
    cy.wait(10000);

    // 계좌 검증 성공 여부 확인
    getMainFrame().find('#secondaryIdNumber').should('have.text', idNumber);
    cy.log('✅ Account Verified - 계좌 검증 완료');
});
```

---

### 핵심 포인트

#### 1. **타이밍이 전부**
```javascript
❌ 잘못된 순서:
CHECK 버튼 클릭 → cy.wait(2000) → cy.task('clickAlert')
// Alert이 이미 떴으므로 Cypress 명령이 차단됨

✅ 올바른 순서:
cy.task('clickAlert') → CHECK 버튼 클릭 → cy.wait(10000)
// Python이 먼저 대기 상태로 들어가고, Alert이 나타나면 자동 클릭
```

#### 2. **즉시 반환 (Non-blocking)**
```javascript
❌ 잘못된 구현:
return new Promise((resolve) => {
    exec('python script.py', (error) => {
        resolve({ success: true });  // Python 완료까지 대기
    });
});

✅ 올바른 구현:
exec('python script.py', (error) => {
    // 콜백만 등록
});
return Promise.resolve({ success: true });  // 즉시 반환
```

#### 3. **충분한 대기 시간**
- Python 스크립트: 5초 대기 (Alert 나타날 때까지)
- Cypress: 10초 대기 (Python 5초 + Alert 처리 + 페이지 reload)

---

## 📊 두 방법 상세 비교

| 비교 항목 | New Device Login<br/>(Cypress Stub) | Modify Customer Bank<br/>(Cypress + Python) |
|----------|----------------------------------|------------------------------------------|
| **버튼 위치** | Modal 안의 버튼 | 일반 페이지의 버튼 |
| **버튼 타입** | `<button>` | `<input type="submit">` |
| **버튼 동작** | JavaScript 함수 호출 | Form submit |
| **팝업 종류** | Confirm → Alert | Alert만 |
| **페이지 상태** | AJAX (페이지 유지) | Reload (새 페이지) |
| **XHR 로그** | ✅ 표시됨 | ❌ 표시 안됨 (reload) |
| **Stub 작동** | ✅ 정상 | ❌ 무효화됨 |
| **iframe Reload** | ❌ 없음 | ✅ 발생 |
| **구현 복잡도** | ⭐ 낮음 | ⭐⭐⭐ 높음 |
| **외부 도구** | 불필요 | Python, pyautogui 필요 |

---

## 🚀 테스트 실행

### 사전 준비

#### 방법 1 (Cypress Stub)
```bash
# 추가 설치 불필요
# Cypress만 있으면 됨
```

#### 방법 2 (Cypress + Python)
```bash
# Python 라이브러리 설치 (최초 1회)
pip install pyautogui
```

### Cypress 실행
```bash
# GUI 모드
npx cypress open

# Headless 모드 - 특정 파일
npx cypress run --spec "cypress/e2e/test/GME/gme_dev.cy.js" --browser chrome

# Headless 모드 - 전체
npx cypress run --browser chrome
```

---

## 🔍 디버깅 팁

### 방법 1 (Cypress Stub) 디버깅

#### 문제: Stub이 호출되지 않음
```javascript
// 디버깅 코드 추가
stubIframeDialogs(true);

cy.get('@confirmStub').then((stub) => {
    cy.log('Confirm stub:', stub);
});
cy.get('@alertStub').then((stub) => {
    cy.log('Alert stub:', stub);
});

getMainFrame().find('#btnApprove').click({ force: true });
```

#### 문제: "cy.get() could not find alias @alertStub"
- 원인: stubIframeDialogs() 호출 전에 버튼을 클릭함
- 해결: stubIframeDialogs()를 버튼 클릭 **전**에 호출

#### 문제: Stub이 있지만 실제 Alert이 표시됨
- 원인: 페이지 reload 발생
- 해결: 방법 2 (Python) 사용

---

### 방법 2 (Python) 디버깅

#### Python 스크립트 단독 테스트
```bash
# 브라우저에서 수동으로 Alert 띄운 후
python ./cypress/e2e/module/click_alert.py
```

#### 로그 확인
- **Cypress 로그**: "Python 스크립트 실행 시작" 메시지 확인
- **Node.js 콘솔**: Python stdout/stderr 출력 확인
- **시간 측정**: cy.wait(10000)이 충분한지 확인

#### 흔한 문제

1. **Python 스크립트가 실행 안 됨**
   - `python` 명령어가 PATH에 있는지 확인
   - Windows: `python` 대신 `python3` 또는 `py` 사용
   - Cypress 터미널에서 "Python 스크립트 실행 오류" 메시지 확인

2. **Alert이 여전히 차단됨**
   - Python 대기 시간 증가: `time.sleep(5)` → `time.sleep(10)`
   - Cypress 대기 시간 증가: `cy.wait(10000)` → `cy.wait(12000)`
   - Alert이 표시되는 시점 확인 (Form submit 후 몇 초?)

3. **pyautogui가 Enter 키를 누르지 못함**
   - 윈도우 보안 설정 확인
   - 관리자 권한으로 Cypress 실행
   - 다른 창이 활성화되어 있지 않은지 확인

---

## 💡 응용 사례

### 다른 키 입력 (Python)
```python
# ESC 키로 Alert 닫기
pyautogui.press('esc')

# Tab + Enter (두 번째 버튼 클릭)
pyautogui.press('tab')
pyautogui.press('enter')

# Space 키로 확인
pyautogui.press('space')
```

### 조건부 Alert 처리 (Python)
```python
import pyautogui
import time

for i in range(10):  # 최대 10초 대기
    time.sleep(1)
    # Alert 텍스트 감지 로직 (pywinauto 사용 가능)
    if alert_detected():
        pyautogui.press('enter')
        break
```

### 여러 Alert 연속 처리 (Python)
```python
import pyautogui
import time

time.sleep(5)
pyautogui.press('enter')  # 첫 번째 Alert
time.sleep(2)
pyautogui.press('enter')  # 두 번째 Alert
```

### Confirm에서 취소 버튼 클릭 (Cypress Stub)
```javascript
// Confirm에서 false 반환 (취소 클릭)
stubIframeDialogs(false);
getMainFrame().find('#deleteBtn').click();

cy.get('@confirmStub').should('have.been.calledOnce');
// 삭제가 취소되어야 함
```

---

## 📝 참고 자료

### 관련 파일
- `cypress.config.js` - cy.task 정의
- `cypress/e2e/test/GME/gme.cy.js` - New Device Login 테스트
- `cypress/e2e/test/GME/gme_dev.cy.js` - Modify Customer Bank 테스트
- `cypress/e2e/module/click_alert.py` - Python 스크립트
- `cypress/e2e/module/iframe.js` - iframe 헬퍼 함수

### 라이브러리 문서
- [Cypress Task API](https://docs.cypress.io/api/commands/task)
- [Cypress Stub API](https://docs.cypress.io/api/commands/stub)
- [PyAutoGUI Documentation](https://pyautogui.readthedocs.io/)
- [Node.js child_process.exec](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback)

### 대안 방법
- **PyWinAuto**: Windows 전용, Alert 텍스트 감지 가능
- **Robot Framework**: Selenium + AutoIt 라이브러리
- **Puppeteer**: Chromium DevTools Protocol (일부 Alert 처리 가능)
- **Playwright**: 더 나은 Alert 처리 지원

---

## ✅ 체크리스트

### 방법 1 (Cypress Stub) 사용 전
- [ ] 버튼 클릭 후 페이지 reload가 없는지 확인
- [ ] Alert이 현재 페이지에서 발생하는지 확인
- [ ] stubIframeDialogs()를 버튼 클릭 전에 호출
- [ ] @alertStub, @confirmStub alias 검증 추가

### 방법 2 (Cypress + Python) 사용 전
- [ ] pyautogui 설치 완료
- [ ] Python 명령어가 PATH에 있음
- [ ] cy.task('clickAlert') 정의됨
- [ ] Python 스크립트 경로 확인
- [ ] 대기 시간 충분히 설정 (최소 10초)
- [ ] cy.task를 버튼 클릭 **전**에 호출
- [ ] 백그라운드 실행으로 즉시 반환 확인

---

## 🎓 배운 점

### 기술적 인사이트
1. **브라우저 레벨 자동화의 한계**: JavaScript로는 네이티브 팝업을 제어할 수 없음
2. **OS 레벨 자동화의 필요성**: pyautogui 같은 도구로 키보드/마우스 직접 제어
3. **하이브리드 접근법**: 각 도구의 강점을 조합해서 해결
4. **페이지 상태 관리**: Reload 여부가 해결 방법을 결정하는 핵심

### 문제 해결 과정
- 8가지 이상의 방법을 시도하며 근본 원인 파악
- Form submit → 페이지 reload가 핵심 문제임을 발견
- 타이밍이 가장 중요한 요소임을 깨달음
- 간단한 경우와 복잡한 경우를 구분하는 기준 확립

### 실무 적용
- **우선순위**: 항상 Cypress Stub부터 시도 (간단하고 빠름)
- **레거시 시스템**: ASP.NET, iframe 등에서 특히 유용
- **팀 공유**: 두 가지 방법을 모두 이해하고 적절히 선택
- **CI/CD**: Headless 모드에서도 Python 방법 동작 확인됨

---

## 🚨 주의사항

### 방법 1 (Cypress Stub) 주의사항
- ⚠️ iframe이 아닌 main window의 Alert은 다른 방식 필요
- ⚠️ Cross-origin iframe에서는 작동하지 않을 수 있음
- ⚠️ 페이지 reload가 발생하면 무조건 실패

### 방법 2 (Python) 주의사항
- ⚠️ **보안**: CI/CD 환경에서 pyautogui 권한 확인 필요
- ⚠️ **타이밍**: 대기 시간이 너무 짧거나 길면 실패
- ⚠️ **멀티태스킹**: 테스트 실행 중 다른 창 사용 금지
- ⚠️ **OS 의존성**: Windows 환경에서 테스트됨 (Mac/Linux는 추가 설정 필요)

---

## 📅 작성 정보
- **작성일**: 2026-02-09
- **작성자**: QA 자동화 엔지니어
- **테스트 환경**: Windows 10, Chrome, Cypress 13.5.0
- **프로젝트**: GME Remit Core Admin

---

## 🙏 Thanks to
이 가이드는 실제 프로젝트에서 여러 시행착오를 거쳐 완성되었습니다.
- **New Device Login**: Cypress Stub으로 깔끔하게 해결
- **Modify Customer Bank**: Cypress + Python 하이브리드로 난제 극복

두 가지 방법을 모두 이해하면 어떤 Alert 상황에서도 대응할 수 있습니다! 🎉
