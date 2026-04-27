# View 테스트 페이지 목록

> `cypress/e2e/test/GME/view/` 폴더의 페이지 진입 테스트 현황
> 총 **71개** 페이지

---

## administration.cy.js (17개)

| # | 메뉴 | 페이지 | 탭 | 테스트 시나리오 | 비고 | 상태 |
|---|------|--------|----|----------------|------|------|
| 1 | Customer Management | Customer Modify | | 고객 검색 → Edit Data → Full Name 수정 → 재검색으로 변경값 확인 | | Done |
| 2 | Customer Management | Modify Customer Bank | | 페이지 진입 + validatePage만 수행 | | |
| 3 | Customer Management | Remove Duplicate Customer | | 페이지 진입 + validatePage만 수행 | | |
| 4 | Customer Management | GME Pay / Point Statement | Order Management | User Id > sphh 검색 → Filter → 데이터 테이블 확인 | | Done |
| | | | Point Statement Result New | URL 직접 구성 → 결과 페이지 데이터 확인 | location.href 이동 | Done |
| | | | GME Pay Statement Management | URL 직접 구성 → 결과 페이지 데이터 확인 | location.href 이동 | Done |
| | | | Statistics | Seperate By > Country Wise > All Countries > 날짜 설정 → 검색 → 데이터 확인 | window.open stub | Done |
| 5 | Customer Management | Approve/Reject Face Verification | | 페이지 진입 + validatePage만 수행 | | |
| 6 | Customer Management | Reward Point Management | | 페이지 진입 + validatePage만 수행 | 검색 데이터 모름 | |
| 7 | Customer Management | Password Reset | | 페이지 진입 + validatePage만 수행 | sms / email | |
| 8 | Customer Management | KFTC Registration/Renewal | | 페이지 진입 + validatePage만 수행 | | |
| 9 | Customer Management | Inbound Bank List | | 타이틀 확인 → Email 필터로 sphh 검색 → 테이블 데이터 존재 확인 | | Done |
| 10 | Customer Management | Customer Statement | Outbound Transaction Statement | autocomplete로 고객 검색 → 날짜 설정 → Filter → 데이터 테이블 확인 | | Done |
| | | | Account Statement | customerData 직접 설정 → 날짜 설정 → Filter → 데이터 테이블 확인 | alert 억제 적용 | Done |
| | | | Inbound Transaction Statement | customerData 직접 설정 → 날짜 설정 → Filter → "No wallet statement found" 테스트 확인 | 데이터 없음이 정상 | Done |
| | | | Domestic Transfer Customer Statement | customerData 직접 설정 → 날짜 설정 → Filter → 데이터 테이블 확인 | alert 억제 적용 | Done |
| | | | Oris Transaction Statement | Oris 전용 autocomplete 검색 (ID: 636027) → 날짜 설정 → Filter → 데이터 테이블 확인 | 고객 ID 형식 다름 | Done |
| 11 | Customer Management | Receiver Details | | 타이틀 확인 → User Name으로 sphh 검색 → 테이블 데이터/텍스트 확인 → View 버튼 → 모달 팝업 → Customer ID 검증 | | Done |
| 12 | Customer Management | Modify Customer Bank | | 페이지 진입 + validatePage만 수행 | | |
| 13 | Customer Management | Remove Duplicate Customer | | 페이지 진입 + validatePage만 수행 | 삭제 데이터 필요 | |
| 14 | KJ API | Customer ID Verification | | 타이틀 확인 → Email로 sphh 검색 → Verification Details 영역 노출 → Click For Verification → Success 네이티브 팝업 검증 | | Done |
| 15 | Online Customers | Easy Remit | | 페이지 진입 + validatePage만 수행 | | |
| 16 | Online Customers | Online Remit | Approve Pending | Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인 | | Done |
| | | | Approved List | Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인 | | Done |
| | | | Customer Setup | 화면 진입까지만 확인 | | Done |
| | | | Verify Pending | Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인 | | Done |
| | | | Audit List | Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인 | | Done |
| | | | Inactive Customer List | Native Country > South Korea 검색 → 날짜 설정 → Filter → 데이터 테이블 확인 | | Done |
| | | | Document Re-Request List | Native Country > South Korea 검색 → Filter → 데이터 테이블 확인 | 날짜 필터 없음 | Done |
| | | | Document Upload List | Native Country > South Korea 검색 → Filter → 데이터 테이블 확인 | 날짜 필터 없음 | Done |
| 17 | Online Customers | Expired Passport | Passport Upload List | Native Country > cambodia 검색 → Filter → 데이터 테이블 확인 | | Done |
| | | | Expired Passport Customer List | Native Country > cambodia 검색 → Filter → 데이터 테이블 확인 | | Done |

> 요약: 전체 17개 중 **12개 구현 완료 (Done)**, 5개 미구현 (페이지 진입만 수행)

---

## inbound.cy.js (9개)

| # | 메뉴 | 페이지 | 테스트 시나리오 | 비고 | 상태 |
|---|------|--------|----------------|------|------|
| 1 | Inbound | Post Transaction | Tab1 Process Transaction List: Filter 클릭 → 데이터 0건 정상 (미지급 트랜잭션 없음), Tab2 Hold Transaction List: 데이터 확인 → 첫 번째 Tran ID 필터 검색 → 일치 검증 → GMEPin 클릭 → Tab4 상세보기 진입, Tab3 Process Hold Transaction List: Tab2와 동일 시나리오, Tab4 Post Transaction Details: GMEPin 링크로 진입하는 상세보기 확인 | Tab1 미지급 트랜잭션 없으면 데이터 0건 정상, Tab2/3 iframe src 직접 변경으로 탭 이동 | Done |
| 2 | Inbound | Search Transaction | 타이틀 확인 → Tran No: 10000 입력 → Search → Details.aspx 이동 → 'Inbound Remittance Search Details' + 데이터 테이블 확인 | Search 후 Details.aspx로 페이지 전환 | Done |
| 3 | Receiver Initiated Inbound | Route Inbound Partner | Tab1 Inbound API Routing: 초기 데이터 확인 → Partner 필터 9PAY 선택 → Filter → Partner 컬럼 '9PAY' 일치 확인, Tab2 ADD Inbound API Partner: 등록 화면 노출만 확인, Tab3 Route Internet Banking: 초기 데이터 확인 → Partner 필터 Sendmn 선택 → Filter → Partner 컬럼 'Sendmn' 일치 확인 | Tab1/Tab3 grid ID 동일 (grid_inbound_apiRouting_body), Tab2는 데이터 등록 탭이라 화면 노출만 확인 | Done |
| 4 | Receiver Initiated Inbound | Customer Guide | 페이지 진입 + validatePage만 수행 | | |
| 5 | Receiver Initiated Inbound | Sender Detail | 페이지 진입 + validatePage만 수행 | | |
| 6 | Receiver Initiated Inbound | Sender Page Setup | 페이지 진입 + validatePage만 수행 | | |
| 7 | Receiver Initiated Inbound | Master Report | 페이지 진입 + validatePage만 수행 | | |
| 8 | Receiver Initiated Inbound | Receiver Initiated Transaction Report | 페이지 진입 + validatePage만 수행 | | |
| 9 | Receiver Initiated Inbound | Search Transaction | 페이지 진입 + validatePage만 수행 | | |

---

## other_services.cy.js (10개)

| # | 메뉴 | 페이지 | 탭 | 테스트 시나리오 | 비고 | 상태 |
|---|------|--------|----|----------------|------|------|
| 1 | Coupon | Coupon Issue | | 페이지 진입 + validatePage만 수행 | | |
| 2 | Coupon | Coupon Report | | 페이지 진입 + validatePage만 수행 | | |
| 3 | Coupon | Coupon Link Generator | | 페이지 진입 + validatePage만 수행 | | |
| 4 | Other Services | Penny Test Verification Check | | 페이지 진입 + validatePage만 수행 | | |
| 5 | Other Services | GMEPay | List | 타이틀 확인 → Country: Nepal, Search By: Name, Search Value: santosh → Filter → 데이터 확인 → Name 컬럼에 santosh 포함 검증 + Control No 저장 | CSS text-transform uppercase 주의 (실제 텍스트: GME Pay List) | Done |
| | | | Details | Tab1에서 저장한 Control No 앞 10자리로 autocomplete 검색 → aText 클릭으로 aSearch 토글 → 항목 선택 → aValue 설정 확인 → Search → 결과 페이지 Control No 표시 확인 | autocomplete: aText(visible)↔aSearch(hidden) 토글 구조, Search postback 후 탭 사라짐 | Done |
| | | | Statistics | GMEPay 메뉴 재진입 → Statistics 탭 클릭 → Country: Nepal, 날짜: 지난달 범위 → Filter → 데이터 확인 → Country 컬럼 Nepal 검증 | Details Search 후 탭 없으므로 메뉴 재진입 필요 | Done |
| 6 | Other Services | Manual Reprocess | | 타이틀 확인 → Partner/Country Select/Select (전체) 검색 → "No Hold transaction found" 또는 데이터 테이블 확인 (분기 처리) | 현재 Hold 트랜잭션 0건 → "No Hold transaction found" 정상 응답 확인 | Done |
| 7 | TopUp | Domestic | | 페이지 진입 + validatePage만 수행 | | |
| 8 | TopUp | International | | 페이지 진입 + validatePage만 수행 | | |
| 9 | Transportation Card | CashBee | List | 타이틀 확인 → SearchById: CardNo, SearchValue: 1040129079342654, 날짜: 2026-01-01~04-17 → Filters → postback 결과 'CashBee History' + 데이터 테이블 확인 | CSS text-transform uppercase 주의 (실제 텍스트: CashBee History List), Filters postback 후 탭 사라짐 | Done |
| | | | Statistics | 메뉴 재진입 → Statistics 탭 클릭 → Country: All Countries, 날짜: 2026-01-01~04-17 → Filters → 'CashBee Statistics' 타이틀만 확인 (데이터 검증 없음) | 검색 결과 데이터가 노출안됨 ⇒ 권한 문제 확인, Filters postback 후 탭 사라짐 | Done |
| | | | Recharge List | 메뉴 재진입 → Recharge List 탭 클릭 → 날짜: Today~Today (동적) (#startDate/#toDate) → Search → 'CashBee History' + 데이터 테이블 확인 | 데이터 과다로 타임아웃 → 오늘 날짜로 변경, Search postback으로 ListResult.aspx 전환, 탭 사라짐 | Done |
| | | | Refund List | 메뉴 재진입 → Refund List 탭 클릭 → 날짜: 2026-04-01~04-10 (#startDate/#toDate) → Search → 'CashBee History' + 데이터 테이블 확인 | 오늘 날짜 조회 시 데이터 없음 → 고정 범위로 변경, 패널 타이틀 'Recharge List'와 동일, Search postback으로 탭 사라짐 | Done |
| 10 | Transportation Card | EasyGo | Daily Usage | Search By: Transportation Card No., Search Value: 1041049006188087, Search Month: 2026-01 → Search → 데이터 확인 → Card No 컬럼 검증 | CSS uppercase 주의 (실제 텍스트: Daily Usage), 동일 폼 ID 양쪽 탭 공유 | Done |
| | | | Payment Statement | 탭 전환 (Statement.aspx) → 동일 검색 조건 → Search → 데이터 확인 → Date Time 값 존재 확인 | 탭 클릭으로 iframe 내부 페이지 전환 | Done |

---

## remittance.cy.js (30개)

| # | 메뉴 | 페이지 | 테스트 시나리오 | 비고 | 상태 |
|---|------|--------|----------------|------|------|
| 1 | Compliance | AML Report | 페이지 진입 + validatePage만 수행 | | |
| 2 | Compliance | Approve OFAC Compliance | 페이지 진입 + validatePage만 수행 | | |
| 3 | Compliance | Compliance Limit Setup | 페이지 진입 + validatePage만 수행 | | |
| 4 | Compliance | Compliance Release Report | 페이지 진입 + validatePage만 수행 | | |
| 5 | Compliance | Rule Setup | 페이지 진입 + validatePage만 수행 | | |
| 6 | Compliance | Search Compliance Release TXN | 페이지 진입 + validatePage만 수행 | | |
| 7 | Compliance | Voice Phishing Report | 페이지 진입 + validatePage만 수행 | | |
| 8 | OFAC Management | Import Data | 페이지 진입 + validatePage만 수행 | | |
| 9 | OFAC Management | Manual Entry (OFAC) | 페이지 진입 + validatePage만 수행 | | |
| 10 | OFAC Management | OFAC Tracker | 페이지 진입 + validatePage만 수행 | | |
| 11 | Reports | Branch KPI Reports | 페이지 진입 + validatePage만 수행 | | |
| 12 | Reports | Transaction/Registration Group Report | 페이지 진입 + validatePage만 수행 | | |
| 13 | Reports | Customer Approved User wise | 페이지 진입 + validatePage만 수행 | | |
| 14 | Reports | Transaction/Registration Report | 페이지 진입 + validatePage만 수행 | | |
| 15 | Reports | Referral Report | 페이지 진입 + validatePage만 수행 | | |
| 16 | Reports | Gold Card Report | 페이지 진입 + validatePage만 수행 | | |
| 17 | Reports | Partnerwise Income Exp Report | 페이지 진입 + validatePage만 수행 | | |
| 18 | Reports | Settlement Report | 페이지 진입 + validatePage만 수행 | | |
| 19 | Reports | NativeCountrywise TXN Report | 페이지 진입 + validatePage만 수행 | | |
| 20 | Reports | Regional Transaction/Registration Report | 페이지 진입 + validatePage만 수행 | | |
| 21 | Reports | Staffs Incentive | 페이지 진입 + validatePage만 수행 | | |
| 22 | Reports | Local Txn Report | 페이지 진입 + validatePage만 수행 | | |
| 23 | Reports-Master | TempHold Inbound txn report | 페이지 진입 + validatePage만 수행 | | |
| 24 | Reports-Master | TempHold txn report | 페이지 진입 + validatePage만 수행 | | |
| 25 | Reports-Master | Transaction Analysis Report | 페이지 진입 + validatePage만 수행 | | |
| 26 | Reports-Master | Cancel Transaction Report | 페이지 진입 + validatePage만 수행 | | |
| 27 | Reports-Master | Transaction Report Master | 페이지 진입 + validatePage만 수행 | | |
| 28 | Reports-Master | Transaction Report | 페이지 진입 + validatePage만 수행 | | |
| 29 | Reports-Master | Unpaid Report | 페이지 진입 + validatePage만 수행 | | |
| 30 | Reports-Master | Paying Agent Settlement Report | 페이지 진입 + validatePage만 수행 | | |

---

## system_security.cy.js (5개)

| # | 메뉴 | 페이지 | 탭 | 테스트 시나리오 | 비고 | 상태 |
|---|------|--------|----|----------------|------|------|
| 1 | Core System Logs | API Logs | | 타이틀 확인 → GME ControlNo에 80186392632 입력 → From Date를 2026-04-01로 변경 → Filter → 데이터 테이블 확인 → Provider 'IMENepal' 검증 | 드롭다운 없이 직접 입력, 기본 From Date가 오늘이라 과거 데이터 미조회 → 날짜 변경 필요 | Done |
| 2 | Core System Logs | TxnErrorLogs | Customer List | 타이틀 확인 → Search By > email 선택 → sphh 입력 → Filter → 데이터 테이블 확인 → Error Message 컬럼 텍스트 존재 검증 | input[value="Filter"], tbody 첫 행이 TH 헤더 | Done |
| | | | ReturnRate | 진입 시 에러 발생으로 스킵 | "Error occurred in application. Please try after a while" (Error Log Id:559038) | Skip |
| 3 | Mobile App Logs | Customer Logs | | Phase1: KFTC Transaction Logs에서 Country Group/nepal/오늘날짜 검색 → per page 100 변경 → Remarks 'Success!' 행의 ViewRemark fetch → 이메일 추출. Phase2: Customer Logs 진입 → 타이틀 확인 → Type: Outbound+General, Method: Overseas, SearchBy: User Id, Value: 추출된 이메일, Date: 오늘/00:00~23:00 → Filter → 데이터 확인 → Created By 검증 | 배치 클리어 대응: KFTC에서 동적 이메일 추출, per page Nav() 호출, Phase 분리 구조 | Done |
| 4 | Mobile App Logs | KFTC Logs | KFTC Transaction Logs | (먼저 실행) Search By: Country Group, Value: nepal, 오늘 날짜 → Filter → 데이터 확인 → ViewRemark.aspx fetch로 마스킹 안 된 Username 추출 | grid ID: FaceVerificationlist, fetch+DOMParser 파싱 | Done |
| | | | KFTC Logs | Tab2에서 추출한 Username으로 검색 → Filter → 데이터 확인 → Provider 'KFTC' 검증 | 배치 클리어 대응: Tab2→Tab1 순서로 실행 | Done |
| 5 | Mobile App Logs | Error Logs | | 타이틀 확인 → User Name: philiph → Filter → 데이터 확인 → Page 컬럼 URL 텍스트 존재 검증 | jQuery .val() + Nav() 직접 호출, contains 정규식 매칭 | Done |
