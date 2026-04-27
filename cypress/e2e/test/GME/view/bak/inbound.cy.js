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
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Post Transaction').click({ force: true });
        cy.log('## Post Transaction - 진입 성공 ##');

        validatePage();
    });

    it('Search Transaction', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Search Transaction').click({ force: true });
        cy.log('## Search Transaction - 진입 성공 ##');

        validatePage();
    });

    it('Receiver Initiated Inbound - Route Inbound Partner', function () {
        cy.get('#navbar-main > .nav > :nth-child(5) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Receiver Initiated Inbound').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Route Inbound Partner').click({ force: true });
        cy.log('## Route Inbound Partner - 진입 성공 ##');

        validatePage();
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
