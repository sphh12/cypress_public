describe('관리자 관리', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('ProdAdmin'));
        cy.wait(3 * 1000);
        cy.get("#username", { timeout: 10 * 1000 }).type(Cypress.env('admin')); // 이메일 입력
        cy.get("#password", { timeout: 10 * 1000 }).type(Cypress.env('pw_admin')); // 비밀번호 입력
        cy.get(".btn", { timeout: 10 * 1000 }).click();
        cy.wait(2 * 1000);
        cy.get('h1').contains("회원 목록")
        cy.log("로그인");
    });

    it('관리자 조회', () => {
        cy.contains("관리자 관리").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("관리자 계정 관리")
        cy.get('tbody > :nth-child(1) > :nth-child(2)', { timeout: 60 * 1000 }); // 조회 => 데이터 존재 확인

        
        cy.get('[name="email"]').type('jhpark@deepnoid.com')
        cy.get('[style="padding-left: 0px;"] > .MuiButton-contained').click()
        cy.wait(2 * 1000)
        cy.get('tbody > tr > :nth-child(4)').contains("jhpark@deepnoid.com")
    })

    it('관리자 삭제', () => {
        cy.contains("관리자 관리").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("관리자 계정 관리")
        cy.get('[name="email"]').type('jhpark@deepnoid.com')
        cy.get('[style="padding-left: 0px;"] > .MuiButton-contained').click()
        cy.get('tbody > tr > :nth-child(4)').contains("jhpark@deepnoid.com")

        cy.get('tbody > tr > :nth-child(1) > .MuiButtonBase-root > .PrivateSwitchBase-input').click()
        cy.get('.right-control > .MuiButton-outlined').click()
        cy.get('.dialog-buttons > .MuiButton-contained').click()
        cy.get('.go2072408551').contains("삭제되었습니다")
        cy.get('.table-secondary > tbody > tr > td').contains("등록된 데이터가 없습니다")
    })

    it('관리자 등록', () => {
        cy.contains("관리자 관리").click();
        cy.wait(2 * 1000)
        cy.contains("관리자 등록").click();
        cy.wait(2 * 1000)
        cy.get('.MuiDialog-container').find('[name="email"]').type('jhpark@deepnoid.com');
        cy.wait(3 * 1000)
        cy.get('[style="padding-left: 0px; padding-right: 0px;"] > .MuiButton-contained').click()

        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인
        cy.wait(2 * 1000)
        cy.get('.modal-content').find('[name="listChk"]').click({force:true})


        //  cy.get(':nth-child(2) > .pagination > .MuiPagination-root > .MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root')
        // cy.get('[name="listChk"]').check()
        
        // cy.get(':nth-child(2) > .table-secondary > tbody > tr > :nth-child(1)').click({force : true})
       
        cy.get('.modal-buttons > .MuiButton-contained').click()
        cy.get('.go2072408551').contains("관리자가 추가 되었습니다")
        cy.log("관리자 등록 완료 !")

        //  조회 - 등록 확인
        cy.get('[name="email"]').type('jhpark@deepnoid.com')
        cy.get('[style="padding-left: 0px;"] > .MuiButton-contained').click()
        cy.wait(2 * 1000)
        cy.get('tbody > tr > :nth-child(4)').contains("jhpark@deepnoid.com")

    })
})
