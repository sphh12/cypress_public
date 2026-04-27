import { getMainFrame, stubIframeDialogs, validatePage } from '../../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('SYSTEM SECURITY', () => {
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

    it('Core System Logs - API Logs', function () {
        // Step 1: 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Core System Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('API Logs').click({ force: true });
        cy.log('## API Logs - 진입 성공 ##');

        validatePage();
    });

    it('Core System Logs - TxnErrorLogs', function () {
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Core System Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('TxnErrorLogs').click({ force: true });
        cy.log('## TxnErrorLogs - 진입 성공 ##');

        validatePage();
    });

    it('Mobile App Logs - Customer Logs', function () {
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer Logs').click({ force: true });
        cy.log('## Customer Logs - 진입 성공 ##');

        validatePage();
    });

    it('Mobile App Logs - KFTC Logs', function () {
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('KFTC Logs').click({ force: true });
        cy.log('## KFTC Logs - 진입 성공 ##');

        validatePage();
    });

    it('Mobile App Logs - Error Logs', function () {
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Error Logs').click({ force: true });
        cy.log('## Error Logs - 진입 성공 ##');

        validatePage();
    });
});
