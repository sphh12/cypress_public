describe('NonLogin', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('Prod'));
    });

    it('추천질문 노출 확인', () => {
        //비로그인 상태 확인 - 로그인 버튼 표시
        cy.wait(2 * 1000);
        cy.get('.gnb__user-info > .btn').should('be.visible');
        //추천 질문 3건 표시 확인
        cy.get('.chat-intro-message__content > div > :nth-child(1)').should('be.visible');
        cy.get('.chat-intro-message__content > div > :nth-child(2)').should('be.visible');
        cy.get('.chat-intro-message__content > div > :nth-child(3)').should('be.visible');
    });

    it('로그인 유도 팝업 확인', () => {
        cy.wait(2 * 1000);
        cy.get('.chat-intro-message__profile > button').click(); //프로필 설정
        cy.contains('플로티의 모든 기능을 사용해 보세요!');
        cy.get('.fa-light').click();
        cy.get('.select-form__button').click(); //GPT-4 선택
        cy.get('.select-form__drop-box > :nth-child(3)').click();
        cy.contains('플로티의 모든 기능을 사용해 보세요!');
        cy.get('.fa-light').click();
        cy.get('.selector-button__name').click(); //내 문서
        cy.contains('플로티의 모든 기능을 사용해 보세요!');
        cy.get('.fa-light').click();
        cy.get('.web-search-button__toggle').click(); //웹 검색 토글
        cy.contains('플로티의 모든 기능을 사용해 보세요!');
        cy.get('.fa-light').click();
        cy.get('.chat-file-button').click(); //파일 첨부
        cy.contains('플로티의 모든 기능을 사용해 보세요!');
        cy.get('.fa-light').click();
    });

    it('비회원 채팅 횟수 제한 확인', () => {
        cy.wait(5 * 1000);

        // 숫자가 포함된 텍스트가 있는 요소 선택
        cy.get('p > :nth-child(2)').then($element => {
            // 요소의 텍스트 가져오기
            const initialText = $element.text();
            // 텍스트에서 숫자 추출 (예: "5/5"에서 "5" 추출)
            const initialNumber = parseInt(initialText.split('/')[0], 10);
            cy.log(`채팅 일일 사용량 - 초기값 : ${initialNumber}`);

            // 반복문을 통해 숫자가 0이 될 때까지 확인
            function checkNumber(currentNumber) {
                if (currentNumber <= 0) {
                    cy.get('.chat-send-button').should('be.disabled');
                    // cy.wait(10 * 1000);
                    // cy.get("#question-textarea").contains(   
                    //   "비회원은 하루 5회로 채팅이 제한됩니다"
                    // );

                    cy.log('채팅 일일 사용량 : 모두 사용 !!');
                    return;
                }

                // 질문 요청
                cy.get('#question-textarea').type(`GDP ${currentNumber}위 국가는?`);
                cy.get('.chat-send-button').click();

                cy.get('.answer-recommend', { timeout: 60 * 1000 });
                cy.wait( 2 * 1000)

                // 다시 숫자가 포함된 텍스트가 있는 요소 선택
                cy.get('p > :nth-child(2)').then($elementAfter => {
                    // 요소의 텍스트 가져오기
                    const updatedText = $elementAfter.text();
                    // 텍스트에서 숫자 추출 (예: "4/5"에서 "4" 추출)
                    const updatedNumber = parseInt(updatedText.split('/')[0], 10);

                    // 숫자가 감소했는지 확인
                    cy.log(`채팅 일일 사용량 - 잔여 : ${updatedNumber}`);
                    expect(updatedNumber).to.be.lessThan(currentNumber);

                    // 다음 숫자 확인을 위해 재귀 호출
                    checkNumber(updatedNumber);
                });
            }

            // 최초 숫자 확인을 시작
            checkNumber(initialNumber);
        });
    });
});
// })

