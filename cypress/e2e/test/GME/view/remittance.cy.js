import { getMainFrame, stubIframeDialogs, validatePage } from '../../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('REMITTANCE', () => {
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

    it('Compliance - AML Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Compliance').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('AML Report').click({ force: true });
        cy.log('## AML Report - 진입 성공 ##');

        validatePage();
    });

    it('Compliance - Approve OFAC Compliance', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Compliance').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Approve OFAC Compliance').click({ force: true });
        cy.log('## Approve OFAC Compliance - 진입 성공 ##');

        validatePage();
    });

    it('Compliance - Compliance Limit Setup', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Compliance').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Compliance Limit Setup').click({ force: true });
        cy.log('## Compliance Limit Setup - 진입 성공 ##');

        validatePage();
    });

    it('Compliance - Compliance Release Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Compliance').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Compliance Release Report').click({ force: true });
        cy.log('## Compliance Release Report - 진입 성공 ##');

        validatePage();
    });

    it('Compliance - Rele Setup', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Compliance').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Rule Setup').click({ force: true });
        cy.log('## Rule Setup - 진입 성공 ##');

        validatePage();
    });

    it('Compliance - Search Compliance Release TXN', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Compliance').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Search Compliance Release TXN').click({ force: true });
        cy.log('## Search Compliance Release TXN - 진입 성공 ##');

        validatePage();
    });

    it('Compliance - Voice Phishing Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Compliance').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Voice Phishing Report').click({ force: true });
        cy.log('## Voice Phishing Report - 진입 성공 ##');

        validatePage();
    });

    it('OFAC Management - Import Data', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('OFAC Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Import Data').click({ force: true });
        cy.log('## Import Data - 진입 성공 ##');

        validatePage();
    });

    it('OFAC Management - Manual Entry (OFAC)', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('OFAC Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Manual Entry (OFAC)').click({ force: true });
        cy.log('## Manual Entry (OFAC) - 진입 성공 ##');

        validatePage();
    });

    it('OFAC Management - OFAC Tracker', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('OFAC Management').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('OFAC Tracker').click({ force: true });
        cy.log('## OFAC Tracker - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Branch KPI Reports', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Branch KPI Reports').click({ force: true });
        cy.log('## Branch KPI Reports - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Transaction/Registration Group Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Transaction/Registration Group Report').click({ force: true });
        cy.log('## Transaction/Registration Group Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Customer Approved User wise', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer Approved User wise').click({ force: true });
        cy.log('## Customer Approved User wise - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Transaction/Registration Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Transaction/Registration Report').click({ force: true });
        cy.log('## Transaction/Registration Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Referral Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Referral Report').click({ force: true });
        cy.log('## Referral Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Gold Card Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Gold Card Report').click({ force: true });
        cy.log('## Gold Card Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Partnerwise Income Exp Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Partnerwise Income Exp Report').click({ force: true });
        cy.log('## Partnerwise Income Exp Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Settlement Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Settlement Report').click({ force: true });
        cy.log('## Settlement Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - NativeCountrywise TXN Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('NativeCountrywise TXN Report').click({ force: true });
        cy.log('## NativeCountrywise TXN Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Regional Transaction/Registration Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Regional Transaction/Registration Report').click({ force: true });
        cy.log('## Regional Transaction/Registration Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Staffs Incentive', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Staffs Incentive').click({ force: true });
        cy.log('## Staffs Incentive - 진입 성공 ##');

        validatePage();
    });

    it('Reports - Local Txn Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Local Txn Report').click({ force: true });
        cy.log('## Local Txn Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - TempHold Inbound txn report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('TempHold Inbound txn report').click({ force: true });
        cy.log('## TempHold Inbound txn report - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - TempHold txn report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('TempHold txn report').click({ force: true });
        cy.log('## TempHold txn report - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - Transaction Analysis Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Transaction Analysis Report').click({ force: true });
        cy.log('## Transaction Analysis Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - Cancel Transaction Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Cancel Transaction Report').click({ force: true });
        cy.log('## Cancel Transaction Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - Transaction Report Master', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Transaction Report Master').click({ force: true });
        cy.log('## Transaction Report Master - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - Transaction Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Transaction Report').click({ force: true });
        cy.log('## Transaction Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - Unpaid Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Unpaid Report').click({ force: true });
        cy.log('## Unpaid Report - 진입 성공 ##');

        validatePage();
    });

    it('Reports-Master - Paying Agent Settlement Report', function () {
        cy.get('#navbar-main > .nav > :nth-child(3) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Reports-Master').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Paying Agent Settlement Report').click({ force: true });
        cy.log('## Paying Agent Settlement Report - 진입 성공 ##');

        validatePage();
    });
});
