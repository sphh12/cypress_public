import { getMainFrame, stubIframeDialogs } from '../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('GME - Core', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080); // 화면크기 설정
        cy.visit(Cypress.env('live_gme'));
        cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
        cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
        cy.get('[name="txtCompcode"]').type(Cypress.env('live_code_gme01'));
        cy.get('[name="btnLogin"]').click();
        cy.get('#chatBubbleImageId', { timeout: 10000 }).should('be.visible');
        cy.get('#gptcb-overlay', { timeout: 20000 }).should('not.exist'); // overlay 대기
        cy.log('## 로그인 성공 ##');
    });

    it('Login Logs - Login Success', function () {
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('User Log').click({ force: true });
        cy.log('## User log - 진입 확인중 => pending 길어서 10초 대기 ##');
        cy.wait(10 * 1000);
        cy.log('## User log - 진입 성공 ##');

        // 검색
        getMainFrame().find('[class="panel-title"]').click({ force: true });
        // getMainFrame().find('#grdUseLog_Country').select('South Korea');
        getMainFrame().find('#grdUseLog_logType').select('Login Success');
        // getMainFrame().find('#grdUseLog_countryGroup').select('South Korea');
        getMainFrame().find('[name="grdUseLog_createdBy"]').type(Cypress.env('search_username'));
        getMainFrame().find('[Value="Filter"]').click({ force: true });
        cy.wait(2 * 1000);

        getMainFrame().find('[class="col-md-12"]').contains(date.yyyy_mm_dd_dash).should('be.visible');
        cy.log('## 로그인 성공 로그 일치 - 오늘 날짜 확인 ##');
    });

    it('Customer Information - Change Full Name', function () {
        cy.get(':nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(1 * 1000);
        cy.contains('Customer Modify').click({ force: true });
        cy.wait(2 * 1000);
        cy.log('## Customer Modify 진입 ##');

        // Customer List - 검색
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

    it('New Device Login', function () {
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
        getMainFrame().find('[name="grdNewDeviceLogin_createdBy"]').type(Cypress.env('search_username'));
        getMainFrame().find('[Value="Filter"]').click({ force: true });

        getMainFrame().find('[class="panel-title"]').click({ force: true });
        getMainFrame().find('[title="View and Approve"]', { timeout: 10000 }).click({ force: true });
        cy.wait(2 * 1000);

        // View and Approve
        getMainFrame().find('[class="modal-header"]').click({ force: true });
        getMainFrame().find('#txtRemark').type('qa test - automation');

        // Reason 입력
        getMainFrame().find('#remarks1').type('qa test');

        // Chrome native popup - confirm + alert 모두 한번에 처리
        stubIframeDialogs(true);
        getMainFrame().find('#btnApprove').click({ force: true });

        // confirm 메시지 검증
        cy.get('@confirmStub').should('have.been.calledWith', 'Are you sure you want to approve this mobile id?');

        // alert 메시지 검증
        cy.get('@alertStub').should('have.been.calledWith', 'Face Verification is successfully approved.');

        cy.log('## Approve - New Device Login 완료 ##');
    });
});
