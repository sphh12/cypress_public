# Cypress 트러블슈팅 가이드 (GME Admin)

> GME Admin 포털 Cypress 테스트 스크립트 작성 중 발생한 에러, 수정 이력, 문제 처리 방법을 정리한 문서입니다.

---

## 1. 프로젝트 환경 특성

- GME Admin은 **iframe 기반** 페이지 구조 (`#mainFrame`)
- ASP.NET WebForms 백엔드 + jQuery UI + Bootstrap UI
- 모든 페이지 콘텐츠는 iframe 안에 로드되므로, `getMainFrame()` 헬퍼가 필수
- 라이브 환경에서 테스트하므로 **읽기 전용 동작만** 수행해야 함

---

## 2. 자주 발생하는 에러와 해결 방법

### 2-1. 페이지 타이틀 셀렉터 불일치

**증상:** `Expected to find element: h4.panel-title label, but never found it`

**원인:** 페이지마다 타이틀 HTML 구조가 다름

| 페이지 | HTML 구조 |
|--------|-----------|
| Inbound Bank List | `<h4 class="panel-title"><label>텍스트</label></h4>` |
| Receiver Detail List | `<h4 class="panel-title">텍스트</h4>` |

**해결:**
```js
// AS-IS: label 태그 의존 (특정 페이지에서만 동작)
getMainFrame().find('h4.panel-title label').should('have.text', '...');

// TO-BE: h4.panel-title 직접 사용 (범용)
getMainFrame().find('h4.panel-title').should('have.text', '...');
```

**교훈:** 같은 UI 패턴이라도 페이지별로 DOM 구조가 다를 수 있으므로, 반드시 **페이지별로 DOM 구조를 확인**한 후 셀렉터를 작성해야 한다.

---

### 2-2. 텍스트에 공백/줄바꿈 포함

**증상:** `expected '<h4.panel-title>' to have text 'Customer Verification Details', but the text was 'Customer Verification Details\n                            '`

**원인:** HTML 태그 안에 줄바꿈(`\n`)과 공백이 포함됨

```html
<!-- 실제 HTML -->
<h4 class="panel-title">Customer Verification Details
                            </h4>
```

**해결:**
```js
// AS-IS: 정확한 텍스트 일치 (공백에 민감)
getMainFrame().find('h4.panel-title').should('have.text', 'Customer Verification Details');

// TO-BE: 포함 여부만 확인 (공백에 안전)
getMainFrame().find('h4.panel-title').should('contain.text', 'Customer Verification Details');
```

**교훈:** `have.text`는 공백/줄바꿈까지 **정확히 일치**해야 하므로, 타이틀 검증에는 `contain.text`를 기본으로 사용하는 것이 안전하다.

---

### 2-3. DOM 분리(Detachment) 에러

**증상:** `cy.find() failed because the page updated as a result of this command, but you tried to continue the command chain. The subject is no longer attached to the DOM`

**원인:** Filter/Search 버튼 클릭 시 테이블(jqGrid 등)이 재렌더링되면서, 이전에 찾은 DOM 요소가 새 요소로 교체됨. 체이닝된 다음 명령이 이미 사라진 옛 요소를 참조하려고 할 때 발생.

**비유:** 집 주소를 적어놨는데, 건물이 철거되고 새로 지어져서 옛 주소가 무효화된 것

**해결:**
```js
// AS-IS: 클릭 직후 바로 체이닝 → DOM 분리 위험
getMainFrame().find('input[value="Filter"]').click();
getMainFrame().find('table tbody').should('contain.text', 'sphh');

// TO-BE: cy.wait()로 재렌더링 대기 후 새로 탐색
getMainFrame().find('input[value="Filter"]').click();
cy.wait(3000);  // 테이블 재렌더링 대기
getMainFrame().find('#grid_list_body tbody').should('contain.text', 'sphh');
```

**교훈:** 버튼 클릭 후 페이지/테이블이 갱신되는 경우, `cy.wait()` 또는 `cy.intercept()`로 완료를 기다린 후 새로 `getMainFrame().find()`로 요소를 다시 찾아야 한다.

---

### 2-4. 테이블 구조 차이 (thead 유무)

**증상:** 테이블 데이터가 있는데도 검색 결과 텍스트를 찾지 못함. tbody에 헤더 텍스트만 보임.

**원인:** 페이지마다 테이블 구조가 다름

| 구조 | 설명 | 데이터 시작 위치 |
|------|------|-----------------|
| `<thead>` + `<tbody>` | 일반적인 구조 | tbody의 첫 번째 tr |
| `<tbody>`만 사용 | 첫 tr이 헤더 역할 | tbody의 **두 번째 tr** (eq(1)) |

**해결:**
```js
// thead가 없는 테이블에서 데이터 row 접근
// 첫 row(eq(0))는 헤더이므로, eq(1)부터가 실제 데이터
getMainFrame().find('#grid_list_body tbody tr').eq(1).contains('button', 'View').click();
```

**교훈:** 테이블 셀렉터 작성 전, 반드시 `<thead>` 존재 여부를 확인하고, 테이블 고유 ID(`#grid_list_body`)를 사용하는 것이 클래스 조합보다 안정적이다.

---

## 3. iframe 네이티브 팝업(alert/confirm) 처리

### 3-1. 상황별 처리 방법 선택

| 상황 | 방법 | 사용 함수 |
|------|------|-----------|
| 최상위 window의 alert/confirm | Cypress 자동 처리 | 별도 코드 불필요 |
| iframe의 alert/confirm (리로드 없음) | stub 교체 | `stubIframeDialogs()` |
| iframe의 alert/confirm (**폼 포스트백 후 발생**) | 응답 HTML 가로채기 | `cy.intercept()` |

### 3-2. stubIframeDialogs() — iframe 리로드가 없을 때

```js
import { stubIframeDialogs } from '../../../module/iframe';

// iframe window의 alert/confirm을 stub으로 교체
stubIframeDialogs(true);  // confirm에 true(확인) 자동 응답

// 팝업을 발생시키는 동작 수행
getMainFrame().find('#someButton').click();

// stub 호출 여부 검증
cy.get('@alertStub').then(stub => {
    expect(stub).to.be.called;
    cy.log('팝업 메시지: ' + stub.firstCall.args[0]);
});
```

**한계:** 버튼 클릭으로 폼 포스트백(페이지 리로드)이 발생하면, iframe의 window 객체가 새로 생성되어 stub이 사라진다.

### 3-3. cy.intercept() — 폼 포스트백 후 팝업이 발생할 때 (권장)

**왜 필요한가?**

ASP.NET 폼 submit 버튼(`type="submit"`)을 클릭하면:
1. 폼 포스트백 발생 → iframe 완전히 새로 로드
2. 서버 응답 HTML에 인라인 `<script>alert('...')</script>` 포함
3. 브라우저가 HTML 파싱 중 alert를 **즉시 실행** → 네이티브 팝업 발생
4. Cypress가 팝업을 처리하지 못해 테스트 멈춤

`load` 이벤트 리스너로도 해결 불가 — alert는 HTML 파싱 중 실행되고, load는 파싱 **완료 후** 발생하므로 항상 늦음.

**해결 코드:**
```js
// 서버 응답 HTML이 브라우저에 도달하기 전에 가로채서
// alert()를 변수 저장 코드로 바꿔치기
cy.intercept('POST', '**/Manage.aspx*', (req) => {
    req.continue((res) => {
        if (res.body && typeof res.body === 'string') {
            res.body = res.body.replace(
                /\balert\s*\(/g,
                'window.__cypressAlertMsg=('
            );
        }
    });
}).as('verificationRequest');

// 버튼 클릭 (폼 포스트백 발생)
getMainFrame().find('#btnVerification').click();

// 서버 응답 완료 대기
cy.wait('@verificationRequest');
cy.wait(2000);

// 저장된 팝업 메시지 검증
cy.get('iframe#mainFrame')
    .its('0.contentWindow.__cypressAlertMsg')
    .should('include', 'Success');
```

**동작 원리:**

```
[원래 흐름]
서버 응답 HTML → alert('Success...') → 네이티브 팝업 발생 → 테스트 멈춤

[cy.intercept 적용 후]
서버 응답 HTML → cy.intercept가 가로챔 → alert()를 window.__cypressAlertMsg=()로 치환
→ 브라우저가 변환된 HTML 파싱 → 팝업 없이 변수에 메시지 저장 → 테스트 계속 진행
```

---

## 4. 셀렉터 작성 모범 사례

### 4-1. 셀렉터 우선순위

```
1순위: ID 셀렉터          → #searchBy, #btnVerification
2순위: name 속성          → [name="btnLogin"]
3순위: 고유한 data 속성    → [data-testid="..."]
4순위: 클래스 조합         → .panel-title, .btn-primary
5순위: contains(텍스트)    → cy.contains('button', 'View')
```

### 4-2. 페이지별 확인된 셀렉터

| 페이지 | 타이틀 셀렉터 | 테이블 셀렉터 | 검색 버튼 |
|--------|--------------|--------------|-----------|
| Inbound Bank List | `h4.panel-title label` | `table.table-striped.table-bordered` | `#btnSearch` |
| Receiver Detail List | `h4.panel-title` | `#grid_list_body` (thead 없음) | `input[value="Filter"]` |
| Customer ID Verification | `h4.panel-title` (공백 포함) | 없음 | `#btnViewDetail` |
| GME Pay Statement | `contains('strong', 'Easy Wallet...')` | `table.table-striped.table-bordered` | `button[onclick="CheckFormValidation();"]` |
| API Logs | `should('contain.text', 'API Transaction Log List')` | `table` (헤더: SN, Provider, Method, Control No...) | `input[value="Filter"]` (드롭다운 없음, `#apiLog_CONTROLNO` 직접 입력) |

### 4-3. 텍스트 검증 방식 선택

```js
// have.text: 정확히 일치해야 함 (공백/줄바꿈 민감)
// → 깔끔한 텍스트에 사용
.should('have.text', 'Receiver Detail List')

// contain.text: 텍스트가 포함되어 있으면 통과 (공백/줄바꿈 무시)
// → 타이틀/헤딩처럼 공백이 포함될 수 있는 요소에 사용 (권장)
.should('contain.text', 'Customer Verification Details')

// have.value: input/select의 value 속성 확인
.should('have.value', '636027')
```

---

## 5. 코드 작성 전 필수 확인 사항

새로운 페이지의 테스트 코드를 작성하기 전, 반드시 아래 항목을 확인:

1. **페이지 타이틀 구조** — `<h4>` 안에 `<label>` 있는지, 공백/줄바꿈 있는지
2. **테이블 구조** — `<thead>` 존재 여부, 테이블 고유 ID, 헤더 row 위치
3. **검색/필터 요소** — select ID, input ID, 버튼 ID 또는 value
4. **버튼 타입** — `type="submit"` (포스트백) vs `type="button"` (AJAX)
5. **팝업 발생 여부** — alert/confirm 사용 여부, 발생 시점(리로드 전/후)

---

## 6. 디버깅 팁

### 6-1. Cypress 로그에서 에러 읽는 법

```
에러 메시지 패턴 → 의미

"Expected to find element: XXX, but never found it"
→ 셀렉터가 현재 페이지 DOM과 맞지 않음. DOM 구조 재확인 필요.

"expected <element> to have text 'A', but the text was 'A\n   '"
→ 실제 텍스트에 공백/줄바꿈 포함. contain.text 사용.

"The subject is no longer attached to the DOM"
→ DOM 분리. 페이지/테이블 재렌더링 후 요소를 다시 찾아야 함.

"Timed out retrying after 5000ms"
→ 타임아웃 내 조건 미충족. wait 추가 또는 timeout 값 증가.
```

### 6-2. DOM 구조 빠르게 확인하는 방법

Chrome DevTools Console에서 iframe DOM 직접 탐색:
```js
// iframe 내부 문서 접근
const doc = document.getElementById('mainFrame').contentDocument;

// 특정 요소 찾기
doc.querySelector('h4.panel-title');
doc.querySelector('#searchBy');
doc.querySelectorAll('table');
```

---

## 7. 수정 이력

| 날짜 | 페이지 | 에러 | 수정 내용 |
|------|--------|------|-----------|
| 2026-04-06 | Receiver Detail List | `h4.panel-title label` 요소 없음 | `h4.panel-title label` → `h4.panel-title` |
| 2026-04-06 | Receiver Detail List | DOM 분리 + tbody에 헤더만 있음 | 테이블 셀렉터를 `#grid_list_body`로 변경, `cy.wait(3000)` 추가, `.first()` → `.eq(1)` |
| 2026-04-06 | Customer ID Verification | 타이틀 텍스트에 `\n` 공백 포함 | `have.text` → `contain.text` |
| 2026-04-06 | Customer ID Verification | 네이티브 alert 팝업 미처리 (stub 실패) | `stubIframeDialogs()` → `cy.intercept()`로 응답 HTML 내 alert 치환 |
| 2026-04-06 | Customer Statement | `#CustomerInfo_aText`가 `display:none` | jQuery autocomplete의 `aSearch`를 `show()` 후 직접 호출 |
| 2026-04-06 | Customer Statement | datepicker 팝업이 End Date 필드를 가림 | `cy.type()` → `datepicker('setDate')` API로 직접 날짜 설정 |
| 2026-04-06 | Customer Statement | jQuery `.val()`로 설정한 날짜를 서버가 인식 못함 | `.val()` → `.datepicker('setDate').trigger('change')`로 내부 상태+이벤트 동기화 |
| 2026-04-06 | Customer Statement | Filter 클릭 후 결과 페이지에서 탭 못 찾음 | `.nav-tabs a` 클릭 → iframe `src` 직접 변경으로 탭 이동 |
| 2026-04-06 | Customer Statement | 포스트백 후 DOM 분리로 테이블 못 찾음 | Filter 클릭 후 `cy.wait(5000)` 추가하여 포스트백 완료 대기 |
| 2026-04-06 | Customer Statement | "Oops!!! something went wrong" — autocomplete `.click()`이 jQuery UI `select` 이벤트를 트리거하지 못해 `aValue`가 빈 값으로 전송됨 | `.click()` 제거 → `$firstItem.data('uiAutocompleteItem')`에서 `id`를 가져와 `aValue`에 직접 `val()` 설정 |
| 2026-04-07 | Customer Statement | Tab 2~5에서 autocomplete AJAX 엔드포인트가 달라 `ERR_EMPTY_RESPONSE` 발생 (Tab 1은 `DataSource.asmx/GetList`, Tab 2는 `AccountStatement.aspx/GetList`) | Tab 1에서만 autocomplete 호출 후 `customerData`에 저장, Tab 2~5는 `aValue`/`aText`에 직접 설정 |
| 2026-04-07 | Customer Statement | Filter 클릭 시 `CheckFormValidation()`이 3개의 Wallet AJAX를 호출 → Cypress 환경에서 AJAX 실패 → error 콜백의 `alert('Oops!!!')` 발생 | Filter 클릭 전 `win.alert = function(msg){ win.__suppressedAlert = msg; }`로 네이티브 팝업 억제 |
| 2026-04-07 | Customer Statement | Tab 5(Oris) 고객 ID 형식이 다름 — Tab 1~4는 `M587W9405`(회원번호), Tab 5 Oris는 `636027`(숫자 고객번호) → Tab 1 데이터 재사용 시 서버 에러 | Tab 5는 자체 autocomplete 실행하여 Oris 전용 ID 추출 후 설정 |
| 2026-04-09 | Customer Statement | 포스트백 후 DOM detach — `.then($body =>`로 캡처한 body가 포스트백 완료 후 분리됨 + `should('not.be.empty')`가 포스트백 전 페이지에서도 통과 | `.should($body => { expect(테이블 or No data 텍스트).to.be.true })` 콜백 재시도 방식으로 변경. 포스트백 결과가 나타날 때까지 자동 반복 확인 |
| 2026-04-09 | Customer Statement | `getMainFrame().find('body')` 실패 — `getMainFrame()`이 이미 `<body>`를 반환하므로 body 안에서 body를 찾으려고 해서 항상 실패 | `getMainFrame().find('body')` 제거, `getMainFrame().should($body => {...})` 직접 사용 |
| 2026-04-09 | Customer Statement | Tab 3 이외 탭에서도 "No wallet statement found"를 정상 처리 — 데이터가 있어야 하는 탭에서도 빈 결과를 허용하는 느슨한 로직 | Tab 3(Inbound, index=2)만 "No wallet statement found" 허용, 나머지 탭은 테이블 필수로 엄격 검증 |
| 2026-04-09 | 전체 | `debugger;` 문이 애플리케이션 소스코드에 남아있어 DevTools 열린 상태에서 실행 중단 | `debugger;`는 DevTools가 열려있을 때만 동작. DevTools를 닫고 실행하면 자동 무시됨 |
| 2026-04-09 | Online Remit | `find('button').contains('Filter')` 실패 — 첫 번째 button(X 닫기 버튼) 안에서 'Filter' 텍스트를 찾으려 함 | `find('button').contains()`와 `contains('button', ...)`의 차이 이해. 전자는 첫 번째 button 내부 검색, 후자는 텍스트 포함 button 직접 검색 |
| 2026-04-09 | Online Remit | `contains('button', 'Filter')` 실패 — Filter 버튼이 `<input type="button" value="Filter">` 형태라 textContent가 비어있음 | `win.jQuery('input[value="Filter"], button:contains("Filter")')` 로 input과 button 모두 대응 |
| 2026-04-09 | Point Statement Tab 2 | `CheckFormValidation()` 클릭 후 iframe이 404 에러 페이지로 이동 — `location.href`로 결과 페이지 이동하는데 Cypress에서 포스트백으로 착각하여 같은 페이지에서 결과를 기대 | 탭별 `CheckFormValidation()` 소스 분석 필수. Tab 1은 포스트백, Tab 2/3은 `location.href`, Tab 4는 `window.open` — 각각 다른 방식으로 처리 |
| 2026-04-09 | Point Statement Tab 2 | `Object.defineProperty(win.location, 'href', {...})` TypeError — `location` 객체는 브라우저 보안상 property descriptor 접근 불가 | `location.href` 가로채기 불가. 소스 분석으로 URL 패턴을 파악한 뒤 URL을 직접 구성하여 `iframe.src`로 이동 |
| 2026-04-09 | Point Statement Tab 2/3 | 결과 페이지에서 `validatePage()` 실패 — 결과/리포트 페이지에 `.panel` 요소가 없음 | 결과 페이지는 검색 폼과 DOM 구조가 다르므로 `validatePage()` 미사용. `getMainFrame().should()` 로 테이블/텍스트 존재만 확인 |
| 2026-04-16 | Customer Statement (Oris) | `table.table-striped.table-bordered` 셀렉터로 테이블을 못 찾음 — Oris 결과 페이지의 테이블에는 해당 클래스가 없음 | 탭별 `tableSelector` 분기 처리: Oris(index=4)는 `'table'`, 나머지는 `'table.table-striped.table-bordered'` |
| 2026-04-16 | Receiver Details | 모달 `#div_view_modal`이 `be.visible` 실패 — DOM에 존재하고 `fade.in` 클래스도 있지만 CSS `opacity: 0` (애니메이션 미완료) | `cy.wait(1000)` 추가 + `.should('have.class', 'in').and('have.css', 'opacity', '1')` 로 변경 |
| 2026-04-16 | API Logs | `getMainFrame().find('h4.panel-title')` 타이틀 인식 실패 — iframe 로드 중 대시보드의 panel-title을 읽어옴 ("STATUS WISE NUMBER OF TRANSACTION...") | `getMainFrame().find().should()` 체이닝 → `getMainFrame().should('contain.text', '...')` 직접 확인으로 변경. 매번 iframe 새로 조회하여 안정적 |
| 2026-04-16 | API Logs | 패턴 기반으로 `#ddlSearchBy`, `#txtSearchValue` 추정했으나 실제 DOM에 존재하지 않음 — 검색 드롭다운 없이 직접 입력 필드(`#apiLog_CONTROLNO`) 구조 | 반드시 브라우저 DOM 분석 후 코드 작성. 페이지별 검색 UI 구조가 완전히 다를 수 있음 |
| 2026-04-16 | 전체 | 파일 편집 후 마지막 줄에 NUL(`\x00`) 문자가 삽입되어 Cypress 파싱 에러 | 매 편집 후 `tail -5`로 확인 + Python으로 NUL 문자 제거: `data.replace(b'\x00', b'')` |

---

## 8. 주요 패턴 정리

### 8-1. 포스트백 후 결과 대기 — `.should()` 콜백 재시도 패턴

포스트백(form submit)이 발생하면 iframe DOM이 완전히 교체됩니다. `.should('not.be.empty')`는 포스트백 이전 페이지에서도 통과하므로 부적절합니다.

```js
// ❌ 잘못된 방식: 포스트백 전 DOM에서도 통과
getMainFrame().find('body').should('not.be.empty');

// ✅ 올바른 방식: 결과가 나타날 때까지 재시도
getMainFrame().should($body => {
    const hasTable = $body.find('table.table-striped').length > 0;
    const hasNoData = $body.text().includes('No wallet statement found');
    expect(hasTable || hasNoData).to.be.true;
});
```

**핵심:** `.should()` 콜백은 assertion이 실패하면 자동으로 재시도합니다. 포스트백이 완료되어 실제 결과가 DOM에 나타날 때까지 반복 확인합니다.

### 8-2. iframe 내부 jQuery 활용 — DOM 참조 안정성

Cypress의 `getMainFrame().then($body =>` 로 캡처한 `$body`는 스냅샷이라 포스트백 후 stale(분리)될 수 있습니다.

```js
// ❌ 스냅샷 DOM — 포스트백 후 분리됨
getMainFrame().then($body => {
    if ($body.find('table').length > 0) { ... }  // stale reference
});

// ✅ iframe의 live jQuery — 실시간 DOM 조회
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    const hasTable = win.jQuery('table.table-striped').length > 0;  // live reference
});
```

### 8-3. Filter/검색 버튼 클릭 — jQuery 직접 호출 패턴

버튼이 `<button>` 또는 `<input type="button">` 어떤 형태인지 모를 때:

```js
// ✅ 두 형태 모두 대응
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    const $btn = win.jQuery('input[value="Filter"], button:contains("Filter")').first();
    $btn.click();
});
```

### 8-4. getMainFrame() 반환값 주의

`getMainFrame()`은 iframe의 `contentDocument.body`를 반환합니다. 따라서:

```js
// ❌ body 안에서 body를 찾으려 함 — 항상 실패
getMainFrame().find('body').should('not.be.empty');

// ✅ 직접 body에 assertion
getMainFrame().should('not.be.empty');
```

### 8-5. iframe 로드 중 타이틀 확인 — 체이닝 회피 패턴

`getMainFrame().find('h4.panel-title').should(...)` 체이닝은 iframe 페이지가 로드되는 중간에 DOM이 교체되면 이전 페이지(대시보드 등)의 요소를 읽을 수 있습니다.

```js
// ❌ 체이닝 방식 — iframe 로드 중 DOM 교체로 대시보드 타이틀을 읽음
getMainFrame().find('h4.panel-title').should($el => {
    expect($el.text()).to.include('API Transaction Log List');
});

// ✅ 직접 텍스트 확인 — 매번 iframe을 새로 조회하여 안정적
getMainFrame().should('contain.text', 'API Transaction Log List');
```

**핵심:** `.find()` 체이닝은 한 번 잡은 DOM에서 하위 검색하므로, 중간에 iframe이 교체되면 stale 참조가 됩니다. `.should('contain.text', ...)`는 매번 `getMainFrame()`부터 재실행하므로 안전합니다.

### 8-6. 모달 팝업 애니메이션 대기 패턴

Bootstrap 모달의 `fade` 클래스는 `opacity: 0 → 1` 애니메이션을 적용합니다. 테스트 전체 실행 시 브라우저 부하로 애니메이션이 느려져 `be.visible`이 실패할 수 있습니다.

```js
// ❌ 애니메이션 완료 전 확인 — opacity:0이면 실패
getMainFrame().find('#div_view_modal').should('be.visible');

// ✅ 대기 + CSS 속성 직접 확인
cy.wait(1000); // 애니메이션 완료 대기
getMainFrame().find('#div_view_modal')
    .should('have.class', 'in')
    .and('have.css', 'opacity', '1');
```

### 8-7. 페이지별 검색 UI 구조 차이 — 패턴 추정 금지

같은 어드민이라도 페이지마다 검색 UI 구조가 완전히 다를 수 있습니다. 반드시 **브라우저 DOM 분석 후** 코드를 작성해야 합니다.

| 페이지 | 검색 구조 |
|--------|----------|
| Customer Statement | 드롭다운(`#ddlSearchBy`) + 입력필드(`#txtSearchValue`) |
| API Logs | 드롭다운 없음, 직접 입력 필드(`#apiLog_CONTROLNO`, `#apiLog_REQUESTEDBY`) |
| Inbound Bank List | 드롭다운(`#searchBy`) + 입력필드 |
| Online Remit | 드롭다운 + 날짜 필터 |

### 8-8. 브라우저에서 iframe DOM 일괄 분석 — JavaScript 기법

테스트 코드 작성 전 페이지의 모든 요소를 한번에 추출하는 실전 스크립트:

```js
// Chrome DevTools Console에서 실행
var doc = document.getElementById('mainFrame').contentDocument;

// 1. 모든 input 요소 (id, name, type)
var inputs = [];
doc.querySelectorAll('input').forEach(function(i) {
    inputs.push({id: i.id, name: i.name, type: i.type});
});

// 2. 모든 select + option 목록
var selects = [];
doc.querySelectorAll('select').forEach(function(s) {
    var opts = [];
    s.querySelectorAll('option').forEach(function(o) {
        opts.push({value: o.value, text: o.textContent.trim()});
    });
    selects.push({id: s.id, name: s.name, options: opts});
});

// 3. 버튼 (button + input[type=button/submit])
var buttons = [];
doc.querySelectorAll('button, input[type="submit"], input[type="button"]').forEach(function(b) {
    buttons.push({id: b.id, text: (b.textContent.trim() || b.value)});
});

// 4. 테이블 헤더
var headers = [];
doc.querySelectorAll('table th').forEach(function(th) {
    headers.push(th.textContent.trim());
});

JSON.stringify({inputs, selects, buttons, headers}, null, 2);
```

**활용:** 이 결과를 기반으로 셀렉터를 정확하게 작성할 수 있음. 패턴 추정보다 확실하고 에러 방지에 효과적.

### 8-9. `it.only` vs `it` — 개별/전체 실행 전환 주의

```js
// 개별 테스트 시: it.only로 해당 테스트만 실행
it.only('Core System Logs - API Logs', function () { ... });

// 전체 실행 시: it으로 변경해야 다른 테스트도 실행됨
it('Core System Logs - API Logs', function () { ... });
```

**주의:** `it.only`가 파일에 남아있으면 해당 테스트만 실행되고 나머지는 스킵됩니다. 전체 실행 전 반드시 `it`으로 변경해야 합니다.

### 8-10. 파일/폴더명 특수문자 혼입 문제

Windows 환경에서 스크립트 실행 시 줄바꿈 문자(`\r`)가 폴더명에 섞여 들어갈 수 있습니다.

```bash
# 증상: 같은 이름의 폴더가 2개로 보임
ls -la | grep cypress-history
# → cypress-history (정상)
# → cypress-history (비정상 — 끝에 \r\r 숨어있음)

# 확인 방법: Python으로 실제 이름 확인
python3 -c "
import os
entries = os.listdir('.')
for e in entries:
    if 'history' in e:
        print(repr(e))
"
# → 'cypress-history'
# → 'cypress-history\r\r'  ← 특수문자 발견

# 삭제: Python shutil 사용
python3 -c "
import shutil
shutil.rmtree('cypress-history\r\r')
"
```

**예방:** 셸 스크립트에서 `dos2unix`로 줄바꿈 변환 후 실행, 또는 변수에 `$(echo -e ...)` 사용 시 주의.

### 8-11. window.open Stub — 새 창 결과 페이지 캡처 패턴

`CheckFormValidation()` 등이 `window.open()`으로 새 창에 결과를 표시하는 경우, Cypress는 새 창을 제어할 수 없습니다. Stub으로 URL을 가로채서 같은 iframe에 로드합니다.

```js
// Step 1: alert 억제 + window.open stub 설정
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    win.alert = function (msg) { win.__suppressedAlert = msg; };
    cy.stub(win, 'open').callsFake((url, target, features) => {
        win.__newWindowUrl = url;        // URL 캡처
        return { focus: function () {} }; // 가짜 window 객체 반환
    });
});

// Step 2: 검색 실행 (window.open 트리거)
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    win.CheckFormValidation();
});

// Step 3: 캡처된 URL로 iframe 이동
cy.get('iframe#mainFrame').its('0.contentWindow')
    .its('__newWindowUrl').should('exist')
    .then(capturedUrl => {
        cy.get('iframe#mainFrame').then($iframe => {
            $iframe[0].src = baseUrl + capturedUrl;
        });
    });
```

**핵심:** `cy.stub()`은 해당 iframe window가 살아있는 동안만 유효합니다. 페이지 리로드 시 stub이 사라지므로, 리로드 전에 호출해야 합니다.

### 8-12. iframe.src 직접 이동 — 탭 전환 / 결과 페이지 로드 패턴

`CheckFormValidation()`이 `location.href`로 결과 페이지를 이동시키는 경우, Cypress에서 이를 가로챌 수 없습니다. 소스 분석으로 URL 패턴을 파악한 뒤 `iframe.src`를 직접 설정합니다.

```js
// URL 패턴: baseUrl + 페이지명 + 쿼리스트링
const baseUrl = '/AgentPanel/OnlineAgent/GMEPayPointManagement/';
const resultUrl = baseUrl + 'GMEPointStatementResult.aspx?startDate=3/9/2026&endDate=4/9/2026&SearchById=email&SearchValue=sphh';

// iframe.src 직접 설정으로 이동
cy.get('iframe#mainFrame').then($iframe => {
    $iframe[0].src = resultUrl;
});
cy.wait(3000);
```

**주의사항:**
- 결과 페이지는 검색 폼과 DOM 구조가 다르므로 `validatePage()` 사용 불가
- `getMainFrame().should()` 로 테이블/텍스트 존재만 확인

### 8-13. jQuery UI autocomplete 데이터 추출 패턴

autocomplete 검색 후 결과 목록에서 내부 데이터(id, value)를 추출하는 방법:

```js
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    // autocomplete 검색 트리거
    const $input = win.jQuery('#CustomerInfo_aSearch');
    $input.val('sphh').trigger('input');
    $input.autocomplete('search', 'sphh');
});

cy.wait(2000);

cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    // 검색 결과에서 첫 번째 항목의 내부 데이터 추출
    const $firstItem = win.jQuery('.ui-menu-item').first();
    const itemData = $firstItem.data('uiAutocompleteItem')     // jQuery UI 1.10+
                  || $firstItem.data('item.autocomplete');      // jQuery UI 1.8
    
    // 추출한 데이터로 hidden field 설정
    win.jQuery('#CustomerInfo_aValue').val(itemData.id);    // 고객 ID
    win.jQuery('#CustomerInfo_aText').val(itemData.value);  // 고객명
});
```

**주의:** `.click()`으로 autocomplete 항목을 선택하면 jQuery UI `select` 이벤트가 제대로 발생하지 않아 `aValue`가 빈 값으로 전송됩니다. 반드시 `.data()`로 내부 데이터를 추출 후 직접 설정해야 합니다.

### 8-14. GNB 메뉴 내비게이션 — 드롭다운 + 서브메뉴 타이밍 패턴

GME Admin의 GNB(Global Navigation Bar) 메뉴는 2단계 드롭다운입니다. 각 단계 사이에 `cy.wait(2000)` 이 필요합니다.

```js
// Step 1: 최상위 메뉴 클릭 (nth-child 번호는 메뉴 순서)
cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
cy.wait(2000);  // 드롭다운 애니메이션 대기

// Step 2: 중간 메뉴에 마우스오버 (하위 메뉴 표시)
cy.contains('Core System Logs').trigger('mouseover');
cy.wait(2000);  // 서브메뉴 표시 대기

// Step 3: 최종 메뉴 항목 클릭
cy.contains('API Logs').click({ force: true });
```

**메뉴 순서 (nth-child 번호):**

| nth-child | 메뉴 |
|-----------|------|
| 1 | ADMINISTRATION |
| 2 | SYSTEM SECURITY |
| 3 | REMITTANCE |
| 4 | ACCOUNT |
| 5 | INBOUND |
| 6 | OTHER SERVICES |
| 7 | TRANSACTION |
| 8 | EXCHANGE SETUP |
| 9 | MONEY EXCHANGE |

### 8-15. GPT 오버레이 대기 — beforeEach 필수 패턴

GME Admin에는 GPT 챗봇 오버레이(`#gptcb-overlay`)가 로그인 후 표시됩니다. 이 오버레이가 사라지기 전에 테스트를 시작하면 클릭이 차단됩니다.

```js
beforeEach(() => {
    cy.viewport(1920, 1080);
    cy.visit(Cypress.env('live_gme'));
    cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
    cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
    cy.get('[name="txtCompcode"]').type(Cypress.env('live_code_gme01'));
    cy.get('[name="btnLogin"]').click();
    cy.get('#chatBubbleImageId', { timeout: 10000 }).should('be.visible');
    cy.get('#gptcb-overlay', { timeout: 20000 }).should('not.exist'); // ← 필수!
});
```

### 8-16. Filter 버튼 중복 — `.first()` 필수

한 페이지에 Filter 버튼이 여러 개 존재할 수 있습니다 (숨겨진 영역, 다른 패널 등). `.first()`로 첫 번째 것만 클릭해야 합니다.

```js
// ❌ 여러 개 매칭 시 에러 또는 잘못된 버튼 클릭
getMainFrame().find('input[value="Filter"]').click();

// ✅ 첫 번째 것만 클릭
getMainFrame().find('input[value="Filter"]').first().click();
```

### 8-17. validatePage() 후 타이틀 인식 실패 — getMainFrame() stale body 문제

`validatePage()` 직후 `getMainFrame().should('contain.text', '...')`로 타이틀을 확인하면, iframe DOM이 아직 전환 중일 때 **대시보드(부모 페이지) body**를 참조하여 실패합니다.

**원인:** `getMainFrame()`의 `.then(cy.wrap)`이 Cypress 재시도 체인을 끊기 때문입니다. `.should()`가 실패해도 `.then()` 이전의 `cy.get`부터 다시 쿼리하지 않고, 이미 wrap된 stale body에서만 재시도합니다.

```js
// ❌ getMainFrame()의 .then(cy.wrap) 때문에 stale body 참조
getMainFrame().should('contain.text', 'API Transaction Log List');

// ✅ 직접 체이닝 — 실패 시 cy.get부터 재쿼리
cy.wait(2000); // iframe DOM 안정화 대기
cy.get('iframe#mainFrame', { timeout: 15000 })
    .its('0.contentDocument.body')
    .should('contain.text', 'API Transaction Log List');
```

**핵심:** `getMainFrame()`은 `find()`, `click()` 등 **액션 명령**에는 안전하지만, `validatePage()` 직후 **텍스트 존재 확인**에는 직접 체이닝이 필수입니다.

### 8-18. Filter 버튼 — `button` vs `input` 태그 구분 필수

Filter 버튼이 `<button>` 태그가 아닌 `<input type="button" value="Filter">`인 경우가 많습니다. jQuery `button:contains("Filter")`는 `<input>`을 찾지 못합니다.

```js
// ❌ <input> 태그 Filter를 찾지 못함
win.jQuery('button:contains("Filter")').first().click();

// ✅ input[value="Filter"]로 정확히 매칭
getMainFrame().find('input[value="Filter"]').first().click();
```

### 8-19. thead 없는 테이블 — tbody 첫 행이 헤더(TH)인 구조

일부 그리드는 `<thead>` 없이 `<tbody>` 내 첫 번째 `<tr>`이 `<th>` 헤더 행이고, 두 번째 `<tr>`부터 `<td>` 데이터 행입니다.

```js
// ❌ jQuery .first()는 TH 헤더 행을 선택함
win.jQuery('#gridDisplay_body tbody tr').first().find('td'); // td 0개

// ✅ .eq(1)로 첫 데이터 행 선택
win.jQuery('#gridDisplay_body tbody tr').eq(1).find('td').eq(10).text();
```

### 8-20. readonly 필드 — jQuery `.val()`로 값 설정

datepicker, time 등 `readonly` 속성이 있는 `<input>`은 Cypress `.type()`이 동작하지 않습니다. jQuery `.val()`로 직접 설정해야 합니다.

```js
// ❌ readonly 필드에 type 불가
getMainFrame().find('#grid_customerLogs_createdDate').type('2026-04-16');

// ✅ jQuery .val()로 직접 설정
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    win.jQuery('#grid_customerLogs_createdDate').val('2026-04-16');
    win.jQuery('#grid_customerLogs_fromTime').val('00:00');
    win.jQuery('#grid_customerLogs_toTime').val('23:00');
});
```

### 8-21. Filter 후 데이터 확인 — DOM detach 대응

Filter 클릭 후 서버에서 결과를 받아오면 iframe DOM이 갱신됩니다. `getMainFrame().find()`는 stale body를 참조하여 실패할 수 있습니다. `.should()` 콜백 안에서 검증하면 실패 시 처음부터 재쿼리합니다.

```js
// ❌ getMainFrame()이 stale body 참조
getMainFrame().find('#grid_body tbody tr').should('have.length.greaterThan', 1);

// ✅ 직접 체이닝 + .should() 콜백 — 재쿼리 보장
cy.get('iframe#mainFrame', { timeout: 15000 })
    .its('0.contentDocument.body')
    .should($body => {
        const rows = $body.find('#grid_body tbody tr');
        expect(rows.length, '데이터 행 존재').to.be.greaterThan(1);
    });
```

### 8-22. 필수 필드 누락 — "Required Field(s)" 알림 팝업 방어

일부 페이지는 Filter 클릭 시 필수 필드(날짜, 시간 등)가 비어있으면 네이티브 alert로 "Required Field(s)" 경고를 띄웁니다. 필수 필드는 빨간색 배경으로 표시되며, 대부분 readonly이므로 jQuery `.val()`로 설정해야 합니다.

```js
// ❌ 필수 필드를 채우지 않고 Filter 클릭 → alert 발생
getMainFrame().find('input[value="Filter"]').first().click();

// ✅ Filter 전에 readonly 필수 필드를 jQuery로 설정
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    const today = new Date().toISOString().split('T')[0];
    win.jQuery('#grid_createdDate').val(today);
    win.jQuery('#grid_fromTime').val('00:00');
    win.jQuery('#grid_toTime').val('23:00');
});
getMainFrame().find('input[value="Filter"]').first().click();
```

### 8-23. 검색 응답 지연 — wait + timeout 이중 대기 전략

서버 응답이 느린 페이지에서 `cy.wait(3000)`만으로는 부족할 수 있습니다. **wait로 기본 대기** + **timeout으로 재시도 한도**를 함께 설정하면 안정적입니다.

```js
// ❌ wait만 사용 — 서버가 느리면 실패
getMainFrame().find('#grid_body tbody tr').should('have.length.greaterThan', 1);

// ✅ wait(5초) + should 콜백 내 timeout(15초) 이중 대기
cy.wait(5000);
cy.get('iframe#mainFrame', { timeout: 15000 })
    .its('0.contentDocument.body')
    .should($body => {
        const rows = $body.find('#grid_body tbody tr');
        expect(rows.length, '데이터 행 존재').to.be.greaterThan(1);
    });
```

### 8-24. Cypress .type() 값을 Nav() 함수가 인식 못하는 경우

일부 그리드 시스템에서 Cypress `.type()`으로 입력한 값이 화면에는 보이지만, Filter의 `Nav()` 함수가 내부적으로 값을 읽지 못해 0건이 검색됩니다. jQuery `.val()`로 설정하고 `Nav()` 함수를 직접 호출하면 해결됩니다.

```js
// ❌ .type()은 화면에만 반영, Nav()가 값 인식 못함
getMainFrame().find('#grdAppEx_createdBy').clear().type('philiph');
getMainFrame().find('input[value="Filter"]').first().click();

// ✅ jQuery .val()로 설정 + Nav() 직접 호출
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    win.jQuery('#grdAppEx_createdBy').val('philiph');
});
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    win.Nav(1, 'grdAppEx', false, 1);
});
```

### 8-25. cy.contains() 부분 매칭 — 동일 텍스트 포함 메뉴 주의

`cy.contains('Error Logs')`는 "Oris Report **Error Logs**"처럼 텍스트를 **포함하는** 첫 번째 요소를 매칭합니다. 정확히 해당 텍스트만 매칭하려면 정규식 `^...$`를 사용합니다.

```js
// ❌ 'Oris Report Error Logs'가 먼저 매칭될 수 있음
cy.contains('Error Logs').click();

// ✅ 정규식으로 정확히 'Error Logs'만 매칭
cy.contains('a', /^Error Logs$/).click({ force: true });
```

### 8-26. window.open 팝업 차단 — fetch로 HTML 가져와서 데이터 추출

Cypress(및 Chrome)에서 `window.open()`으로 여는 팝업은 차단됩니다. `OpenInNewWindow('ViewRemark.aspx?id=...')`처럼 팝업에서 데이터를 가져와야 할 때, `cy.stub(win, 'open')`도 유효하지만 **실제 HTML 내용이 필요한 경우** `fetch`로 직접 요청하여 파싱하는 방법이 가장 확실합니다.

```js
// ① onclick 속성에서 URL 추출
const onclickStr = $link.attr('onclick'); // "OpenInNewWindow('ViewRemark.aspx?id=123')"
const urlMatch = onclickStr.match(/OpenInNewWindow\('(.+?)'\)/);
const remarkUrl = urlMatch[1];

// ② iframe의 contentWindow.fetch로 요청 (같은 세션 쿠키 공유)
return cy.wrap(
    win.fetch(remarkUrl, { credentials: 'include' }).then(res => res.text())
);

// ③ DOMParser로 HTML 파싱하여 데이터 추출
const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const tds = doc.querySelectorAll('td');
```

**핵심:** `win.fetch()`는 iframe의 `contentWindow`에서 호출해야 상대 경로가 iframe의 현재 URL 기준으로 해석되고, 세션 쿠키도 공유됩니다.

### 8-27. 마스킹된 데이터 우회 — 상세 페이지에서 원본 데이터 추출

테이블에 마스킹된 값(예: `EL*******`, `010****9557`)이 표시되는 경우, View Details 등 상세 페이지를 fetch하면 마스킹 안 된 원본 데이터를 가져올 수 있습니다. 이 방법은 동적 검색 조건 생성(예: Tab2에서 Username 추출 → Tab1에서 검색)에 활용됩니다.

```js
// let savedUsername을 테스트 스코프에 선언하고,
// .then() 체인 안에서 값을 할당한 후,
// cy.then(() => {...})으로 감싸서 비동기 순서를 보장

let savedUsername = '';

// Tab2에서 fetch로 Username 추출
cy.get('iframe#mainFrame').its('0.contentWindow').then(win => {
    return cy.wrap(win.fetch(remarkUrl, { credentials: 'include' }).then(r => r.text()));
}).then(html => {
    // 파싱 후 savedUsername에 저장
    savedUsername = doc.querySelector('td:nth-child(2) span').textContent;
});

// Tab1에서 저장된 값 사용 — cy.then()으로 비동기 순서 보장
cy.then(() => {
    getMainFrame().find('#kftcLog_requestedBy').clear().type(savedUsername);
});
```

### 8-28. per page(표시 항목 수) 변경 — ID 없는 select + Nav() 호출

per page select에 ID가 없고 `name` 속성만 있는 경우, `name` 셀렉터로 접근합니다. 값 변경만으로는 반영되지 않고 `Nav()` 함수를 직접 호출해야 재조회됩니다.

```js
cy.get('iframe#mainFrame')
    .its('0.contentWindow')
    .then(win => {
        // name 속성으로 select 접근
        win.jQuery('select[name="grid_FaceVerificationlist_pageSize"]').val('100');
        // Nav() 호출로 재조회 (onchange 이벤트와 동일)
        win.Nav(1, 'grid_FaceVerificationlist', false);
    });
cy.wait(5000); // 100건 로드 대기
```

### 8-29. 다른 페이지에서 검색 데이터를 동적으로 추출하여 활용

배치 처리로 데이터가 클리어되어 고정 검색값이 통하지 않는 경우, 다른 페이지에서 최신 데이터를 추출하여 검색값으로 사용합니다. 각 `it` 블록은 독립적이므로 같은 `it` 안에서 Phase를 나눠 구현합니다.

```js
it('Customer Logs', function () {
    let savedEmail = '';

    // Phase 1: KFTC Transaction Logs에서 이메일 추출
    // → 메뉴 진입 → 검색 → per page 100 → Success! 행 찾기 → ViewRemark fetch → 이메일 추출

    // Phase 2: Customer Logs로 이동하여 추출된 이메일로 검색
    cy.then(() => {
        getMainFrame().find('#searchValue').clear().type(savedEmail);
    });
});
```

**핵심:** `it` 블록 간 변수 공유가 불가하므로, 반드시 같은 `it` 안에서 Phase를 나눠 실행해야 합니다.

### 8-30. CSS `text-transform: uppercase`로 인한 `contain.text` 불일치

화면에서 대문자로 보이더라도 실제 HTML 텍스트는 다를 수 있습니다. CSS `text-transform: uppercase`가 적용된 경우, Cypress의 `should('contain.text', ...)` 는 **실제 HTML 텍스트**를 기준으로 비교합니다.

```
에러 메시지:
AssertionError: expected <body> to contain text 'GME PAY LIST'
→ 화면에는 "GME PAY LIST"로 보이지만, 실제 HTML 텍스트는 "GME Pay List"
```

```js
// ❌ 화면에 보이는 대로 작성 — 실패
cy.get('iframe#mainFrame').its('0.contentDocument.body')
    .should('contain.text', 'GME PAY LIST');

// ✅ 실제 HTML 텍스트로 작성 — 성공
cy.get('iframe#mainFrame').its('0.contentDocument.body')
    .should('contain.text', 'GME Pay List');
```

**확인 방법:** 브라우저 DevTools에서 해당 요소의 `textContent`를 확인하거나, `getComputedStyle(el).textTransform` 값이 `uppercase`인지 확인합니다.

### 8-31. autocomplete `aText`↔`aSearch` 토글 패턴

GME Admin에서 autocomplete 입력 필드가 두 개의 input으로 구성된 토글 구조일 수 있습니다. `aText`(표시용, visible)를 클릭하면 focus 이벤트로 `aSearch`(입력용, hidden→visible)가 나타나고 `aText`는 숨겨집니다.

```
에러 메시지:
CypressError: cy.clear() failed because this element is not visible
→ #GMEPayDetails_aSearch가 display: none 상태에서 직접 접근하면 실패
```

```js
// ❌ aSearch에 바로 접근 — 실패 (display: none)
getMainFrame().find('#GMEPayDetails_aSearch').clear().type('검색어');

// ✅ aText 클릭 → aSearch visible 확인 → 입력
getMainFrame().find('#GMEPayDetails_aText').click();
cy.wait(500);
getMainFrame().find('#GMEPayDetails_aSearch')
    .should('be.visible')
    .clear()
    .type('검색어');
cy.wait(3000); // autocomplete 드롭다운 로딩 대기

// autocomplete 항목 선택
cy.get('iframe#mainFrame').its('0.contentDocument.body')
    .find('.ui-menu-item', { timeout: 10000 })
    .first()
    .click();
```

**토글 메커니즘:** `aText` focus 이벤트 → `$(aSearch).val($(aText).val()); $(aSearch).show(); $(aSearch).focus(); $(aText).hide();`

### 8-32. Search postback 후 탭 네비게이션 소실 대응

일부 페이지에서 Search 버튼 클릭(postback) 후 결과 페이지로 완전히 전환되면서, 기존 탭(List/Details/Statistics 등)이 사라질 수 있습니다. 이 경우 다른 탭으로 이동하려면 메뉴를 다시 클릭하여 원래 페이지에 재진입해야 합니다.

```
에러 메시지:
AssertionError: Expected to find content 'Statistics' within the element <a> but never did
→ Details 탭에서 Search postback 후, 결과 페이지에는 탭 링크가 존재하지 않음
```

```js
// ❌ Search 결과 페이지에서 바로 다른 탭 클릭 시도 — 실패
getMainFrame().find('a').contains('Statistics').click();

// ✅ 메뉴 재진입 → 원래 페이지 로드 확인 → 탭 클릭
cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
cy.wait(2000);
cy.contains('GMEPay').click({ force: true });
cy.wait(3000);

// 원래 페이지 로드 확인
cy.get('iframe#mainFrame', { timeout: 20000 })
    .its('0.contentDocument.body')
    .should('contain.text', 'GME Pay List');

// 이제 탭 클릭 가능
cy.get('iframe#mainFrame').its('0.contentDocument.body')
    .find('a').contains('Statistics').click();
```

**핵심:** Search postback이 전체 페이지를 교체하는 경우, 탭 네비게이션이 소실됩니다. 메뉴 재진입이 가장 안정적인 우회 방법입니다.

**추가 사례 — CashBee (4탭 전부 postback):**
CashBee는 4개 탭(List, Statistics, Recharge List, Refund List) 모두 검색 버튼 클릭 시 ListResult.aspx로 postback되며 탭이 사라집니다. 따라서 매 탭 검색 후 다음 탭으로 이동하려면 항상 메뉴 재진입이 필요합니다. `onclick="CheckFormValidation()"` 방식의 Search 버튼도 postback을 유발할 수 있으므로, 탭 유지 여부는 반드시 브라우저에서 실제 확인해야 합니다.

### 8-33. 검색 후 결과 데이터 검증 누락 주의

검색/필터 동작을 수행한 후에는 **반드시 결과 데이터 존재 여부를 검증**해야 합니다. 타이틀(텍스트) 확인만으로는 "페이지가 열렸다"는 것만 증명할 뿐, "검색이 정상 동작했다"는 증명이 되지 않습니다.

```js
// ❌ 타이틀만 확인 — 데이터가 0건이어도 통과
cy.get('iframe#mainFrame', { timeout: 15000 })
    .its('0.contentDocument.body')
    .should('contain.text', 'CashBee History');

// ✅ 타이틀 확인 + 데이터 행 존재 검증
cy.get('iframe#mainFrame', { timeout: 15000 })
    .its('0.contentDocument.body')
    .should('contain.text', 'CashBee History');

cy.get('iframe#mainFrame')
    .its('0.contentDocument.body')
    .then($body => {
        const rows = $body.find('table.table-striped tr');
        expect(rows.length, '데이터 행 존재').to.be.greaterThan(1);
    });
```

**핵심:** 검색 동작이 있으면 → 결과 데이터 검증은 필수. 데이터가 나오지 않는 경우(권한 등)에는 cy.log로 사유를 명시합니다.

### 8-34. 브레드크럼 텍스트를 contain.text로 검증 시 실패

브레드크럼(breadcrumb)은 각 항목이 별도의 `<a>` 태그로 구분되어 있어, 연속된 문자열로 매칭되지 않습니다. `contain.text`는 DOM 요소 내부의 연속 텍스트를 비교하므로, 브레드크럼 텍스트를 합친 문자열로 검증하면 실패합니다.

```
에러 메시지:
AssertionError: expected '<body>' to contain text 'Inbound Remittance Search Details'
→ 브레드크럼: "Inbound Remittance" > "Search Details" (별도 <a> 태그)
→ 연속 문자열이 아니므로 매칭 실패
```

```js
// ❌ 브레드크럼 텍스트를 합쳐서 검증 — 실패
.should('contain.text', 'Inbound Remittance Search Details');

// ✅ 실제 페이지 헤딩(연속 텍스트)으로 검증
.should('contain.text', 'Search Inbound Transaction Details');
```

**핵심:** `contain.text` 검증 대상은 브레드크럼이 아닌 페이지 헤딩이나 패널 타이틀 등 단일 요소 내의 연속 텍스트를 사용해야 합니다.

### 8-35. jQuery 셀렉터 필드 ID 대소문자 불일치

iframe 내부의 input 필드 ID가 화면에 표시된 이름과 대소문자가 다를 수 있습니다. ASP.NET WebForms에서 생성되는 필드 ID는 camelCase, PascalCase, 또는 혼합 형태가 가능합니다.

```
증상:
jQuery('#apiLog_FROMDATE').val('2026-04-01') → 값이 변경되지 않음
→ 실제 필드 ID: #apiLog_fromDate (소문자 f)
→ jQuery 셀렉터는 대소문자를 구분하므로 불일치 시 무시됨
```

```js
// ❌ 대소문자 불일치 — 값 변경 안 됨
win.jQuery('#apiLog_FROMDATE').val('2026-04-01');

// ✅ 실제 DOM ID 확인 후 정확한 대소문자 사용
win.jQuery('#apiLog_fromDate').val('2026-04-01');
```

**핵심:** iframe 내부 필드 ID는 브라우저 DevTools에서 직접 확인해야 합니다. 화면 라벨이 `FROM DATE`여도 실제 ID는 `fromDate`일 수 있습니다.
