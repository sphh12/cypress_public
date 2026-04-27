# Change Notes

## 이전 세션 (날짜 미상)

### administration.cy.js — Customer Modify 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- Customer Management > Customer Modify: 고객 검색 → Edit Data → Full Name 수정 → 재검색으로 변경값 확인

### administration.cy.js — GME Pay / Point Statement 4탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- Customer Management > GME Pay / Point Statement 테스트를 4탭 전체 검색 시나리오로 확장
- Tab1 Order Management: User Id > sphh 검색 → Filter → 데이터 테이블 확인
- Tab2 Point Statement Result New: URL 직접 구성 → 결과 페이지 데이터 확인 (location.href 이동)
- Tab3 GME Pay Statement Management: URL 직접 구성 → 결과 페이지 데이터 확인 (location.href 이동)
- Tab4 Statistics: Seperate By > Country Wise > All Countries > 날짜 설정 → 검색 → 데이터 확인 (window.open stub)

### administration.cy.js — Inbound Bank List 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- Customer Management > Inbound Bank List: 타이틀 확인 → Email 필터로 sphh 검색 → 테이블 데이터 존재 확인

### administration.cy.js — Customer Statement 5탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- Customer Management > Customer Statement 테스트를 5탭 전체 검색 시나리오로 확장
- Tab1 Outbound Transaction Statement: autocomplete로 고객 검색 → 날짜 설정 → Filter → 데이터 테이블 확인
- Tab2 Account Statement: customerData 직접 설정 → 날짜 설정 → Filter → 데이터 테이블 확인 (alert 억제 적용)
- Tab3 Inbound Transaction Statement: customerData 직접 설정 → 날짜 설정 → Filter → "No wallet statement found" 테스트 확인 (데이터 없음이 정상)
- Tab4 Domestic Transfer Customer Statement: customerData 직접 설정 → 날짜 설정 → Filter → 데이터 테이블 확인 (alert 억제 적용)
- Tab5 Oris Transaction Statement: Oris 전용 autocomplete 검색 (ID: 636027) → 날짜 설정 → Filter → 데이터 테이블 확인 (고객 ID 형식 다름)

### administration.cy.js — Receiver Details 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- Customer Management > Receiver Details: 타이틀 확인 → User Name으로 sphh 검색 → 테이블 데이터/텍스트 확인 → View 버튼 → 모달 팝업 → Customer ID 검증

### administration.cy.js — KJ API Customer ID Verification 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- KJ API > Customer ID Verification: 타이틀 확인 → Email로 sphh 검색 → Verification Details 영역 노출 → Click For Verification → Success 네이티브 팝업 검증

### administration.cy.js — Online Remit 8탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- Online Customers > Online Remit 테스트를 8탭 전체 검색 시나리오로 확장
- Tab1 Approve Pending: Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인
- Tab2 Approved List: Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인
- Tab3 Customer Setup: 화면 진입까지만 확인
- Tab4 Verify Pending: Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인
- Tab5 Audit List: Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인
- Tab6 Inactive Customer List: Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인
- Tab7 Document Re-Request List: Native Country > South Korea 검색 → Filter → 데이터 테이블 확인 (날짜 필터 없음)
- Tab8 Document Upload List: Native Country > South Korea 검색 → Filter → 데이터 테이블 확인 (날짜 필터 없음)

### administration.cy.js — Expired Passport 2탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/administration.cy.js`

**작업 내용:**
- Online Customers > Expired Passport 테스트를 2탭 전체 검색 시나리오로 확장
- Tab1 Passport Upload List: Native Country > cambodia 검색 → Filter → 데이터 테이블 확인
- Tab2 Expired Passport Customer List: Native Country > cambodia 검색 → Filter → 데이터 테이블 확인

### other_services.cy.js — GMEPay 3탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/other_services.cy.js`

**작업 내용:**
- Other Services > GMEPay 테스트를 3탭 전체 검색 시나리오로 확장
- Tab1 List: Country: Nepal, Search By: Name, Search Value: santosh → Filter → 데이터 확인 → Name 컬럼에 santosh 포함 검증 + Control No 저장
- Tab2 Details: Tab1에서 저장한 Control No 앞 10자리로 autocomplete 검색 → aText 클릭으로 aSearch 토글 → 항목 선택 → aValue 설정 확인 → Search → 결과 페이지 Control No 표시 확인
- Tab3 Statistics: GMEPay 메뉴 재진입 → Statistics 탭 클릭 → Country: Nepal, 날짜: 지난달 범위 → Filter → 데이터 확인 → Country 컬럼 Nepal 검증

**핵심 발견:**
- CSS text-transform uppercase 주의 (실제 텍스트: GME Pay List)
- autocomplete: aText(visible)↔aSearch(hidden) 토글 구조
- Search postback 후 탭 사라짐 → 메뉴 재진입 필요

### system_security.cy.js — API Logs 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/system_security.cy.js`

**작업 내용:**
- Core System Logs > API Logs: 타이틀 확인 → GME ControlNo에 80186392632 입력 → Filter → 데이터 테이블 확인 → Provider 'IMENepal' 검증 (드롭다운 없이 직접 입력)

### system_security.cy.js — TxnErrorLogs 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/system_security.cy.js`

**작업 내용:**
- Core System Logs > TxnErrorLogs
- Tab1 Customer List: 타이틀 확인 → Search By > email 선택 → sphh 입력 → Filter → 데이터 테이블 확인 → Error Message 컬럼 텍스트 존재 검증 (input[value="Filter"], tbody 첫 행이 TH 헤더)
- Tab2 ReturnRate: 진입 시 에러 발생으로 스킵 ("Error occurred in application. Please try after a while", Error Log Id:559038)

### system_security.cy.js — Customer Logs + KFTC Logs 연계 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/system_security.cy.js`

**작업 내용:**
- Mobile App Logs > KFTC Logs (2탭) + Customer Logs 연계 테스트
- KFTC Tab1 (KFTC Transaction Logs): Search By: Country Group, Value: nepal, 오늘 날짜 → Filter → 데이터 확인 → ViewRemark.aspx fetch로 마스킹 안 된 Username 추출 (grid ID: FaceVerificationlist, fetch+DOMParser 파싱)
- KFTC Tab2 (KFTC Logs): Tab1에서 추출한 Username으로 검색 → Filter → 데이터 확인 → Provider 'KFTC' 검증

**핵심 발견:**
- 배치 클리어 대응: KFTC에서 동적 이메일 추출, per page Nav() 호출, Phase 분리 구조
- Tab2→Tab1 순서로 실행 (배치 클리어 대응)

### system_security.cy.js — Customer Logs 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/system_security.cy.js`

**작업 내용:**
- Mobile App Logs > Customer Logs: Phase1에서 KFTC Transaction Logs 검색으로 이메일 추출 → Phase2에서 Customer Logs 진입 → Type: Outbound+General, Method: Overseas, SearchBy: User Id, Value: 추출된 이메일, Date: 오늘/00:00~23:00 → Filter → 데이터 확인 → Created By 검증

### system_security.cy.js — Error Logs 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/system_security.cy.js`

**작업 내용:**
- Mobile App Logs > Error Logs: 타이틀 확인 → User Name: philiph → Filter → 데이터 확인 → Page 컬럼 URL 텍스트 존재 검증 (jQuery .val() + Nav() 직접 호출, contains 정규식 매칭)

---

## 2026-04-17

### other_services.cy.js — EasyGo 2탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/other_services.cy.js`

**작업 내용:**
- Transportation Card > EasyGo 테스트를 기존 validatePage만 수행에서 2탭 전체 검색 시나리오로 확장
- Tab1 Daily Usage: Search By: Transportation Card No., SearchValue: 1041049006188087, Search Month: 2026-01 → Search → 데이터 확인 → Card No 컬럼 검증
- Tab2 Payment Statement: 탭 전환 (Statement.aspx) → 동일 검색 조건 → Search → 데이터 확인 → Date Time 값 존재 확인

**핵심 발견:**
- CSS text-transform uppercase 적용 (실제 HTML: 'Daily Usage', 화면 표시: 'DAILY USAGE')
- 동일 폼 ID가 양쪽 탭에서 공유됨

### other_services.cy.js — CashBee 4탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/other_services.cy.js`

**작업 내용:**
- Transportation Card > CashBee 테스트를 기존 validatePage만 수행에서 4탭 전체 검색 시나리오로 확장
- Tab1 List: CardNo 검색 → Filters → postback 결과 + 데이터 테이블 검증
- Tab2 Statistics: Country 선택 + 날짜 설정 → Filters → 타이틀만 확인 (데이터 노출안됨 ⇒ 권한 문제 확인)
- Tab3 Recharge List: 날짜 설정 → Search → postback 결과 + 데이터 테이블 검증
- Tab4 Refund List: 날짜 설정 → Search → postback 결과 + 데이터 테이블 검증

**핵심 발견:**
- CashBee 4탭 모두 검색 시 ListResult.aspx로 postback → 탭 소실 → 매번 메뉴 재진입 필요
- `onclick="CheckFormValidation()"` 방식의 Search 버튼도 postback 유발 (탭 유지 가정 불가)
- Tab4 Refund List 패널 타이틀이 Tab3 Recharge List와 동일 ('Recharge List')
- Tab1/Tab2는 #endDate, Tab3/Tab4는 #toDate 사용 (날짜 입력 ID 불일치)

### Cypress-Troubleshooting-Guide.md 업데이트

- 8-30 신규 패턴 추가: CSS text-transform uppercase로 인한 텍스트 불일치 주의
- 8-31 신규 패턴 추가: autocomplete aText↔aSearch 토글 패턴
- 8-32 신규 패턴 추가: Search postback 후 탭 네비게이션 소실 대응 + CashBee 사례 추가 (4탭 전부 postback)
- 8-33 신규 패턴 추가: 검색 후 결과 데이터 검증 누락 주의

### Test-Status-Board.md 업데이트

- EasyGo 2탭 상세 시나리오 및 비고 기록, 상태 Done 반영
- CashBee 4탭 상세 시나리오 및 비고 기록, 상태 Done 반영
- Tab2 Statistics 비고에 "검색 결과 데이터가 노출안됨 ⇒ 권한 문제 확인" 명시

---

## 2026-04-20

### other_services.cy.js — Manual Reprocess 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/other_services.cy.js`

**작업 내용:**
- Other Services > Manual Reprocess: 기존 validatePage만 수행에서 전체 검색 시나리오로 확장
- Partner/Country Select/Select (전체 검색) → "No Hold transaction found" 또는 데이터 테이블 확인 (분기 처리)
- 현재 Hold 트랜잭션 0건 확인 → 정상 응답 검증

### inbound.cy.js — Search Transaction 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/inbound.cy.js`

**작업 내용:**
- Inbound > Search Transaction: 기존 validatePage만 수행에서 전체 검색 시나리오로 확장
- 타이틀 확인 → Tran No: 10000 입력 → Search → Details.aspx로 페이지 전환 → 'Search Inbound Transaction Details' 타이틀 + 데이터 테이블 확인

**핵심 발견:**
- 브레드크럼 텍스트는 별도 `<a>` 태그에 분리되어 contain.text로 연속 문자열 매칭 불가 (패턴 8-34)

### inbound.cy.js — Post Transaction 4탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/inbound.cy.js`

**작업 내용:**
- Inbound > Post Transaction: 기존 validatePage만 수행에서 4탭 전체 시나리오로 확장
- Tab1 Process Transaction List: 데이터 없음이 정상 (처리 대기 트랜잭션 없음), 0건/N건 분기 로그
- Tab2 Hold Transaction List: 데이터 확인 → 첫 번째 Tran ID 필터 검색 → 일치 검증 → GMEPin 링크 클릭 → Tab4 상세보기 'Post Transaction Details' 진입 확인
- Tab3 Process Hold Transaction List: Tab2와 동일 시나리오 (grid ID: grid_inbound_ProcHoldTxn_body)
- Tab4 Post Transaction Details: GMEPin 링크 클릭 → Manage.aspx?controlNo=xxx → 상세보기 확인

**핵심 발견:**
- Filter 버튼에 id 없음 → `input[value="Filter"]`로 접근
- Tab 이동: iframe src 직접 변경 방식 사용
- GMEPin 컬럼(col 1)에 `<a>` 링크 → Manage.aspx?controlNo=xxx로 상세보기 진입

### Test-Status-Board.md 업데이트

- Post Transaction 4탭 상세 시나리오 및 비고 기록, 상태 Done 반영
- Manual Reprocess 상세 시나리오 및 비고 기록, 상태 Done 반영

### inbound.cy.js — Post Transaction Tab1 Filter 검색 추가

**변경 파일:** `cypress/e2e/test/GME/view/inbound.cy.js`

**작업 내용:**
- Tab1 Process Transaction List: Filter 버튼 클릭 검색 액션 추가
- 미지급 트랜잭션 없으면 데이터 0건 정상 통과

### inbound.cy.js — Route Inbound Partner 3탭 테스트 구현

**변경 파일:** `cypress/e2e/test/GME/view/inbound.cy.js`

**작업 내용:**
- Receiver Initiated Inbound > Route Inbound Partner: 기존 validatePage만 수행에서 3탭 전체 시나리오로 확장
- Tab1 Inbound API Routing: 초기 데이터 확인 → Partner 필터 9PAY 선택 → Filter → Partner 컬럼 '9PAY' 일치 확인
- Tab2 ADD Inbound API Partner: 등록 탭이라 화면 노출만 확인 ('Setup Inbound API Partners')
- Tab3 Route Internet Banking: 초기 데이터 확인 → Partner 필터 Sendmn 선택 → Filter → Partner 컬럼 'Sendmn' 일치 확인

**핵심 발견:**
- 실제 URL: `/InboundRemit/NewTypeInbound/APIRouting/PartnerList.aspx` (메뉴 href로 확인)
- Tab1/Tab3의 grid ID가 동일 (`grid_inbound_apiRouting_body`) — 필터 select ID도 동일
- Partner 드롭다운은 select 태그 → `.select(value)` 사용 가능

### Test-Status-Board.md 업데이트

- Route Inbound Partner 3탭 상세 시나리오 및 비고 기록, 상태 Done 반영

### system_security.cy.js — API Logs From Date 수정

**변경 파일:** `cypress/e2e/test/GME/view/system_security.cy.js`

**작업 내용:**
- API Logs 테스트에서 From Date를 2026-04-01로 변경하는 코드 추가
- 기본 From Date가 오늘 날짜라 과거 데이터 미조회 → jQuery `.val()`로 날짜 변경

**핵심 발견:**
- 필드 ID 대소문자 주의: `#apiLog_fromDate` (소문자 f) — `#apiLog_FROMDATE`는 작동 안 함 (패턴 8-35)

---

## 2026-04-24

### Shell 스크립트 — record 모드 제거

**변경 파일:** `shell/run-test.sh`, `shell/run-sample.sh`, `shell/run-customer.sh`

**작업 내용:**
- `--record --key $CYPRESS_RECORD_KEY` 옵션 제거 (로컬 실행 결과만 저장)
- 기존 record 명령어를 `# [record 모드]` 주석으로 보존

### Shell 스크립트 — SPEC_FILE 패턴 수정

**변경 파일:** `shell/run-customer.sh`

**작업 내용:**
- `cypress/e2e/test/GME/view/**/*.cy.js` → `cypress/e2e/test/GME/view/*.cy.js`로 변경
- bak 하위 폴더 실행 방지 (** glob이 bak/ 포함하는 문제 해결)

### package.json — yarn scripts 추가

**변경 파일:** `package.json`

**작업 내용:**
- `yarn view` → `docker compose --profile view up cypress-view`
- `yarn dev` → `docker compose --profile dev up cypress-dev`
- `yarn test` → `docker compose up cypress`

### Cypress v13.5.0 → v15.14.1 업그레이드

**변경 파일:** `package.json`, `package-lock.json` (또는 `yarn.lock`)

**작업 내용:**
- Cypress v13.5.0 → v15.14.1로 메이저 업그레이드
- Docker 이미지 (node-24.11.1, Chrome 142, glibc 2.36) 호환 확인 완료
- breaking change 영향 없음 확인 (cy.exec(), cy.origin(), SelectorPlayground 미사용)
- Mochawesome 리포터 호환 확인 완료

### Test-Status-Board.md 업데이트

- API Logs 시나리오에 From Date 변경 내용 추가, 비고에 날짜 변경 필요 사유 기록
