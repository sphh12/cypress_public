import { getMainFrame, stubIframeDialogs, validatePage } from '../../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('INBOUND', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080); // 화면크기 설정
        cy.visit(Cypress.env('live_gme'));
        cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
        cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
        cy.get('[name="txtCompcode"]').type(Cypress.env('live_code_gme01'));
        cy.get('[name="btnLogin"]').click();
        cy.get('#chatBubbleImageId', { timeout: 10000 }).should('be.visible');
        cy.get('#gptcb-overlay', { timeout: 20000 }).should('not.exist'); // overlay 대기
        cy.log('## 로그인 ##');
    });

    it('Post Transaction', function () {
        // ===== 메뉴 진입 =====
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Post Transaction').click({ force: true });
        cy.log('## Post Transaction - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // ===== Tab1: Process Transaction List (List.aspx) =====
        // 미지급 트랜잭션이 없으면 데이터 없음이 정상
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Post Transaction');
        cy.log('## Tab1 Process Transaction List - 타이틀 확인 ##');

        // Filter 버튼 클릭하여 검색 실행
        getMainFrame().find('input[value="Filter"]').click();
        cy.wait(3000);

        // 검색 결과 확인 (미지급 트랜잭션 없으면 데이터 0건이 정상)
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const dataTable = $body.find('#grid_inbound_PostTxn_body');
                const dataRows = dataTable.find('tr').length - 1; // 헤더 제외
                if (dataRows > 0) {
                    cy.log(`## Tab1 - 데이터 ${dataRows}건 존재 (미지급 트랜잭션 있음) ##`);
                } else {
                    cy.log('## Tab1 - 데이터 0건 (정상: 미지급 트랜잭션 없음) ##');
                }
            });
        cy.log('## Tab1 Process Transaction List - 완료 ##');

        // ===== Tab2: Hold Transaction List (HoldTxnList.aspx) =====
        cy.get('iframe#mainFrame').then($iframe => {
            $iframe[0].src = '/InboundRemit/Transaction/PostTransaction/HoldTxnList.aspx';
        });
        cy.wait(3000);

        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Post Transaction');
        cy.log('## Tab2 Hold Transaction List - 진입 ##');

        // Step 1: 데이터 존재 확인
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const dataTable = $body.find('#grid_inbound_HoldTxn_body');
                const rows = dataTable.find('tr');
                expect(rows.length, 'Tab2 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab2 - 데이터 존재 확인 완료 ##');

        // Step 2: 첫 번째 행의 Tran ID 가져와서 필터 검색
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const firstTranId = $body.find('#grid_inbound_HoldTxn_body tr').eq(1).find('td').eq(0).text().trim();
                cy.log(`## Tab2 - 첫 번째 Tran ID: ${firstTranId} ##`);

                // Tran Id 필터에 입력 후 검색
                const tranInput = $body.find('#grid_inbound_HoldTxn_trnId');
                cy.wrap(tranInput).clear().type(firstTranId);
                cy.wait(500);

                const filterBtn = $body.find('input[value="Filter"]');
                cy.wrap(filterBtn).click();
                cy.wait(3000);

                // 검색 결과 확인: 필터된 결과에서 Tran ID 일치 검증
                cy.get('iframe#mainFrame')
                    .its('0.contentDocument.body')
                    .then($body2 => {
                        const resultRows = $body2.find('#grid_inbound_HoldTxn_body tr');
                        expect(resultRows.length, 'Tab2 필터 결과 존재').to.be.greaterThan(1);

                        const resultTranId = resultRows.eq(1).find('td').eq(0).text().trim();
                        expect(resultTranId, 'Tab2 Tran ID 일치').to.equal(firstTranId);
                        cy.log(`## Tab2 - Tran ID ${firstTranId} 검색 성공 ##`);

                        // Step 3: GMEPin 컬럼 클릭 → 상세보기 진입
                        const gmePinLink = resultRows.eq(1).find('td').eq(1).find('a');
                        expect(gmePinLink.length, 'GMEPin 링크 존재').to.equal(1);
                        cy.wrap(gmePinLink).click();
                        cy.wait(3000);

                        // Tab4 상세보기 확인
                        cy.get('iframe#mainFrame', { timeout: 15000 })
                            .its('0.contentDocument.body')
                            .should('contain.text', 'Post Transaction Details');
                        cy.log('## Tab2 → Tab4 상세보기 진입 확인 완료 ##');
                    });
            });

        // ===== Tab3: Process Hold Transaction List (ProcessHoldTxnList.aspx) =====
        cy.get('iframe#mainFrame').then($iframe => {
            $iframe[0].src = '/InboundRemit/Transaction/PostTransaction/ProcessHoldTxnList.aspx';
        });
        cy.wait(3000);

        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Post Transaction');
        cy.log('## Tab3 Process Hold Transaction List - 진입 ##');

        // Step 1: 데이터 존재 확인
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const dataTable = $body.find('#grid_inbound_ProcHoldTxn_body');
                const rows = dataTable.find('tr');
                expect(rows.length, 'Tab3 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab3 - 데이터 존재 확인 완료 ##');

        // Step 2: 첫 번째 행의 Tran ID 가져와서 필터 검색
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const firstTranId = $body.find('#grid_inbound_ProcHoldTxn_body tr').eq(1).find('td').eq(0).text().trim();
                cy.log(`## Tab3 - 첫 번째 Tran ID: ${firstTranId} ##`);

                // Tran Id 필터에 입력 후 검색
                const tranInput = $body.find('#grid_inbound_ProcHoldTxn_trnId');
                cy.wrap(tranInput).clear().type(firstTranId);
                cy.wait(500);

                const filterBtn = $body.find('input[value="Filter"]');
                cy.wrap(filterBtn).click();
                cy.wait(3000);

                // 검색 결과 확인: 필터된 결과에서 Tran ID 일치 검증
                cy.get('iframe#mainFrame')
                    .its('0.contentDocument.body')
                    .then($body2 => {
                        const resultRows = $body2.find('#grid_inbound_ProcHoldTxn_body tr');
                        expect(resultRows.length, 'Tab3 필터 결과 존재').to.be.greaterThan(1);

                        const resultTranId = resultRows.eq(1).find('td').eq(0).text().trim();
                        expect(resultTranId, 'Tab3 Tran ID 일치').to.equal(firstTranId);
                        cy.log(`## Tab3 - Tran ID ${firstTranId} 검색 성공 ##`);

                        // Step 3: GMEPin 컬럼 클릭 → 상세보기 진입
                        const gmePinLink = resultRows.eq(1).find('td').eq(1).find('a');
                        expect(gmePinLink.length, 'GMEPin 링크 존재').to.equal(1);
                        cy.wrap(gmePinLink).click();
                        cy.wait(3000);

                        // Tab4 상세보기 확인
                        cy.get('iframe#mainFrame', { timeout: 15000 })
                            .its('0.contentDocument.body')
                            .should('contain.text', 'Post Transaction Details');
                        cy.log('## Tab3 → Tab4 상세보기 진입 확인 완료 ##');
                    });
            });

        cy.log('## Post Transaction - 전체 4탭 테스트 완료 ##');
    });

    it('Search Transaction', function () {
        // Step 1: Search Transaction 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Search Transaction').first().click({ force: true });
        cy.log('## Search Transaction - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // Step 2: 타이틀 확인
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Search Transaction Details');
        cy.log('## Search Transaction - 타이틀 확인 완료 ##');

        // Step 3: Tran No 입력 + Search
        getMainFrame().find('#tranId').clear().type('10000');
        cy.wait(500);

        getMainFrame().find('#btnSearch').click();
        cy.wait(5000);

        // Step 4: 결과 확인 — Details.aspx로 이동, 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Search Inbound Transaction Details');

        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('table.table-bordered.table-striped tr');
                expect(rows.length, '검색 결과 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Search Transaction - 검색 결과 확인 완료 ##');
    });

    it('Receiver Initiated Inbound - Route Inbound Partner', function () {
        // ===== 메뉴 진입 =====
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2000);
        cy.contains('Route Inbound Partner').click({ force: true });
        cy.log('## Route Inbound Partner - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // ===== Tab1: Inbound API Routing (PartnerList.aspx) =====
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Inbound API Routing');
        cy.log('## Tab1 Inbound API Routing - 타이틀 확인 ##');

        // Step 1: 초기 데이터 존재 확인
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('#grid_inbound_apiRouting_body tr');
                expect(rows.length, 'Tab1 초기 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab1 - 초기 데이터 확인 완료 ##');

        // Step 2: Partner 필터 9PAY 선택 → Filter → 일치 데이터 확인
        getMainFrame().find('#grid_inbound_apiRouting_agentId').select('1702529'); // 9PAY
        cy.wait(500);
        getMainFrame().find('input[value="Filter"]').click();
        cy.wait(3000);

        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('#grid_inbound_apiRouting_body tr');
                expect(rows.length, 'Tab1 필터 결과 존재').to.be.greaterThan(1);

                const partnerText = rows.eq(1).find('td').eq(0).text().trim();
                expect(partnerText, 'Tab1 Partner 일치').to.equal('9PAY');
            });
        cy.log('## Tab1 - 9PAY 필터 검색 및 데이터 일치 확인 완료 ##');

        // ===== Tab2: ADD Inbound API Partner (AddAPIPartners.aspx) =====
        cy.get('iframe#mainFrame').then($iframe => {
            $iframe[0].src = '/InboundRemit/NewTypeInbound/APIRouting/AddAPIPartners.aspx';
        });
        cy.wait(3000);

        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Setup Inbound API Partners');
        cy.log('## Tab2 ADD Inbound API Partner - 화면 노출 확인 완료 (등록 탭) ##');

        // ===== Tab3: Route Internet Banking (RouteInternetBanking.aspx) =====
        cy.get('iframe#mainFrame').then($iframe => {
            $iframe[0].src = '/InboundRemit/NewTypeInbound/APIRouting/RouteInternetBanking.aspx';
        });
        cy.wait(3000);

        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Route Internet Banking');
        cy.log('## Tab3 Route Internet Banking - 타이틀 확인 ##');

        // Step 1: 초기 데이터 존재 확인
        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('#grid_inbound_apiRouting_body tr');
                expect(rows.length, 'Tab3 초기 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Tab3 - 초기 데이터 확인 완료 ##');

        // Step 2: Partner 필터 Sendmn 선택 → Filter → 일치 데이터 확인
        getMainFrame().find('#grid_inbound_apiRouting_agentId').select('798225'); // Sendmn
        cy.wait(500);
        getMainFrame().find('input[value="Filter"]').click();
        cy.wait(3000);

        cy.get('iframe#mainFrame')
            .its('0.contentDocument.body')
            .then($body => {
                const rows = $body.find('#grid_inbound_apiRouting_body tr');
                expect(rows.length, 'Tab3 필터 결과 존재').to.be.greaterThan(1);

                const partnerText = rows.eq(1).find('td').eq(0).text().trim();
                expect(partnerText, 'Tab3 Partner 일치').to.equal('Sendmn');
            });
        cy.log('## Tab3 - Sendmn 필터 검색 및 데이터 일치 확인 완료 ##');

        cy.log('## Route Inbound Partner - 전체 3탭 테스트 완료 ##');
    });

    it('Receiver Initiated Inbound - Customer Guide', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer Guide').click({ force: true });
        cy.log('## Customer Guide - 진입 성공 ##');

        validatePage();
    });

    it('Receiver Initiated Inbound - Sender Detail', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Sender Detail').click({ force: true });
        cy.log('## Sender Detail - 진입 성공 ##');

        validatePage();
    });

    it('Receiver Initiated Inbound - Sender Page Setup', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Sender Page Setup').click({ force: true });
        cy.log('## Sender Page Setup - 진입 성공 ##');

        validatePage();
    });

    it('Receiver Initiated Inbound - Master Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Master Report').click({ force: true });
        cy.log('## Master Report - 진입 성공 ##');

        validatePage();
    });

    it('Receiver Initiated Inbound - Receiver Initiated Transaction Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Transaction Report').click({ force: true });
        cy.log('## Receiver Initiated Transaction Report - 진입 성공 ##');

        validatePage();
    });

    it('Receiver Initiated Inbound - Search Transaction', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Search Transaction').click({ force: true });
        cy.log('## Search Transaction - 진입 성공 ##');

        validatePage();
    });
});
