const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const CurrentDate = dayjs().tz('Asia/Seoul').format('YYYY.MM.DD');


describe('탈퇴 회원 목록', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('ProdAdmin'));
        cy.wait(3 * 1000);
        cy.get("#username", { timeout: 10 * 1000 }).type(Cypress.env('admin')); // 이메일 입력
        cy.get("#password", { timeout: 10 * 1000 }).type(Cypress.env('pw_admin')); // 비밀번호 입력
        cy.get(".btn", { timeout: 10 * 1000 }).click();
        cy.wait(2 * 1000);
        cy.log("로그인");
    });

    it('탈퇴 회원 조회 + 삭제', () => {
        cy.contains("탈퇴 회원 목록").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("탈퇴 회원 목록")

        // 탈퇴일 설정 - 오늘
        cy.get(':nth-child(1) > .MuiInputBase-root').last().click({force : true})
        cy.wait( 3* 1000)
        cy.get('.MuiPickersDay-today').click({force : true})
        cy.contains("OK").click()
        cy.get(':nth-child(3) > .MuiInputBase-root').click({force:true})
        cy.wait( 3* 1000)
        cy.get('.MuiPickersDay-today').click({force : true})
        cy.contains("OK").click()
         
        cy.get('.MuiSelect-select').click() // 탈퇴 사유
        cy.get('[data-value="1306"]').click()
        cy.get('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-1o6z5ng"]').type('@blondmail.com') // 이름
        cy.get('.table-buttons > :nth-child(2) > .MuiButton-contained').click(); // 검색

        // 탈퇴 회원 삭제 
        cy.get('tbody > :nth-child(1) > :nth-child(3)').contains('@blondmail.com')
        cy.get('thead > tr > :nth-child(1) > .MuiButtonBase-root > .PrivateSwitchBase-input').click()
        cy.contains("삭제").click()
        cy.get('.dialog-buttons > .MuiButton-contained').click()
        cy.get('.go2072408551').contains("삭제되었습니다")
        cy.get('.table-secondary > tbody > tr > td').contains("등록된 데이터가 없습니다")

        cy.contains("초기화").click()
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인
        cy.get('.table-secondary > tbody > tr > td').should('not.contain', '등록된 데이터가 없습니다');
    })
})
