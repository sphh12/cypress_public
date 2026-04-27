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

    it('Customer Management - GME Pay / Point Statement', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('GME Pay / Point Statement');
        cy.log('## GME Pay / Point Statement - 진입 성공 ##');

        validatePage();
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
    });

    it('Customer Management - Customer Statement', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer Statement').click({ force: true });
        cy.log('## Customer Statement - 진입 성공 ##');

        validatePage();
    });

    it('Customer Management - Receiver Details', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Customer Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Receiver Details').click({ force: true });
        cy.log('## Receiver Details - 진입 성공 ##');

        validatePage();
    });

    it('KJ API - Customer ID Verification', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('KJ API').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer ID Verification').click({ force: true });
        cy.log('## Customer ID Verification - 진입 성공 ##');

        validatePage();
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
    });

    it('Online Customers - Expired Passport', function () {
        cy.get('#navbar-main > .nav > :nth-child(1) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Online Customer').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Expired Passport').click({ force: true });
        cy.log('## Expired Passport - 진입 성공 ##');

        validatePage();
    });
});
