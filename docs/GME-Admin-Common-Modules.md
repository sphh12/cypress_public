# GME Admin 공통 모듈화 가능 기능 리스트

> 71개 View 테스트 페이지를 분석하여 도출한 공통 UI 패턴 및 모듈화 대상 목록
> 분석일: 2026-04-03

---

## 1. 분석 요약

총 **25개 이상의 대표 페이지**를 실제 라이브 환경에서 탐색하여 반복적으로 등장하는 UI 패턴을 식별했습니다.

### 분석 대상 카테고리
| 카테고리 | 페이지 수 | 분석 완료 |
|----------|-----------|-----------|
| Administration | 17개 | ✅ |
| Inbound | 9개 | ✅ |
| Remittance | 30개 | ✅ |
| Other Services | 10개 | ✅ |
| System Security | 5개 | ✅ |

---

## 2. 공통 모듈화 대상 기능 (우선순위순)

### 🔴 Priority 1 — 거의 모든 페이지에 존재

#### 2.1 로그인 (Login)
- **출현 빈도**: 100% (모든 테스트의 beforeEach)
- **현재 상태**: 각 테스트 파일의 beforeEach에 중복 구현
- **UI 요소**:
  - `[name="txtUsername"]` — 사용자명 입력
  - `[name="txtPwd"]` — 비밀번호 입력
  - `[name="txtCompcode"]` — 회사코드 입력
  - `[name="btnLogin"]` — 로그인 버튼
  - `#chatBubbleImageId` — 로그인 성공 확인 (visible)
  - `#gptcb-overlay` — 오버레이 사라짐 대기
- **모듈화 방향**: `login(env)` 함수로 환경별(live/stg) 로그인 처리

---

#### 2.2 메뉴 네비게이션 (Menu Navigation)
- **출현 빈도**: 100% (모든 테스트)
- **현재 상태**: `cy.get('#navbar-main > .nav > :nth-child(N)').click()` + `cy.contains().trigger('mouseover')` 반복
- **UI 요소**:
  - `#navbar-main > .nav > :nth-child(N) > .dropdown-toggle` — 최상위 메뉴
  - 서브메뉴: `cy.contains('메뉴명').trigger('mouseover')` — 2단계 hover
  - 페이지 링크: `cy.contains('페이지명').click()` — 3단계 클릭
- **모듈화 방향**: `navigateTo(topMenu, subMenu, pageName)` 함수
  - 예: `navigateTo('Administration', 'Customer Management', 'Customer Modify')`
  - 또는 URL 직접 접근 방식: `navigateByUrl('/AgentPanel/OnlineAgent/CustomerControls/ManageList.aspx')`

---

#### 2.3 페이지 검증 (Page Validation) — 이미 구현됨
- **출현 빈도**: 100%
- **현재 상태**: `iframe.js`의 `validatePage()` 함수로 이미 모듈화
- **검증 항목**: iframe 로드, 서버 에러 체크, 레이아웃 요소 확인, 로딩 스피너 대기
- **추가 개선 방향**: 페이지별 타이틀 검증, breadcrumb 경로 검증 추가 가능

---

### 🟠 Priority 2 — 대부분의 페이지에 존재 (60% 이상)

#### 2.4 검색 필터 (Search Filter / Filter)
- **출현 빈도**: ~70% (50+ 페이지)
- **패턴 유형**:

  **Type A — Filter Results 패턴** (가장 흔함)
  - `Filter Results` 드롭다운 토글 (접기/펼치기)
  - `input[value="Filter"]` — 필터(검색) 실행 버튼 (btn-primary)
  - `input[value="Clear Filters"]` — 필터 초기화 버튼 (btn-primary)
  - 해당 페이지: Customer Modify, GME Pay/Point Statement, Inbound Post Transaction, API Logs 등

  **Type B — Search 패턴**
  - `Search By` 드롭다운 (select) + `Search Value` 텍스트 입력
  - `input[value="Search"]` 또는 `input[value="Search Customer"]` 버튼
  - 해당 페이지: Modify Customer Bank, AML Report (하단), Inbound Search Transaction 등

  **Type C — Show Report 패턴**
  - 날짜 범위 + 기타 필터 조건
  - `input[value="Show Report"]` 버튼
  - 해당 페이지: Compliance Release Report, Branch KPI Reports 등

- **모듈화 방향**:
  ```
  filterAndSearch()     — Type A: Filter 버튼 클릭
  clearFilters()        — Type A: Clear Filters 버튼 클릭
  searchByKeyword()     — Type B: Search By/Value 입력 후 검색
  showReport()          — Type C: Show Report 클릭
  ```

---

#### 2.5 날짜 선택기 (Date Picker)
- **출현 빈도**: ~60% (40+ 페이지)
- **UI 요소**:
  - `.hasDatepicker` — jQuery UI Datepicker가 적용된 input
  - `.ui-datepicker-trigger` — 캘린더 아이콘 버튼 (...)
  - 일반적으로 **From/To 쌍**으로 존재
  - 날짜 형식: `YYYY-MM-DD` (오늘 날짜 기본 설정되는 경우 많음)
- **주요 필드 패턴**:
  - `{prefix}_fromDate` / `{prefix}_toDate` (예: `apiLog_fromDate`)
  - `Created Date From` / `Created Date To`
  - `Form Date` / `To Date`
- **모듈화 방향**:
  ```
  setDateRange(fromDate, toDate)       — From/To 날짜 범위 설정
  setDateField(selector, date)         — 개별 날짜 필드 설정
  clearDateRange()                     — 날짜 범위 초기화
  ```

---

#### 2.6 데이터 테이블 / 그리드 (Data Table)
- **출현 빈도**: ~65% (45+ 페이지)
- **테이블 유형**:

  **Type A — 커스텀 그리드 (가장 흔함)**
  - `table.table` 기반
  - 커스텀 페이지네이션: `{prefix}_pageSize` (select) + `{prefix}_ddl_pageNumber` (select)
  - 페이지 크기 옵션: 보통 6개 (10, 25, 50, 100, 250, 500)
  - 네비게이션 화살표: ← → 버튼
  - 해당 페이지: Customer Modify, GME Pay/Point, API Logs, Post Transaction 등

  **Type B — jqGrid**
  - `.ui-jqgrid` 기반
  - 자체 페이저: `.ui-pg-table`
  - 해당 페이지: Approve OFAC, Compliance Limit Setup, Voice Phishing 등

- **모듈화 방향**:
  ```
  getTableRows()                 — 테이블 행 데이터 조회 (읽기)
  getTableRowCount()             — 결과 건수 확인
  setPageSize(size)              — 페이지 크기 변경 (10, 25, 50...)
  goToPage(pageNum)              — 특정 페이지로 이동
  goToNextPage() / goToPrevPage()— 다음/이전 페이지
  waitForTableLoad()             — 테이블 로딩 완료 대기
  verifyTableNotEmpty()          — 결과 존재 확인
  verifyTableEmpty()             — 빈 결과 확인
  ```

---

### 🟡 Priority 3 — 다수 페이지에 존재 (30~60%)

#### 2.7 탭 네비게이션 (Tab Navigation)
- **출현 빈도**: ~40% (28+ 페이지)
- **UI 요소**: `.nav-tabs li a` — Bootstrap 탭
- **탭이 있는 대표 페이지**:
  - Customer Modify: `Customer List`, `Customer Operation`, `Upload Voice Phising Customer`
  - GME Pay/Point: `Order Management`, `Point Statement Result New`, `GME Pay Statement Management`, `Statistics`
  - Post Transaction: `Process Transaction List`, `Hold Transaction List`, `Process Hold Transaction List`, `Post Transaction Details`
  - AML Report: `Search By Customer`, `Top Customer`, `Customer Report`, `MIS Report`, `OFAC & Compliance`, `Customer Report Daily`
- **모듈화 방향**:
  ```
  clickTab(tabName)              — 탭 이름으로 탭 전환
  verifyActiveTab(tabName)       — 현재 활성 탭 확인
  getTabList()                   — 탭 목록 조회
  ```

---

#### 2.8 드롭다운 선택 (Dropdown Select)
- **출현 빈도**: ~55% (38+ 페이지)
- **주요 유형**:
  - `Search By` / `searchBy` — 검색 조건 선택
  - `{prefix}_searchCriteria` — 검색 기준
  - `Country` / `Agent` / `Receiving Mode` — 필터 조건
  - `{prefix}_pageSize` — 페이지 크기
  - `Report Type` — 리포트 유형
  - `Hold Reason` — 사유 선택
- **모듈화 방향**:
  ```
  selectOption(selector, value)    — 드롭다운에서 옵션 선택
  selectByText(selector, text)     — 표시 텍스트로 옵션 선택
  verifySelectedOption(selector, expected) — 선택된 값 확인
  ```

---

#### 2.9 패널 접기/펼치기 (Panel Collapse)
- **출현 빈도**: ~50% (35+ 페이지)
- **UI 요소**:
  - `.panel.panel-default` — 패널 컨테이너
  - `.panel-heading` — 패널 헤더 (클릭으로 접기/펼치기)
  - 접기 아이콘: ˅ 표시
- **모듈화 방향**:
  ```
  togglePanel(panelTitle)          — 패널 접기/펼치기
  verifyPanelExpanded(panelTitle)  — 패널 펼쳐짐 확인
  verifyPanelCollapsed(panelTitle) — 패널 접힘 확인
  ```

---

### 🟢 Priority 4 — 일부 페이지에 존재 (10~30%)

#### 2.10 엑셀 내보내기 (Export to Excel)
- **출현 빈도**: ~15% (10+ 페이지)
- **UI 요소**:
  - `[value="Export To Excel"]` 또는 `[value="CSV"]` 버튼
  - 상단 헤더의 `Export to Excel` 링크
  - 아이콘 버튼 (xlsx/pdf 아이콘)
- **모듈화 방향**:
  ```
  exportToExcel()                  — 엑셀 내보내기 실행
  verifyFileDownloaded(filename)   — 파일 다운로드 확인
  ```

---

#### 2.11 체크박스 선택 (Checkbox)
- **출현 빈도**: ~20% (14+ 페이지)
- **주요 용도**:
  - `Include System Release` — 옵션 토글
  - 테이블 행 선택 (전체선택/개별선택)
  - 필터 조건 활성화
- **모듈화 방향**:
  ```
  checkBox(selector)               — 체크박스 선택
  uncheckBox(selector)             — 체크박스 해제
  toggleCheckbox(selector)         — 체크박스 토글
  verifyChecked(selector)          — 선택 상태 확인
  ```

---

#### 2.12 Breadcrumb 경로 확인
- **출현 빈도**: ~80% (56+ 페이지)
- **UI 요소**: `🏠 / Category / SubCategory / PageName`
- **모듈화 방향**:
  ```
  verifyBreadcrumb(expected)       — 현재 경로 확인
  ```

---

#### 2.13 Alert/Confirm 다이얼로그 처리
- **출현 빈도**: 액션 실행 시 (Approve, Reject, Delete 등)
- **현재 상태**: `iframe.js`의 `stubIframeDialogs()` 함수로 일부 구현
- **모듈화 방향**:
  ```
  stubDialogs(confirmReturn)       — Alert/Confirm 스텁 설정 (이미 구현)
  verifyAlertMessage(expected)     — Alert 메시지 확인
  ```

---

## 3. 페이지 유형별 분류

분석 결과, GME Admin 페이지는 크게 **4가지 레이아웃 유형**으로 분류됩니다:

### Type A: 리스트 조회 페이지 (List Page) — 약 50%
```
┌──────────────────────────────────────┐
│ [Panel Title]                    ˅   │
│ ┌──────────────────────────────────┐ │
│ │ Filter Results ▾                 │ │
│ │ Search By: [Select ▾]           │ │
│ │ Search Value: [___________]     │ │
│ │ Date From: [____] Date To: [___]│ │
│ │ [Filter] [Clear Filters]        │ │
│ └──────────────────────────────────┘ │
│ Result: N records  [10▾] per page    │
│ ┌──────────────────────────────────┐ │
│ │ Col1 │ Col2 │ Col3 │ Col4 │ ... │ │
│ │──────│──────│──────│──────│─────│ │
│ │ data │ data │ data │ data │ ... │ │
│ └──────────────────────────────────┘ │
│          Page 1 of N    ← →         │
└──────────────────────────────────────┘
```
**해당 페이지**: Customer Modify, Inbound Bank List, Post Transaction, API Logs 등
**필요 모듈**: Login, Navigate, FilterResults, Filter/ClearFilters, DateRange, Table, Pagination

### Type B: 리포트 조회 페이지 (Report Page) — 약 25%
```
┌──────────────────────────────────────┐
│ [Report Title]                   ˅   │
│ ┌──────────────────────────────────┐ │
│ │ Country: [All ▾]  Agent: [All ▾]│ │
│ │ Date Type: [▾]                  │ │
│ │ From: [2026-04-03]              │ │
│ │ To:   [2026-04-03]             │ │
│ │ Report Type: [Detail ▾]        │ │
│ │ [Show Report] or [Search]       │ │
│ └──────────────────────────────────┘ │
│ ┌──Tab1──Tab2──Tab3───────────────┐ │
│ │ (리포트 결과 영역)                │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```
**해당 페이지**: AML Report, Compliance Release Report, Branch KPI, Settlement Report 등
**필요 모듈**: Login, Navigate, DateRange, SelectOption, ShowReport, Tab

### Type C: 단건 조회/액션 페이지 (Single Action Page) — 약 15%
```
┌──────────────────────────────────────┐
│ [Page Title]                     ˅   │
│ ┌──────────────────────────────────┐ │
│ │ Search By: [Select ▾]           │ │
│ │ Search Value: [___________]     │ │
│ │ [Search Customer]               │ │
│ └──────────────────────────────────┘ │
│ (검색 결과 → 상세 정보 표시)          │
└──────────────────────────────────────┘
```
**해당 페이지**: Modify Customer Bank, Password Reset, Remove Duplicate Customer 등
**필요 모듈**: Login, Navigate, SearchByKeyword

### Type D: 탭 중심 페이지 (Tab-Based Page) — 약 10%
```
┌──────────────────────────────────────┐
│ ┌──Tab1──Tab2──Tab3──Tab4─────────┐ │
│ │ [Tab별 고유 콘텐츠]               │ │
│ │ (각 탭 내에 Type A/B/C 구조)      │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```
**해당 페이지**: GME Pay/Point Statement, Face Verification, Post Transaction 등
**필요 모듈**: Login, Navigate, Tab + 탭 내부 구조에 따라 Type A/B/C 모듈 조합

---

## 4. 권장 모듈 파일 구조

```
cypress/e2e/module/
├── iframe.js              ← 기존 (유지)
│   ├── getMainFrame()
│   ├── validatePage()
│   └── stubIframeDialogs()
│
├── login.module.js        ← 기존 → 리팩토링
│   └── login(env)         — 환경별 로그인
│
├── navigate.module.js     ← 신규
│   ├── navigateTo(top, sub, page)
│   └── navigateByUrl(url)
│
├── search.module.js       ← 신규
│   ├── filterAndSearch()         — Filter 버튼 클릭
│   ├── clearFilters()            — Clear Filters 버튼 클릭
│   ├── searchByKeyword(by, value)— Search By + Value 입력 후 검색
│   └── showReport()              — Show Report 버튼 클릭
│
├── datepicker.module.js   ← 신규
│   ├── setDateRange(from, to)
│   ├── setDateField(selector, date)
│   └── clearDateRange()
│
├── table.module.js        ← 신규
│   ├── getTableRows()
│   ├── getTableRowCount()
│   ├── verifyTableNotEmpty()
│   ├── verifyTableEmpty()
│   ├── setPageSize(size)
│   ├── goToNextPage()
│   ├── goToPrevPage()
│   └── waitForTableLoad()
│
├── tab.module.js          ← 신규
│   ├── clickTab(tabName)
│   ├── verifyActiveTab(tabName)
│   └── getTabList()
│
├── dropdown.module.js     ← 신규
│   ├── selectOption(selector, value)
│   ├── selectByText(selector, text)
│   └── verifySelectedOption(selector, expected)
│
├── panel.module.js        ← 신규
│   ├── togglePanel(title)
│   ├── verifyPanelExpanded(title)
│   └── verifyPanelCollapsed(title)
│
└── export.module.js       ← 신규
    ├── exportToExcel()
    └── verifyFileDownloaded(filename)
```

---

## 5. 구현 우선순위 로드맵

| 순서 | 모듈 | 이유 |
|------|------|------|
| 1 | `login.module.js` 리팩토링 | 모든 테스트에서 사용, beforeEach 중복 제거 |
| 2 | `navigate.module.js` | 메뉴 네비게이션 중복 코드가 가장 많음 |
| 3 | `search.module.js` | Filter/ClearFilters/Search가 70%+ 페이지에 존재 |
| 4 | `datepicker.module.js` | 60%+ 페이지에 날짜 범위 필터 존재 |
| 5 | `table.module.js` | 65%+ 페이지에 데이터 테이블 존재 |
| 6 | `tab.module.js` | 40%+ 페이지에 탭 존재 |
| 7 | `dropdown.module.js` | 55%+ 페이지에 드롭다운 존재 |
| 8 | `panel.module.js` | 50%+ 페이지에 패널 접기/펼치기 존재 |
| 9 | `export.module.js` | 15% 페이지에 엑셀 내보내기 존재 |

---

## 6. 셀렉터 참고 정보

### 공통 셀렉터 (iframe 내부)
| 요소 | 셀렉터 |
|------|--------|
| Filter 버튼 | `input[value="Filter"]` |
| Clear Filters 버튼 | `input[value="Clear Filters"]` |
| Search 버튼 | `input[value="Search"]`, `input[value="Search Customer"]` |
| Show Report 버튼 | `input[value="Show Report"]` |
| Filter Results 토글 | `a.btn.btn-sm.btn-default` (텍스트: "Filter Results") |
| 탭 | `.nav-tabs li a` |
| 활성 탭 | `.nav-tabs li.active a` |
| 패널 헤더 | `.panel-heading` |
| 패널 접기 아이콘 | `.panel-heading` 내 collapse 토글 |
| Datepicker | `.hasDatepicker` |
| Datepicker 아이콘 | `.ui-datepicker-trigger` |
| 데이터 테이블 | `table.table` |
| jqGrid | `.ui-jqgrid` |
| 페이지 사이즈 | `select[id*="pageSize"]` |
| 페이지 번호 | `select[id*="pageNumber"]` |
| Breadcrumb | `.breadcrumb` |
| Export to Excel | `input[value="Export To Excel"]` |

### 페이지별 prefix 패턴
각 페이지의 요소들은 고유 prefix를 가집니다:
- API Logs: `apiLog_`
- GME Pay/Point: `grdPointMgmt_`
- Post Transaction: `grid_inbound_PostTxn_`
- 일반 패턴: `{gridName}_pageSize`, `{gridName}_ddl_pageNumber`
