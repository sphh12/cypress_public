describe('모델 관리', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('ProdAdmin'));
        cy.wait(3 * 1000);
        cy.get("#username", { timeout: 10 * 1000 }).type(Cypress.env('admin')); // 이메일 입력
        cy.get("#password", { timeout: 10 * 1000 }).type(Cypress.env('pw_admin')); // 비밀번호 입력
        cy.get(".btn", { timeout: 10 * 1000 }).click();
        cy.wait(2 * 1000);
        cy.log("로그인");
    });

    it('모델 조회', () => {
        cy.contains("모델 관리").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("모델 관리")
      
        cy.get('.table-header').find('.numbering').then(($numbers) => {
          const numberOfNumbers = $numbers.length;
          cy.log(`numberOfNumbers: ${numberOfNumbers}`);

        //추후 수정 필요
          for (let i = 0; i < numberOfNumbers; i++) {
            cy.log(i)
            cy.log(`numberOfNumbers: ${numberOfNumbers}`);
            cy.get(`tbody > :nth-child(${i + 1}) > :nth-child(1)`).should('exist');
          }
        });

    })

    it('모델 수정', () => {
        cy.contains("모델 관리").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("모델 관리")
        cy.get(':nth-child(2) > .button-bg > .MuiButtonBase-root').click() // 상세보기
        cy.get(':nth-child(1) > .text-left').contains("text-embedding-3-small") // 모델 이름 확인
        cy.contains("수정").click() 
        cy.get('h1').contains("상세정보 수정")
        cy.get('[name="description"]').invoke('val').then((currentValue) => {
        cy.get('[name="description"]').clear().type(currentValue + '_test');
        cy.contains("저장").click()
        cy.get('.dialog-container').contains("저장").click()
        cy.get('.go2072408551').contains("수정되었습니다")
        cy.log("모델 정보 수정완료")


        // 기존값 복구
        cy.contains("수정").click() //수정
        cy.get('h1').contains("상세정보 수정")
        cy.get('[name="description"]').clear().type(currentValue);
        cy.contains("저장").click()
        cy.get('.dialog-container').contains("저장").click()
        cy.get('.go2072408551').contains("수정되었습니다")
        cy.log("기존값 복구")
        }); 
    })
})
