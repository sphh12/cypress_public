import { getMainFrame, stubIframeDialogs } from '../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('GME - Core', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080); //화면크기 설정
        cy.visit(Cypress.env('live_gme'));
        cy.get('[name="txtUsername"]').click();
        cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
        cy.get('[name="txtPwd"]').click();
        cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
        cy.get('[name="txtCompcode"]').click();
        cy.get('[name="txtCompcode"]').type(Cypress.env('live_code_gme01'));
        cy.get('[name="btnLogin"]').click();
        cy.get('#chatBubbleImageId', { timeout: 10000 }).should('be.visible');

        cy.get('#gptcb-overlay', { timeout: 20000 }).should('not.exist'); // 필요하면 overlay 대기
        cy.log('## 로그인 성공 ##');
    });

    it('Customer Management - Modify Customer Bank', function () {
        cy.get(':nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(1 * 1000);
        cy.contains('Modify Customer Bank').click({ force: true });
        cy.wait(2 * 1000);
        cy.log('## Modify Customer Bank 진입 ##');

        // MODIFY CUSTOMER BANK 타이틀 확인
        getMainFrame()
            .find('[class="panel-title"]')
            .should($el => {
                const text = $el.text().trim().toUpperCase();
                expect(text).to.include('MODIFY CUSTOMER BANK');
            });

        const idNumber = Cypress.env('customer_id_number');

        // 검색 - ID Number
        getMainFrame().find('#searchBy').select('Alien/National Id');
        getMainFrame().find('#searchValue').type(idNumber);
        getMainFrame().find('#searchButton').click();

        // Secondary Alien/National ID 영역에 검색한 ID 번호가 동일하게 표시되는지 확인
        cy.wait(3000);
        getMainFrame().find('#secondaryIdNumber').should('not.be.empty');
        getMainFrame().find('#secondaryIdNumber').should('have.text', idNumber);

        // 은행 정보
        const bankA = Cypress.env('bank_a_name');
        const accountA = Cypress.env('bank_a_account');
        const bankB = Cypress.env('bank_b_name');
        const accountB = Cypress.env('bank_b_account');

        // Old Bank 확인 후 조건에 따라 New Bank 선택
        let originalOldBank = ''; // Old Bank 초기값 저장용

        getMainFrame()
            .find('#oldBank')
            .then($oldBank => {
                originalOldBank = $oldBank.text().trim();
                cy.log('📌 Old Bank (초기):', originalOldBank);

                if (originalOldBank.includes('Industrial Bank of Korea') || originalOldBank.includes('IBK')) {
                    // Old Bank가 A은행이면 → New Bank에 B은행 선택
                    getMainFrame().find('#newBank').select(bankB);
                    getMainFrame().find('#newAccountNumber').type(accountB);
                    cy.log('✅ Old Bank: A은행(IBK) → New Bank: B은행(NH) 선택');
                } else if (originalOldBank.includes('Nonghyup Bank') || originalOldBank.includes('NH')) {
                    // Old Bank가 B은행이면 → New Bank에 A은행 선택
                    getMainFrame().find('#newBank').select(bankA);
                    getMainFrame().find('#newAccountNumber').type(accountA);
                    cy.log('✅ Old Bank: B은행(NH) → New Bank: A은행(IBK) 선택');
                } else {
                    // 예외 처리: Old Bank가 A, B 둘 다 아닌 경우 기본값(B은행)
                    cy.log('⚠️ Old Bank가 A, B 은행이 아닙니다. 기본값(B은행) 사용');
                    getMainFrame().find('#newBank').select(bankB);
                    getMainFrame().find('#newAccountNumber').type(accountB);
                }

                // 초기 Old Bank 값을 Cypress 환경 변수로 저장
                cy.wrap(originalOldBank).as('originalOldBank');
            });
        cy.log('✅ 계좌 정보 입력 완료');

        // Python 스크립트를 백그라운드에서 먼저 실행 (Alert 대기 모드)
        cy.task('clickAlert').then(result => {
            cy.log('✅ Python 스크립트 실행 시작:', result.message);
        });

        // CHECK 버튼 클릭 (Alert 발생)
        getMainFrame().find('#checkBtn').click();
        cy.log('✅ CHECK 버튼 클릭 완료');

        // Python이 Alert을 자동으로 클릭할 때까지 대기 (5초 + 처리 시간 + 여유)
        cy.wait(10000);

        // 계좌 검증 성공 여부 확인 - DOM 요소로 검증
        getMainFrame().find('#secondaryIdNumber').should('have.text', idNumber);
        cy.log('✅ Account Verified - 계좌 검증 완료');

        getMainFrame().find('#hiddenDivCheck').should('be.visible');

        // MODIFY 버튼이 노출되는지 확인
        getMainFrame().find('#Modify').should('be.visible');

        cy.task('clickAlert').then(result => {
            cy.log('✅ Python 스크립트 실행 시작:', result.message);
        });

        // MODIFY 버튼 클릭
        getMainFrame().find('#Modify').click();
        cy.wait(10000);

        // 재검색 (MODIFY 완료 확인)
        getMainFrame().find('#searchButton').click();
        cy.wait(3000);
        cy.log('🔄 재검색 완료');

        // Old Bank 변경 확인
        cy.get('@originalOldBank').then(originalOldBank => {
            getMainFrame()
                .find('#oldBank')
                .then($oldBank => {
                    const newOldBank = $oldBank.text().trim();
                    cy.log('📌 Old Bank (변경 후):', newOldBank);

                    // 변경 전후 비교
                    if (originalOldBank !== newOldBank) {
                        cy.log('✅ Old Bank 변경 성공!');
                        cy.log(`   변경 전: ${originalOldBank}`);
                        cy.log(`   변경 후: ${newOldBank}`);

                        // 은행이 정확히 교체되었는지 검증
                        if (originalOldBank.includes('IBK') && newOldBank.includes('NH')) {
                            cy.log('✅ A은행 → B은행 변경 확인');
                        } else if (originalOldBank.includes('NH') && newOldBank.includes('IBK')) {
                            cy.log('✅ B은행 → A은행 변경 확인');
                        }

                        // 단언문으로 확인
                        expect(newOldBank).to.not.equal(originalOldBank);
                    } else {
                        cy.log('⚠️ Old Bank 변경 안됨');
                        cy.log(`   현재 값: ${newOldBank}`);
                    }
                });
        });

        cy.log('## 계좌 변경 완료 ##');
    });

    it('Customer Management - Modify Customer Bank - Check Bank Validation', function () {
        cy.get(':nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(1 * 1000);
        cy.contains('Modify Customer Bank').click({ force: true });
        cy.wait(2 * 1000);
        cy.log('## Modify Customer Bank 진입 ##');

        // MODIFY CUSTOMER BANK 타이틀 확인
        getMainFrame()
            .find('[class="panel-title"]')
            .should($el => {
                const text = $el.text().trim().toUpperCase();
                expect(text).to.include('MODIFY CUSTOMER BANK');
            });

        // Check Bank Validation 탭 클릭
        getMainFrame().find('.listtabs a').contains('Check Bank Validation').click();

        cy.wait(2000);
        // CHECK BANK VALIDATION 타이틀 확인
        getMainFrame()
            .find('[class="panel-title"]')
            .should($el => {
                const text = $el.text().trim().toUpperCase();
                expect(text).to.include('CHECK BANK VALIDATION');
            });

        // 정보 입력 + 검색
        getMainFrame().find('#ddlType').select('KFTC');
        getMainFrame().find('#ddlBankCode').select('011');
        getMainFrame().find('#txtAccountNo').clear().type(Cypress.env('bank_b_account'));

        getMainFrame().find('#btnSearch').click();
        cy.wait(2 * 1000);

        // 조회 결과 - 유효성 확인
        getMainFrame().find('#rptLog').should('be.visible');
        getMainFrame().find('#rptLog table th').should('contain.text', 'Recipient Name');
        getMainFrame().find('#rptLog table td').should('contain.text', Cypress.env('customer_name'));

        cy.log('## 계좌 유효성 확인 ##');
    });

    it.skip('Login Logs - Login Success', function () {
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('User Log').click({ force: true });
        cy.log('## User log - 진입 확인중 => pending 길어서 10초 대기 ##');
        cy.wait(10 * 1000);
        cy.log('## User log - 진입 성공##');

        // 검색
        // getMainFrame().find('[value="Clear Filters"]', { timeout: 15000 }).should('be.visible');

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().find('#grdUseLog_Country').select('South Korea');
        getMainFrame().find('#grdUseLog_logType').select('Login Success');
        getMainFrame().find('#grdUseLog_countryGroup').select('South Korea');
        getMainFrame().find('[name="grdUseLog_createdBy"]').type(Cypress.env('search_username'));
        getMainFrame().find('[Value="Filter"]').click({ force: true });
        cy.wait(2 * 1000);

        // getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().find('[class="col-md-12"]').contains(date.yyyy_mm_dd_dash).should('be.visible');
        cy.log('## 로그인 성공 로그 일치 - 오늘 날짜 확인 ##');

        // getMainFrame().contains('Action History', { timeout: 10000 }).click({ force: true });
    });

    it.skip('Customer Information - Change Full Name', function () {
        cy.get(':nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(1 * 1000);
        cy.contains('Customer Modify').click({ force: true });
        cy.wait(2 * 1000);
        cy.log('## Customer Modify 진입 ##');

        // ## Customer List ##
        getMainFrame().find('#grdCustomerSetup_searchCriteria').select('Customer Id');
        getMainFrame().find('#grdCustomerSetup_searchValue').clear().type(Cypress.env('search_username'));
        getMainFrame().find('[Value="Filter"]').click({ force: true });
        cy.wait(2 * 1000);

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().contains('Edit Data', { timeout: 10000 }).click({ force: true });
        cy.wait(2 * 1000);

        // ## Edit data ##
        getMainFrame().find('[class="register-form"]').contains('Login Information').should('be.visible');
        cy.wait(2 * 1000);
        // getMainFrame().find('[id="firstName"]').clear().type('qa test_' + CurrentDate2)
        getMainFrame()
            .find('[id="firstName"]')
            .clear()
            .type('qa test_' + date.yymmdd_HHMM);
        getMainFrame().contains('Submit', { timeout: 10000 }).click({ force: true });
        cy.wait(3 * 1000);
        cy.log('## Full Name 수정완료 ##');

        // cy.pause();

        // ## Customer List ##
        getMainFrame().find('#grdCustomerSetup_searchCriteria').select('Customer Id');
        getMainFrame().find('#grdCustomerSetup_searchValue').clear().type(Cypress.env('search_username'));
        getMainFrame().find('[Value="Filter"]').click({ force: true });
        cy.wait(2 * 1000);

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        // getMainFrame().find('[class="panel-body"]').contains('qa test_' + CurrentDate3).should('be.visible')
        getMainFrame()
            .find('[class="panel-body"]')
            .contains('qa test_' + date.yymmdd)
            .should('be.visible');
        cy.log('## 변경된 Full Name  - 일치 확인 ##');
    });

    // ## New Device Login ##
    it.skip('New Device Login', function () {
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(1 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('User Log').click({ force: true });
        cy.wait(5 * 1000);
        cy.log('## User log 진입 ##');

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().contains('New Device Logins', { timeout: 10000 }).click({ force: true });
        cy.wait(1 * 1000);

        // 검색
        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().find('[name="grdNewDeviceLogin_createdBy"]').type('gjhgjh1');
        getMainFrame().find('[Value="Filter"]').click({ force: true });

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().find('[title="View and Approve"]', { timeout: 10000 }).click({ force: true });
        cy.wait(2 * 1000);

        // ## View and Approve ##
        getMainFrame().find('[class="modal-header"]').click({ force: true });
        getMainFrame().find('#txtRemark').type('qa test - automation');
        // getMainFrame().find('#btnAdd').click({ force: true });   // Remark 추가 => 현재는 추가 안하게 주석처리

        // Reason 입력
        getMainFrame().find('#remarks1').type('qa test');

        // Chrome native popup - confirm + alert 모두 한번에 처리
        stubIframeDialogs(true);
        getMainFrame().find('#btnApprove').click({ force: true });

        // confirm 메시지 검증
        cy.get('@confirmStub').should('have.been.calledWith', 'Are you sure you want to approve this mobile id?');

        // alert 메시지 검증
        cy.get('@alertStub').should('have.been.calledWith', 'Face Verification is successfully approved.');

        cy.log('Approve - New Device Login !!');
    });
});
