import { getMainFrame, stubIframeDialogs, validatePage } from '../../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('ADMINISTRATION', () => {
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

    it('Customer Management - Customer Modify', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer Modify').click({ force: true });
        cy.log('## Customer Modify - 진입 성공 ##');
        validatePage();

        // Customer List - 검색
        cy.wait(2 * 1000);
        getMainFrame().find('#grdCustomerSetup_searchCriteria').select('Customer Id');
        getMainFrame().find('#grdCustomerSetup_searchValue').clear().type(Cypress.env('search_username'));
        getMainFrame().find('[Value="Filter"]').click({ force: true });
        cy.wait(2 * 1000);

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().contains('Edit Data', { timeout: 10000 }).click({ force: true });
        cy.wait(2 * 1000);

        // Edit data - Full Name 수정
        getMainFrame().find('[class="register-form"]').contains('Login Information').should('be.visible');
        cy.wait(2 * 1000);
        getMainFrame()
            .find('[id="firstName"]')
            .clear()
            .type('qa test_' + date.yymmdd_HHMM);
        getMainFrame().contains('Submit', { timeout: 10000 }).click({ force: true });
        cy.wait(3 * 1000);
        cy.log('## Full Name 수정완료 ##');

        // Customer List - 재검색하여 변경 확인
        getMainFrame().find('#grdCustomerSetup_searchCriteria').select('Customer Id');
        getMainFrame().find('#grdCustomerSetup_searchValue').clear().type(Cypress.env('search_username'));
        getMainFrame().find('[Value="Filter"]').click({ force: true });
        cy.wait(2 * 1000);

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame()
            .find('[class="panel-body"]')
            .contains('qa test_' + date.yymmdd)
            .should('be.visible');
        cy.log('## 변경된 Full Name - 일치 확인 ##');
    });

    it('Customer Management - Modify Customer Bank', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Modify Customer Bank').click({ force: true });
        cy.log('## Modify Customer Bank - 진입 성공 ##');

        validatePage();
    });

    it('Customer Management - Remove Duplicate Customer', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Remove Duplicate Customer').click({ force: true });
        cy.log('## Remove Duplicate Customer - 진입 성공 ##');

        validatePage();
    });

    it('Customer Management - GME Pay / Point Statement (4개 탭 검증)', function () {
        // ── GNB 메뉴: Administration > Customer Management > GME Pay / Point Statement 진입 ──
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('GME Pay / Point Statement').click({ force: true });
        cy.log('## GMEPay Point Statement - 진입 성공 ##');

        validatePage();

        // ── 4개 탭 정의 ──
        // Tab 1: 같은 페이지에서 포스트백 결과 표시 (input Filter 클릭)
        // Tab 2: CheckFormValidation() → location.href = "GMEPointStatementResult.aspx?..." 페이지 이동
        // Tab 3: CheckFormValidation() → location.href = "GMEPayStatement.aspx?..." 페이지 이동
        // Tab 4: CheckFormValidation() → window.open("GMEPayStatisticsResult.aspx?...") 새 창
        const baseUrl = '/AgentPanel/OnlineAgent/GMEPayPointManagement/';

        // ── Tab 1: Order Management (같은 페이지 포스트백) ──
        cy.wait(1000);
        getMainFrame().find('#grdPointMgmt_searchCriteria').select('UserId');
        cy.wait(500);
        getMainFrame().find('#grdPointMgmt_searchValue').clear().type(Cypress.env('search_username'));
        cy.wait(500);

        // Filter 버튼 클릭 (<input value="Filter">)
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('input[value="Filter"]').first().click();
            });

        // 포스트백 완료 대기 + 데이터 확인
        cy.wait(3000);
        getMainFrame().should($body => {
            const hasData = $body.find('table tr').length > 1;
            const hasNoData = $body.text().includes('Page 1 of 0') || $body.text().includes('Result 0 records');
            expect(hasData || hasNoData, 'Tab 1 포스트백 완료').to.be.true;
        });

        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const bodyText = win.jQuery('body').text();
                const hasRecords = !bodyText.includes('Result 0 records') && !bodyText.includes('Page 1 of 0');
                expect(hasRecords, 'Tab 1 - Order Management 데이터 존재').to.be.true;
                getMainFrame().find('table tr').should('have.length.greaterThan', 1);
                cy.log('## [Tab 1/4] Order Management - 데이터 테이블 확인 완료 ##');
            });

        // ── Tab 2: Point Statement Result New ──
        // CheckFormValidation()이 location.href = "GMEPointStatementResult.aspx?..." 로 이동
        // location.href는 브라우저 보안상 가로채기 불가 → URL을 직접 구성하여 iframe.src로 이동
        {
            const tab2ResultUrl = baseUrl + `GMEPointStatementResult.aspx?startDate=3/9/2026&endDate=4/9/2026&SearchById=email&SearchValue=${Cypress.env('search_username')}`;
            cy.get('iframe#mainFrame').then($iframe => {
                $iframe[0].src = tab2ResultUrl;
            });
            cy.wait(3000);
            // 결과 페이지는 .panel 요소가 없으므로 validatePage() 미사용

            getMainFrame().should($body => {
                const hasData = $body.find('table').length > 0;
                const hasText = $body.text().length > 100;
                expect(hasData || hasText, 'Tab 2 결과 페이지 로드 완료').to.be.true;
            });

            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    const hasTable = win.jQuery('table tr').length > 1;
                    expect(hasTable, 'Tab 2 - Point Statement Result New 데이터 존재').to.be.true;
                    cy.log('## [Tab 2/4] Point Statement Result New - 데이터 확인 완료 ##');
                });
        }

        // ── Tab 3: GME Pay Statement Management ──
        // CheckFormValidation()이 location.href = "GMEPayStatement.aspx?..." 로 이동
        {
            const tab3ResultUrl = baseUrl + `GMEPayStatement.aspx?startDate=3/9/2026&endDate=4/9/2026&SearchById=email&SearchValue=${Cypress.env('search_username')}`;
            cy.get('iframe#mainFrame').then($iframe => {
                $iframe[0].src = tab3ResultUrl;
            });
            cy.wait(3000);
            // 결과 페이지는 .panel 요소가 없으므로 validatePage() 미사용

            getMainFrame().should($body => {
                const hasData = $body.find('table').length > 0;
                const hasText = $body.text().length > 100;
                expect(hasData || hasText, 'Tab 3 결과 페이지 로드 완료').to.be.true;
            });

            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    const hasTable = win.jQuery('table tr').length > 1;
                    expect(hasTable, 'Tab 3 - GME Pay Statement Management 데이터 존재').to.be.true;
                    cy.log('## [Tab 3/4] GME Pay Statement Management - 데이터 확인 완료 ##');
                });
        }

        // ── Tab 4: Statistics (window.open 새 창) ──
        // Seperate By > Country Wise > All Countries > 날짜(2026-04-01 ~ 2026-04-02) > 검색
        cy.get('iframe#mainFrame').then($iframe => {
            $iframe[0].src = baseUrl + 'GMEPayStatistics.aspx';
        });
        cy.wait(3000);
        validatePage();
        cy.wait(1000);

        getMainFrame().find('#ddlSearchBy').select('country');
        cy.wait(1000); // ddlSeperatedBy 동적 로드 대기

        getMainFrame().find('#ddlSeperatedBy').select('1');
        cy.wait(500);

        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#startDate').val('4/1/2026');
                win.jQuery('#endDate').val('4/2/2026');
            });
        cy.wait(500);

        // window.open stub 설정 → URL 캡처
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.alert = function (msg) {
                    win.__suppressedAlert = msg;
                };
                cy.stub(win, 'open').callsFake((url, target, features) => {
                    win.__newWindowUrl = url;
                    return { focus: function () {} };
                });
            });

        // CheckFormValidation 실행 → window.open 호출
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.CheckFormValidation();
            });
        cy.wait(2000);

        // 캡처된 URL로 iframe 이동 → 결과 확인
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .its('__newWindowUrl')
            .should('exist')
            .then(capturedUrl => {
                cy.log('## Tab 4 캡처된 URL: ' + capturedUrl + ' ##');
                cy.get('iframe#mainFrame').then($iframe => {
                    $iframe[0].src = baseUrl + capturedUrl;
                });
                cy.wait(3000);
                // 결과 페이지는 .panel 요소가 없으므로 validatePage() 미사용

                getMainFrame().should($body => {
                    const hasData = $body.find('table').length > 0;
                    const hasText = $body.text().length > 100;
                    expect(hasData || hasText, 'Tab 4 Statistics 결과 페이지 로드 완료').to.be.true;
                });

                cy.get('iframe#mainFrame')
                    .its('0.contentWindow')
                    .then(win => {
                        const hasTable = win.jQuery('table tr').length > 1;
                        expect(hasTable, 'Tab 4 - Statistics 데이터 테이블 존재').to.be.true;
                        cy.log('## [Tab 4/4] Statistics - 새 창 결과 데이터 확인 완료 ##');
                    });
            });

        cy.log('## GMEPay Point Statement - 4개 탭 전체 검증 완료 ##');
    });

    it('Customer Management - Approve/Reject Face Verification', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Approve/Reject Face Verification').click({ force: true });
        cy.log('## Approve/Reject Face Verification - 진입 성공 ##');

        validatePage();
    });

    it('Customer Management - Reward Point Management', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Reward Point Management').click({ force: true });
        cy.log('## Reward Point Management - 진입 성공 ##');

        validatePage();
    });

    it('Customer Management - Password Reset', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Password Reset').click({ force: true });
        cy.log('## Password Reset - 진입 성공 ##');

        validatePage();
    });

    it('Customer Management - KFTC Registration/Renewal', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('KFTC Registration/Renewal').click({ force: true });
        cy.log('## KFTC Registration/Renewal - 진입 성공 ##');

        validatePage();
    });

    it('Customer Management - Inbound Bank List', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Inbound Bank List').click({ force: true });
        cy.log('## Inbound Bank List - 진입 성공 ##');

        validatePage();

        cy.wait(2 * 1000);
        getMainFrame().find('h4.panel-title label').should('have.text', 'Inbound Bank List');

        getMainFrame().find('#userInfo').select('Email');
        getMainFrame().find('#input').clear().type(Cypress.env('search_username'));
        getMainFrame().find('#btnSearch').click();
        getMainFrame().find('table.table-striped.table-bordered tbody tr').should('have.length.greaterThan', 0);

        cy.log('## Inbound Bank List - 검색 및 데이터 존재 확인 ##');
    });

    it('Customer Management - Customer Statement', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer Statement').click({ force: true });
        cy.log('## Customer Statement - 진입 성공 ##');

        validatePage();

        // ===== 5개 탭 공통 검색 시나리오 =====
        const tabList = [
            { name: 'Outbound Transaction Statement', searchId: '#CustomerInfo_aSearch', url: 'StatementReport.aspx' },
            { name: 'Account Statement', searchId: '#CustomerInfo_aSearch', url: 'AccountStatement.aspx' },
            { name: 'Inbound Transaction Statement', searchId: '#CustomerInfo_aSearch', url: 'InboundStatementReport.aspx' },
            { name: 'Domestic Transfer Customer Statement', searchId: '#CustomerInfo_aSearch', url: 'DomesticTxnStatement.aspx' },
            { name: 'Oris Transaction Statement', searchId: '#CustomerOris_aSearch', url: 'OrisTxnStatement.aspx' },
        ];

        const baseUrl = '/Remit/Administration/CustomerSetup/Statement/';

        // Tab 1에서 조회한 고객 정보를 저장 (Tab 2~5에서 재사용)
        const customerData = { id: '', label: '' };

        tabList.forEach((tab, index) => {
            cy.log(`## [Tab ${index + 1}/5] ${tab.name} 시작 ##`);

            // 각 탭 페이지로 직접 이동 (결과 페이지에서 탭 클릭 시 DOM 문제 방지)
            if (index > 0) {
                cy.get('iframe#mainFrame').then($iframe => {
                    $iframe[0].src = baseUrl + tab.url;
                });
                cy.wait(3000);
                validatePage();
            }

            cy.wait(2000);

            if (index === 0) {
                // Tab 1: autocomplete로 고객 정보 조회 + customerData에 저장
                cy.get('iframe#mainFrame')
                    .its('0.contentWindow')
                    .then(win => {
                        const $search = win.jQuery(tab.searchId);
                        $search.show();
                        $search.val('01063087733').autocomplete('search', '01063087733');
                    });
                cy.wait(3000);

                getMainFrame().find('.ui-autocomplete .ui-menu-item', { timeout: 10000 }).should('exist');
                cy.get('iframe#mainFrame')
                    .its('0.contentWindow')
                    .then(win => {
                        const $firstItem = win.jQuery('.ui-autocomplete .ui-menu-item').first();
                        const itemData = $firstItem.data('uiAutocompleteItem') || $firstItem.data('item.autocomplete');
                        if (itemData) {
                            // 고객 정보 저장 (Tab 2~5에서 재사용)
                            customerData.id = itemData.id;
                            customerData.label = itemData.value;

                            const valueId = tab.searchId.replace('_aSearch', '_aValue');
                            const textId = tab.searchId.replace('_aSearch', '_aText');
                            win.jQuery(valueId).val(itemData.id);
                            win.jQuery(textId).val(itemData.value);
                            win.jQuery(tab.searchId).autocomplete('close');
                            cy.log(`## autocomplete 선택 완료: ${itemData.id} ##`);
                        }
                    });
            } else if (tab.searchId === '#CustomerOris_aSearch') {
                // Tab 5 (Oris): 고객 ID 형식이 다르므로 (숫자 ID) 자체 autocomplete 실행
                cy.get('iframe#mainFrame')
                    .its('0.contentWindow')
                    .then(win => {
                        const $search = win.jQuery(tab.searchId);
                        $search.show();
                        $search.val('01063087733').autocomplete('search', '01063087733');
                    });
                cy.wait(3000);

                getMainFrame().find('.ui-autocomplete .ui-menu-item', { timeout: 10000 }).should('exist');
                cy.get('iframe#mainFrame')
                    .its('0.contentWindow')
                    .then(win => {
                        const $firstItem = win.jQuery('.ui-autocomplete .ui-menu-item').first();
                        const itemData = $firstItem.data('uiAutocompleteItem') || $firstItem.data('item.autocomplete');
                        if (itemData) {
                            win.jQuery('#CustomerOris_aValue').val(itemData.id);
                            win.jQuery('#CustomerOris_aText').val(itemData.value);
                            win.jQuery(tab.searchId).autocomplete('close');
                            cy.log(`## Oris autocomplete 선택 완료: ${itemData.id} ##`);
                        }
                    });
            } else {
                // Tab 2~4: 저장된 고객 정보를 hidden 필드에 직접 설정 (autocomplete AJAX 호출 없음)
                cy.get('iframe#mainFrame')
                    .its('0.contentWindow')
                    .then(win => {
                        const valueId = tab.searchId.replace('_aSearch', '_aValue');
                        const textId = tab.searchId.replace('_aSearch', '_aText');
                        win.jQuery(valueId).val(customerData.id);
                        win.jQuery(textId).val(customerData.label);
                        cy.log(`## 고객 정보 직접 설정: ${customerData.id} ##`);
                    });
            }
            cy.wait(1000);

            // Step 4-5: datepicker API로 날짜 설정
            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    win.jQuery('#startDate').datepicker('setDate', '2026-03-01').trigger('change');
                    win.jQuery('#endDate').datepicker('setDate', '2026-04-05').trigger('change');
                });
            getMainFrame().find('h4.panel-title').click({ force: true });
            cy.wait(500);

            // Filter 클릭 시 CheckFormValidation()의 AJAX 에러 콜백이 alert를 호출하므로 억제
            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    win.alert = function (msg) {
                        win.__suppressedAlert = msg;
                    };
                });

            // Step 6: Filter 버튼 클릭
            getMainFrame().find('#filterBtn').click();

            // 포스트백 완료 대기: .should() 콜백은 재시도(retry) 기능이 있음
            // getMainFrame()은 이미 <body>를 반환하므로 .find('body') 불필요!
            cy.wait(3000);
            // Tab 5 (Oris, index=4): 결과 페이지의 테이블에 table-striped/table-bordered 클래스가 없음
            const tableSelector = index === 4 ? 'table' : 'table.table-striped.table-bordered';

            getMainFrame().should($body => {
                const hasTable = $body.find(tableSelector).length > 0;
                const hasNoData = $body.text().includes('No wallet statement found');
                expect(hasTable || hasNoData, '포스트백 완료: 테이블 또는 빈 결과 메시지').to.be.true;
            });

            // 포스트백 확정 후, iframe의 live jQuery로 결과 판정
            // Tab 3 (Inbound, index=2)만 "No wallet statement found" 허용, 나머지는 테이블 필수
            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    const hasTable = win.jQuery(tableSelector).length > 0;
                    if (index === 2) {
                        // Tab 3: Inbound Transaction Statement — 데이터 없음이 정상
                        if (hasTable) {
                            getMainFrame().find(tableSelector).find('tr').should('have.length.greaterThan', 1);
                            cy.log(`## [Tab 3/5] ${tab.name} - 데이터 테이블 존재 (예상과 다름, 확인 필요) ##`);
                        } else {
                            expect(win.jQuery('body').text()).to.include('No wallet statement found');
                            cy.log(`## [Tab 3/5] ${tab.name} - 데이터 없음 (정상) ##`);
                        }
                    } else {
                        // Tab 1,2,4,5: 반드시 데이터 테이블이 있어야 함
                        expect(hasTable, `Tab ${index + 1} - 데이터 테이블 필수`).to.be.true;
                        getMainFrame().find(tableSelector).find('tr').should('have.length.greaterThan', 1);
                        cy.log(`## [Tab ${index + 1}/5] ${tab.name} - 데이터 테이블 확인 완료 ##`);
                    }
                });
        });

        cy.log('## Customer Statement - 5개 탭 전체 검증 완료 ##');
    });

    it('Customer Management - Receiver Details', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Receiver Details').click({ force: true });
        cy.log('## Receiver Details - 진입 성공 ##');

        validatePage();

        cy.wait(2 * 1000);
        getMainFrame().find('h4.panel-title').should('have.text', 'Receiver Detail List');

        getMainFrame().find('#grid_list_searchCriteria').select('userName');
        getMainFrame().find('#grid_list_searchValue').clear().type(Cypress.env('search_username'));
        getMainFrame().find('input[value="Filter"]').click();

        // Filter 후 테이블 재렌더링 대기
        cy.wait(3000);

        // Step 4: 테이블에 데이터 노출 확인 (헤더 row 1개 + 데이터 row 최소 1개 = 2개 이상)
        getMainFrame().find('#grid_list_body tbody tr').should('have.length.greaterThan', 1);
        getMainFrame().find('#grid_list_body tbody').should('contain.text', Cypress.env('search_username'));

        // Step 6: 첫 번째 데이터 row의 View 버튼 클릭 (첫 row는 헤더이므로 eq(1)부터 데이터)
        getMainFrame().find('#grid_list_body tbody tr').eq(1).contains('button', 'View').click();
        cy.wait(1000); // 모달 fade 애니메이션 완료 대기

        getMainFrame().find('#div_view_modal').should('have.class', 'in').and('have.css', 'opacity', '1');
        getMainFrame().find('#div_view_modal .modal-header span').should('have.text', 'Information');
        getMainFrame().find('#div_view_modal #customerId').should('have.value', '636027');
        cy.log('## Receiver Details - 검색 및 상세정보 팝업 검증 완료 ##');
    });

    it('KJ API - Customer ID Verification', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('KJ API').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer ID Verification').click({ force: true });
        cy.log('## Customer ID Verification - 진입 성공 ##');

        validatePage();

        cy.wait(2 * 1000);
        getMainFrame().find('h4.panel-title').should('contain.text', 'Customer Verification Details');

        getMainFrame().find('#searchBy').select('email');
        getMainFrame().find('#searchValue').clear().type(Cypress.env('search_username'));
        getMainFrame().find('#btnViewDetail').click();

        // 검색 후 페이지 리로드 대기
        cy.wait(3000);
        validatePage();

        // Verification Details 영역 노출 확인
        getMainFrame().find('#hiddenSearch').should('be.visible');
        getMainFrame().find('#hiddenSearch fieldset legend').should('have.text', 'Verification Details');

        // Click For Verification 버튼 노출 확인
        getMainFrame().find('#btnVerification').should('be.visible');

        // cy.intercept로 서버 응답의 alert()를 가로채기
        // → 서버가 HTML을 보내기 전에 alert()를 변수 저장 코드로 바꿔치기
        cy.intercept('POST', '**/Manage.aspx*', req => {
            req.continue(res => {
                if (res.body && typeof res.body === 'string') {
                    res.body = res.body.replace(/\balert\s*\(/g, 'window.__cypressAlertMsg=(');
                }
            });
        }).as('verificationRequest');

        // Click For Verification 버튼 클릭 (폼 포스트백 발생)
        getMainFrame().find('#btnVerification').click();

        // 서버 응답 대기
        cy.wait('@verificationRequest');
        cy.wait(2000);

        // Success 팝업 메시지 검증
        cy.get('iframe#mainFrame').its('0.contentWindow.__cypressAlertMsg').should('include', 'Success');
        cy.get('iframe#mainFrame')
            .its('0.contentWindow.__cypressAlertMsg')
            .then(msg => {
                cy.log('## Success 팝업 확인: ' + msg + ' ##');
            });

        cy.log('## Customer ID Verification - 검증 완료 ##');
    });

    it('KJ API - Modify Customer Bank', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('KJ API').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Modify Customer Bank').click({ force: true });
        cy.log('## Modify Customer Bank - 진입 성공 ##');

        validatePage();
    });

    it('KJ API - Remove Duplicate Customer', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('KJ API').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Remove Duplicate Customer').click({ force: true });
        cy.log('## Remove Duplicate Customer - 진입 성공 ##');

        validatePage();
    });

    it('Online Customers - Easy Remit', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Online Customer').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Easy Remit').click({ force: true });
        cy.log('## Easy Remit - 진입 성공 ##');

        validatePage();
    });

    it('Online Customers - Online Remit', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Online Customer').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Online Remit').click({ force: true });
        cy.log('## Online Remit - 진입 성공 ##');

        validatePage();

        // ── Online Remit 8개 탭 검증 ──
        // Tab 3(Customer Setup)은 등록 폼이므로 화면 진입만 확인
        // 나머지 7개 탭: Search By > Native Country/Country > south korea > 날짜(있으면) > Filter > 데이터 확인
        const baseUrl = '/Remit/Administration/OnlineCustomer/';
        const tabList = [
            {
                name: 'Approve Pending',
                url: 'List.aspx',
                selectId: '#grid_list_searchCriteria',
                countryOption: 'nativeCountry',
                searchValueId: '#grid_list_searchValue',
                dateFromId: '#grid_list_fromDate',
                dateToId: '#grid_list_toDate',
                hasDate: true,
                searchOnly: false,
            },
            {
                name: 'Approved List',
                url: 'ApprovedList.aspx',
                selectId: '#grid_al_searchCriteria',
                countryOption: 'nativeCountry',
                searchValueId: '#grid_al_searchValue',
                dateFromId: '#grid_al_regDateFrom',
                dateToId: '#grid_al_regDateTo',
                hasDate: true,
                searchOnly: false,
            },
            {
                name: 'Customer Setup',
                url: 'Manage.aspx',
                searchOnly: true, // 화면 진입만 확인
            },
            {
                name: 'Verify Pending',
                url: 'VerifyPendingList.aspx',
                selectId: '#grid_pl_searchCriteria',
                countryOption: 'nativeCountry',
                searchValueId: '#grid_pl_searchValue',
                dateFromId: '#grid_pl_fromDate',
                dateToId: '#grid_pl_toDate',
                hasDate: true,
                searchOnly: false,
            },
            {
                name: 'Audit List',
                url: 'AuditList.aspx',
                selectId: '#grid_list_searchCriteria',
                countryOption: 'nativeCountry',
                searchValueId: '#grid_list_searchValue',
                dateFromId: '#grid_list_fromDate',
                dateToId: '#grid_list_toDate',
                hasDate: true,
                searchOnly: false,
            },
            {
                name: 'Inactive Customer List',
                url: 'InactiveList.aspx',
                selectId: '#grid_Il_searchCriteria',
                countryOption: 'nativeCountry',
                searchValueId: '#grid_Il_searchValue',
                dateFromId: '#grid_Il_fromDate',
                dateToId: '#grid_Il_toDate',
                hasDate: true,
                searchOnly: false,
            },
            {
                name: 'Document Re-Request List',
                url: 'DocumentReRequestList.aspx',
                selectId: '#grid_listReUp_searchCriteria',
                countryOption: 'nativeCountry',
                searchValueId: '#grid_listReUp_searchValue',
                hasDate: false,
                searchOnly: false,
            },
            {
                name: 'Document Upload List',
                url: 'DocumentUploadList.aspx',
                selectId: '#grid_listReUp_searchCriteria',
                countryOption: 'nativeCountry',
                searchValueId: '#grid_listReUp_searchValue',
                hasDate: false,
                searchOnly: false,
            },
        ];

        tabList.forEach((tab, index) => {
            // Tab 1(index=0)은 이미 진입 완료, Tab 2~8은 iframe.src로 이동
            if (index > 0) {
                cy.get('iframe#mainFrame').then($iframe => {
                    $iframe[0].src = baseUrl + tab.url;
                });
                cy.wait(3000);
                validatePage();
            }
            cy.wait(1000);

            // Tab 3: Customer Setup — 화면 진입만 확인
            if (tab.searchOnly) {
                getMainFrame().find('.page-wrapper').should('exist');
                cy.log(`## [Tab ${index + 1}/8] ${tab.name} - 화면 진입 확인 완료 ##`);
                return; // forEach에서 다음 탭으로
            }

            // Step 1: Search By 드롭다운에서 Native Country/Country 선택
            getMainFrame().find(tab.selectId).select(tab.countryOption);
            cy.wait(500);

            // Step 2: Search Value에 'south korea' 입력
            getMainFrame().find(tab.searchValueId).clear().type('south korea');
            cy.wait(500);

            // Step 3: 날짜 필터가 있는 경우 날짜 설정 (2026-01-01 ~ 2026-04-09)
            if (tab.hasDate) {
                cy.get('iframe#mainFrame')
                    .its('0.contentWindow')
                    .then(win => {
                        win.jQuery(tab.dateFromId).val('2026-01-01');
                        win.jQuery(tab.dateToId).val('2026-04-09');
                    });
                cy.wait(500);
            }

            // Step 4: Filter 버튼 클릭
            // Filter 버튼이 <input type="button" value="Filter"> 형태일 수 있음
            // → contains()는 textContent만 검색하므로 input의 value 속성을 못 찾음
            // → jQuery로 버튼을 찾아서 직접 클릭
            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    // input[value="Filter"] 또는 button:contains("Filter") 모두 대응
                    const $filterBtn = win.jQuery('input[value="Filter"], button:contains("Filter")').first();
                    $filterBtn.click();
                });

            // Step 5: 포스트백 완료 대기 + 검색 결과 확인
            cy.wait(3000);
            getMainFrame().should($body => {
                const hasData = $body.find('table tr').length > 1;
                const hasNoData = $body.text().includes('Page 1 of 0') || $body.text().includes('Result 0 records');
                expect(hasData || hasNoData, `Tab ${index + 1} 포스트백 완료`).to.be.true;
            });

            // Step 6: 데이터 테이블 검증
            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    const resultText = win.jQuery('body').text();
                    const hasRecords = !resultText.includes('Result 0 records') && !resultText.includes('Page 1 of 0');
                    if (hasRecords) {
                        getMainFrame().find('table tr').should('have.length.greaterThan', 1);
                        cy.log(`## [Tab ${index + 1}/8] ${tab.name} - 데이터 테이블 확인 완료 ##`);
                    } else {
                        cy.log(`## [Tab ${index + 1}/8] ${tab.name} - 검색 결과 없음 (조건 확인 필요) ##`);
                    }
                });
        });

        cy.log('## Online Remit - 8개 탭 전체 검증 완료 ##');
    });

    it('Online Customers - Expired Passport', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Online Customer').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Expired Passport').click({ force: true });
        cy.log('## Expired Passport - 진입 성공 ##');

        validatePage();

        // ── Expired Passport 2개 탭 검증 ──
        // 두 탭 모두 동일한 시나리오: Search By > Native Country > cambodia > Filter > 데이터 확인
        // 날짜 필터 없음, selectId/searchValueId 동일 (grid_list_)
        const baseUrl = '/Remit/Administration/OnlineCustomer/ORIS_Approval/';
        const tabList = [
            { name: 'Passport Upload List', url: 'PassportUploadList.aspx' },
            { name: 'Expired Passport Customer List', url: 'ExpiredPassportList.aspx' },
        ];

        tabList.forEach((tab, index) => {
            // Tab 1은 이미 진입 완료, Tab 2는 iframe.src로 이동
            if (index > 0) {
                cy.get('iframe#mainFrame').then($iframe => {
                    $iframe[0].src = baseUrl + tab.url;
                });
                cy.wait(3000);
                validatePage();
            }
            cy.wait(1000);

            // Step 1: Search By > Native Country 선택
            getMainFrame().find('#grid_list_searchCriteria').select('nativeCountry');
            cy.wait(500);

            // Step 2: Search Value > cambodia 입력
            getMainFrame().find('#grid_list_searchValue').clear().type('cambodia');
            cy.wait(500);

            // Step 3: Filter 버튼 클릭 (jQuery로 input/button 모두 대응)
            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    const $filterBtn = win.jQuery('input[value="Filter"], button:contains("Filter")').first();
                    $filterBtn.click();
                });

            // Step 4: 포스트백 완료 대기 + 검색 결과 확인
            cy.wait(3000);
            getMainFrame().should($body => {
                const hasData = $body.find('table tr').length > 1;
                const hasNoData = $body.text().includes('Page 1 of 0') || $body.text().includes('Result 0 records');
                expect(hasData || hasNoData, `Tab ${index + 1} 포스트백 완료`).to.be.true;
            });

            // Step 5: 데이터 테이블 검증 — 반드시 데이터가 있어야 함
            cy.get('iframe#mainFrame')
                .its('0.contentWindow')
                .then(win => {
                    const resultText = win.jQuery('body').text();
                    const hasRecords = !resultText.includes('Result 0 records') && !resultText.includes('Page 1 of 0');
                    expect(hasRecords, `Tab ${index + 1} - ${tab.name} 데이터 테이블 필수`).to.be.true;
                    getMainFrame().find('table tr').should('have.length.greaterThan', 1);
                    cy.log(`## [Tab ${index + 1}/2] ${tab.name} - 데이터 테이블 확인 완료 ##`);
                });
        });

        cy.log('## Expired Passport - 2개 탭 전체 검증 완료 ##');
    });
});
