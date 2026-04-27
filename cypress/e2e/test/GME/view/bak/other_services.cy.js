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
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('GMEPay').click({ force: true });
        cy.log('## GMEPay - 진입 성공 ##');

        validatePage();
    });

    it('Manual Reprocess', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Manual Reprocess').click({ force: true });
        cy.log('## Manual Reprocess - 진입 성공 ##');

        validatePage();
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
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Transportation Card').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('CashBee').click({ force: true });
        cy.log('## CashBee - 진입 성공 ##');

        validatePage();
    });

    it('Transportation Card - EasyGo', function () {
        cy.get('#navbar-main > .nav > :nth-child(6) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Transportation Card').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('EasyGo').click({ force: true });
        cy.log('## EasyGo - 진입 성공 ##');

        validatePage();
    });
});
