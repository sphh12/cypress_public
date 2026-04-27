describe('프롬프트 관리', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('ProdAdmin'));
        cy.wait(3 * 1000);
        cy.get("#username", { timeout: 10 * 1000 }).type(Cypress.env('admin')); // 이메일 입력
        cy.get("#password", { timeout: 10 * 1000 }).type(Cypress.env('pw_admin')); // 비밀번호 입력
        cy.get(".btn", { timeout: 10 * 1000 }).click();
        cy.wait(2 * 1000);
        cy.log("로그인");
    });

    it('프롬프트 등록', () => {
        cy.contains("프롬프트 관리").click(); 
        cy.wait(2 * 1000)
        cy.get('h1').contains("프롬프트 관리")
        cy.get('tbody > :nth-child(1) > :nth-child(2)', { timeout: 60 * 1000 }); // 조회 => 데이터 존재 확인 
        cy.log("조회 - 데이터 존재 확인")
        cy.contains("신규 등록").click()
        cy.get('[name="apiName"]').type('자동화 테스트용 프롬프트');
        cy.get('.MuiSelect-select').click();
        cy.get('[data-value="QA"]').click();
        cy.get('[name="description"]').type('테스트용 프롬프트 - ASDF asdf !@#$');
        cy.get('[name="promptText"]').type('안녕하세요, 반갑습니다 !');
        cy.wait(3 * 1000)
        cy.get('.table-buttons').find(':nth-child(2) > .MuiButton-contained').click()
        cy.get('.dialog-buttons > .MuiButton-contained').click()
        cy.get('.go2072408551').contains("생성 되었습니다")
    })

    it('프롬프트 수정', () => {
        cy.contains("프롬프트 관리").click(); 
        cy.wait(2 * 1000)
        cy.get('h1').contains("프롬프트 관리")
        cy.get(':nth-child(1) > .button-bg > .MuiButtonBase-root').click();
        cy.get('.table-primary > tbody > :nth-child(1) > .text-left').contains("자동화 테스트용 프롬프트")
        cy.get('.MuiButton-contained > .fa-regular').click();
        cy.get('[name="text"]').clear().type('안녕히 계세요, 즐거웠습니다. !');
        cy.wait(3 * 1000)
        cy.get('.table-buttons').find(':nth-child(2) > .MuiButton-contained').click()
        cy.get('.dialog-buttons > .MuiButton-contained').click()
        cy.get('.go2072408551').contains("수정되었습니다")    
    })

    it('프롬프트 삭제', () => {
        cy.contains("프롬프트 관리").click(); 
        cy.wait(2 * 1000)
        cy.get('h1').contains("프롬프트 관리")
        cy.get(':nth-child(1) > .button-bg > .MuiButtonBase-root').click();
        cy.get('.table-primary > tbody > :nth-child(1) > .text-left').contains("자동화 테스트용 프롬프트")
        cy.wait( 2 * 1000)
        cy.contains("삭제").click()
        cy.get('.dialog-buttons > .MuiButton-contained').click()
        cy.get('.go2072408551').contains("삭제 되었습니다")
    })
})
