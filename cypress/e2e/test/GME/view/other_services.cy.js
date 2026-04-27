import { getMainFrame, stubIframeDialogs, validatePage } from '../../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('OTHER SERVICES', () => {
    beforeEach(() => {
        cy.viewport(1920, 1200); // 화면크기 설정
        cy.visit(Cypress.env('live_gme'));
        cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
        cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
        cy.get('[name="txtCompcode"]').type(Cypress.env('live_code_gme01'));
        cy.get('[name="btnLogin"]').click();
        cy.get('#chatBubbleImageId', { timeout: 10000 }).should('be.visible');
        cy.get('#gptcb-overlay', { timeout: 20000 }).should('not.exist'); // overlay 대기
        cy.log('## 로그인 ##');
    });

    it('Coupon - Coupon Issue', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Coupon').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Coupon Issue').click({ force: true });
        cy.log('## Coupon Issue - 진입 성공 ##');

        validatePage();
    });

    it('Coupon - Coupon Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Coupon').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Coupon Report').click({ force: true });
        cy.log('## Coupon Report - 진입 성공 ##');

        validatePage();
    });

    it('Coupon - Coupon Link Generator', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Coupon').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Coupon Link Generator').click({ force: true });
        cy.log('## Coupon Link Generator - 진입 성공 ##');

        validatePage();
    });

    it('Penny Test Verification Check', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Penny Test Verification Check').click({ force: true });
        cy.log('## Penny Test Verification Check - 진입 성공 ##');

        validatePage();
    });

    it('GMEPay', function () {
        // 동적 Control No 저장용 변수 (Tab1에서 추출 → Tab2에서 사용)
        let savedControlNo = '';

        // Step 1: GMEPay 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('GMEPay').click({ force: true });
        cy.log('## GMEPay - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // ===== Tab1: List =====
        // Step 2: 타이틀 확인 — 'GME Pay List'
        // ※ 화면에서는 CSS text-transform: uppercase로 대문자로 보이지만,
        //    실제 HTML 텍스트는 'GME Pay List' (Mixed Case)
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'GME Pay List');
        cy.log('## Tab1 List - 타이틀 확인 완료 ##');

        // Step 3: 검색 조건 설정 — Country: Nepal, Search By: Name, Search Value: santosh
        getMainFrame().find('#grid_countryId').select('151'); // Nepal
        cy.wait(500);
        getMainFrame().find('#grid_searchCriteria').select('name');
        cy.wait(500);
        getMainFrame().find('#grid_searchValue').clear().type('santosh');
        cy.log('## Tab1 List - 검색 조건 설정 완료 ##');

        // Step 4: Filter 클릭
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(5000);

        // Step 5: 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('#grid_body tbody tr');
                expect(rows.length, 'List 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab1 List - 데이터 노출 확인 완료 ##');

        // Step 6: Name 컬럼(index 1)에 santosh 포함 확인 + Control No(index 4) 저장
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const $dataRow = win.jQuery('#grid_body tbody tr').eq(1);
                const name = $dataRow.find('td').eq(1).text().trim();
                expect(name.toLowerCase(), 'Name 컬럼에 santosh 포함').to.include('santosh');

                // Tab2 Details에서 사용할 Control No 저장
                savedControlNo = $dataRow.find('td').eq(4).text().trim();
                cy.log(`## Tab1 List - Control No 저장: "${savedControlNo}" ##`);
            });
        cy.log('## Tab1 List - 검증 완료 ##');

        // ===== Tab2: Details =====
        // Step 7: Details 탭 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('Details').click();
        cy.wait(3000);

        // iframe 전환 대기: Details 페이지 로드 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'ORDER DETAILS');

        validatePage();
        cy.wait(2000);
        cy.log('## Tab2 Details - 타이틀 확인 완료 ##');

        // Step 8: autocomplete 검색
        // ※ #GMEPayDetails_aText(visible) → focus/click 하면 → #GMEPayDetails_aSearch(hidden→show) 토글
        // → aSearch에 타이핑 → autocomplete 드롭다운 → 항목 선택 → aValue에 값 설정
        cy.then(() => {
            const searchPrefix = savedControlNo.substring(0, 10);

            // aText를 클릭하면 focus 이벤트로 aSearch가 show되고 aText가 hide됨
            getMainFrame().find('#GMEPayDetails_aText').click();
            cy.wait(500);

            // aSearch가 visible 상태가 되면 타이핑
            getMainFrame().find('#GMEPayDetails_aSearch').should('be.visible').clear().type(searchPrefix);
            cy.log(`## Tab2 Details - autocomplete 검색어 "${searchPrefix}" 입력 ##`);
        });
        cy.wait(3000); // autocomplete 드롭다운 로딩 대기

        // Step 9: autocomplete 첫 번째 항목 선택
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('.ui-menu-item', { timeout: 10000 }).first().click();
        cy.wait(1000);

        // Step 10: aValue에 값이 설정됐는지 확인
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const aVal = win.jQuery('#GMEPayDetails_aValue').val();
                expect(aVal, 'Control No 값이 설정됨').to.not.be.empty;
                cy.log(`## Tab2 Details - autocomplete 선택 완료: "${aVal}" ##`);
            });

        // Step 11: Search 버튼 클릭
        getMainFrame().find('input[value="Search"]').click();
        cy.wait(5000);

        // Step 12: 검색 결과 확인
        // ※ Search postback 후 타이틀이 'ORDER DETAILS' → 'GME Pay Details'로 변경됨
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'Control No');
        cy.log('## Tab2 Details - 검색 결과 확인 완료 ##');

        // ===== Tab3: Statistics =====
        // ※ Tab2 Search postback 후 결과 페이지에는 탭(List/Details/Statistics)이 없음
        // → GMEPay 메뉴를 다시 클릭하여 재진입 후 Statistics 탭 클릭

        // Step 13: GMEPay 메뉴 재진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('GMEPay').click({ force: true });
        cy.wait(3000);

        // iframe 전환 대기: List 페이지 로드 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'GME Pay List');

        // Step 14: Statistics 탭 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('Statistics').click();
        cy.wait(3000);

        // iframe 전환 대기: Statistics 페이지 로드 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'GME PAY STATISTICS');

        validatePage();
        cy.wait(2000);
        cy.log('## Tab3 Statistics - 타이틀 확인 완료 ##');

        // Step 14: 검색 조건 설정 — Country: Nepal, 날짜: 지난달 1일~말일
        getMainFrame().find('#grid_countryId').select('151'); // Nepal
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const now = new Date();
                const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                const fromDate = lastMonthStart.toISOString().split('T')[0];
                const toDate = lastMonthEnd.toISOString().split('T')[0];
                win.jQuery('#grid_fromDate').val(fromDate);
                win.jQuery('#grid_toDate').val(toDate);
                cy.log(`## Tab3 Statistics - 날짜 설정: ${fromDate} ~ ${toDate} ##`);
            });
        cy.log('## Tab3 Statistics - 검색 조건 설정 완료 ##');

        // Step 15: Filter 클릭
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(5000);

        // Step 16: 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('#grid_body tbody tr');
                expect(rows.length, 'Statistics 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab3 Statistics - 데이터 노출 확인 완료 ##');

        // Step 17: Country 컬럼(index 1)에 Nepal 확인
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const country = win.jQuery('#grid_body tbody tr').eq(1).find('td').eq(1).text().trim();
                expect(country, 'Country 컬럼에 Nepal').to.include('Nepal');
            });
        cy.log('## Tab3 Statistics - Country Nepal 검증 완료 ##');
    });

    it('Manual Reprocess', function () {
        // Step 1: Manual Reprocess 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Manual Reprocess').click({ force: true });
        cy.log('## Manual Reprocess - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // Step 2: 타이틀 확인
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Reprocess Transaction');
        cy.log('## Manual Reprocess - 타이틀 확인 완료 ##');

        // Step 3: Select/Select (전체 Hold 조회) → Search
        getMainFrame().find('#ddlPartner').select('');
        cy.wait(500);
        getMainFrame().find('#ddlCountry').select('');
        cy.wait(500);

        getMainFrame().find('#btnSearch').click();
        cy.wait(5000);

        // Step 4: 결과 확인 — 'No Hold transaction found' 또는 데이터 테이블
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .then($body => {
                const bodyText = $body.text();
                if (bodyText.includes('No Hold transaction found')) {
                    cy.log('⚠️ Manual Reprocess - Hold 트랜잭션 0건 (정상 응답 확인)');
                } else {
                    const rows = $body.find('table.table-striped tr');
                    expect(rows.length, 'Hold 데이터 행 존재').to.be.greaterThan(1);
                    cy.log('## Manual Reprocess - Hold 데이터 확인 완료 ##');
                }
            });
        cy.log('## Manual Reprocess - 검색 완료 ##');
    });

    it('TopUp - Domestic', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('TopUp').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Domestic').click({ force: true });
        cy.log('## Domestic - 진입 성공 ##');

        validatePage();
    });

    it('TopUp - International', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('TopUp').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('International').click({ force: true });
        cy.log('## International - 진입 성공 ##');

        validatePage();
    });

    it('Transportation Card - CashBee', function () {
        // Step 1: CashBee 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Transportation Card').trigger('mouseover');
        cy.wait(2000);
        cy.contains('CashBee').click({ force: true });
        cy.log('## CashBee - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // ===== Tab1: List =====
        // Step 2: 타이틀 확인 — 실제 HTML: 'CashBee History List' (CSS uppercase)
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'CashBee History List');
        cy.log('## Tab1 List - 타이틀 확인 완료 ##');

        // Step 3: 검색 조건 설정
        getMainFrame().find('#SearchById').select('CardNo');
        cy.wait(500);
        getMainFrame().find('#SearchValue').clear().type('1040129079342654');
        cy.wait(500);

        // 날짜 설정 (jQuery .val() 사용)
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#startDate').val('2026-01-01');
                win.jQuery('#endDate').val('2026-04-17');
            });
        cy.log('## Tab1 List - 검색 조건 설정 완료 ##');

        // Step 4: Filters 버튼 클릭
        getMainFrame().find('button').contains('Filters').click();
        cy.wait(5000);

        // Step 5: 결과 확인 — postback으로 결과 페이지 전환 (탭 사라짐)
        // 결과 페이지에 'CashBee History' 텍스트 + 데이터 테이블 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'CashBee History');

        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('table.table-striped tr');
                expect(rows.length, 'List 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab1 List - 데이터 확인 완료 ##');

        // ===== Tab2: Statistics =====
        // ※ Tab1 Filters postback 후 탭 사라짐 → 메뉴 재진입 필요
        // Step 6: CashBee 메뉴 재진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Transportation Card').trigger('mouseover');
        cy.wait(2000);
        cy.contains('CashBee').click({ force: true });
        cy.wait(3000);

        // List 페이지 로드 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'CashBee History List');

        // Step 7: Statistics 탭 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('Statistics').click();
        cy.wait(3000);

        // Statistics 페이지 로드 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'CashBee Statistics');

        validatePage();
        cy.log('## Tab2 Statistics - 타이틀 확인 완료 ##');

        // Step 8: 검색 조건 설정
        getMainFrame().find('#ddlCountry').select('1'); // All Countries
        cy.wait(500);

        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#startDate').val('2026-01-01');
                win.jQuery('#endDate').val('2026-04-17');
            });
        cy.log('## Tab2 Statistics - 검색 조건 설정 완료 ##');

        // Step 9: Filters 클릭
        getMainFrame().find('button').contains('Filters').click();
        cy.wait(5000);

        // Step 10: 결과 확인 — postback 결과 페이지
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'CashBee Statistics');
        cy.log('## Tab2 Statistics - 결과 확인 완료 ##');
        cy.log('⚠️ Tab2 Statistics - 검색 결과 데이터가 노출안됨 => 권한 문제 확인');

        // ===== Tab3: Recharge List =====
        // ※ Tab2 Filters postback 후 탭 사라짐 → 메뉴 재진입 필요
        // Step 11: CashBee 메뉴 재진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Transportation Card').trigger('mouseover');
        cy.wait(2000);
        cy.contains('CashBee').click({ force: true });
        cy.wait(3000);

        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'CashBee History List');

        // Step 12: Recharge List 탭 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('Recharge List').click();
        cy.wait(3000);

        // Recharge List 페이지 로드 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'Recharge List');

        validatePage();
        cy.log('## Tab3 Recharge List - 타이틀 확인 완료 ##');

        // Step 13: 날짜 설정 + Search
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const today = new Date().toISOString().split('T')[0];
                win.jQuery('#startDate').val(today);
                win.jQuery('#toDate').val(today);
            });

        getMainFrame().find('button').contains('Search').click();
        cy.wait(5000);

        // Step 14: 결과 확인 — postback으로 ListResult.aspx 전환 (탭 사라짐)
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'CashBee History');

        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('table.table-striped tr');
                expect(rows.length, 'Recharge List 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab3 Recharge List - 검색 완료 ##');

        // ===== Tab4: Refund List =====
        // ※ Tab3 Search postback 후 탭 사라짐 → 메뉴 재진입 필요
        // Step 15: CashBee 메뉴 재진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Transportation Card').trigger('mouseover');
        cy.wait(2000);
        cy.contains('CashBee').click({ force: true });
        cy.wait(3000);

        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'CashBee History List');

        // Step 16: Refund List 탭 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('Refund List').click();
        cy.wait(3000);

        // Refund List 페이지 로드 확인 (패널 타이틀은 'Recharge List'와 동일)
        // URL로 구분: RefundList.aspx
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'Refund List');

        validatePage();
        cy.log('## Tab4 Refund List - 타이틀 확인 완료 ##');

        // Step 17: 날짜 설정 + Search
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#startDate').val('2026-04-01');
                win.jQuery('#toDate').val('2026-04-10');
            });

        getMainFrame().find('button').contains('Search').click();
        cy.wait(5000);

        // Step 18: 결과 확인 — postback으로 ListResult.aspx 전환 (탭 사라짐)
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'CashBee History');

        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('table.table-striped tr');
                expect(rows.length, 'Refund List 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab4 Refund List - 검색 완료 ##');
    });

    it('Transportation Card - EasyGo', function () {
        // Step 1: EasyGo 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Transportation Card').trigger('mouseover');
        cy.wait(2000);
        cy.contains('EasyGo').click({ force: true });
        cy.log('## EasyGo - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // ===== Tab1: Daily Usage =====
        // Step 2: 타이틀 확인 — 실제 HTML 텍스트는 'Daily Usage' (CSS uppercase로 'DAILY USAGE' 표시)
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Daily Usage');
        cy.log('## [Tab1] Daily Usage - 타이틀 확인 완료 ##');

        // Step 3: 검색 조건 설정 — Search By: Transportation Card No., Search Value: 1041049006188087, Search Month: 2026-01
        getMainFrame().find('#ddlSearchBy').select('cardNumber');
        cy.wait(500);
        getMainFrame().find('#searchValue').clear().type('1041049006188087');
        cy.wait(500);

        // Search Month 값 설정 (jQuery .val() 사용)
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#searchMonth').val('2026-01');
            });
        cy.log('## [Tab1] Daily Usage - 검색 조건 설정 완료 ##');

        // Step 4: Search 버튼 클릭
        getMainFrame().find('#btnSubmit').click();
        cy.wait(5000);

        // Step 5: 데이터 노출 확인 — 테이블 행이 1개 이상 (header + data)
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('table.table tr');
                expect(rows.length, 'Daily Usage 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## [Tab1] Daily Usage - 데이터 노출 확인 완료 ##');

        // Step 6: Transportation Card No 컬럼(index 1) 검증
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const cardNo = $body.find('table.table tr').eq(1).find('td').eq(1).text().trim();
                expect(cardNo, 'Card No 컬럼 값 일치').to.include('1041049006188087');
            });
        cy.log('## [Tab1] Daily Usage - Card No 검증 완료 ##');

        // ===== Tab2: Payment Statement =====
        // Step 7: Payment Statement 탭 클릭 → iframe 전환 대기
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('Payment Statement').click();
        cy.wait(3000);

        // iframe 전환 대기: Payment Statement 페이지 로드 확인
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'Payment Statement');

        validatePage();
        cy.wait(2000);
        cy.log('## [Tab2] Payment Statement - 타이틀 확인 완료 ##');

        // Step 8: 검색 조건 설정 — 동일 조건
        getMainFrame().find('#ddlSearchBy').select('cardNumber');
        cy.wait(500);
        getMainFrame().find('#searchValue').clear().type('1041049006188087');
        cy.wait(500);

        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#searchMonth').val('2026-01');
            });
        cy.log('## [Tab2] Payment Statement - 검색 조건 설정 완료 ##');

        // Step 9: Search 버튼 클릭
        getMainFrame().find('#btnSubmit').click();
        cy.wait(5000);

        // Step 10: 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('table.table tr');
                expect(rows.length, 'Payment Statement 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## [Tab2] Payment Statement - 데이터 노출 확인 완료 ##');

        // Step 11: Date Time 컬럼(index 1) 값 존재 확인
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const dateTime = $body.find('table.table tr').eq(1).find('td').eq(1).text().trim();
                expect(dateTime, 'Date Time 값이 존재').to.not.be.empty;
            });
        cy.log('## [Tab2] Payment Statement - Date Time 검증 완료 ##');
    });
});
