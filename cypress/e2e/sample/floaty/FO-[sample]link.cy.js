const { loginModule } = require('../module/manager.module.js');

describe('link', () => {
    beforeEach(() => {
        loginModule.login(Cypress.env('Prod'), Cypress.env('id_test01'), Cypress.env('pw_public'));
    });

    it('채팅 링크 공유', () => {
        //새 채팅
        cy.log('New Chat');
        cy.get('.chatting-lnb__button > .btn').click();
        cy.contains('채팅 링크 공유').should('not.exist');
        cy.get('#question-textarea').type('신규 사업 아이템 발굴을 위해 어떤 프로세스를 거쳐야 할까요?');
        cy.get('.chat-send-button').click();
        cy.wait(20 * 1000);
        cy.contains('채팅 링크 공유').should('exist');
        cy.get('.floaty-info > div > button').click();
        cy.get('.dialog-message > dt').contains('채팅을 공유하시겠습니까?');
        cy.get('.dialog-footer > .primary').click();
        cy.get('.go3958317564 > button').contains('지금부터 링크를 가진 모든 사용자가 채팅을 볼 수 있습니다.');

        cy.contains('링크 복사').should('exist');
        cy.contains('공유 중단').should('exist');
        cy.log('링크 복사-붙여넣기 수정 - 클립보드 미지원 문제로 일단 제외');
        cy.log('복사/ 링크 진입 추가 수정 필요');

        return;

        function copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text).catch(err => {
                    console.error('Failed to write to clipboard: ', err);
                    // 필요 시 다른 방법으로 처리
                });
            } else {
                const el = document.createElement('textarea');
                el.value = text;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                return Promise.resolve(); // execCommand는 비동기가 아니므로 즉시 해결된 프로미스를 반환합니다.
            }
        }

        cy.get('.floaty-info > div > :nth-child(1)')
            .click()
            .then($el => {
                const textToCopy = $el.text();

                cy.window().then(win => {
                    return copyToClipboard(textToCopy).then(() => {
                        cy.get('.feedback-button > :nth-child(4) > button').click();
                        cy.get('#question-textarea').focus().type('{ctrl+v}');
                        cy.get('.chat-send-button').click();

                        cy.window().its('navigator.clipboard').invoke('readText').should('equal', textToCopy);
                    });
                });

                // 링크 복사
                // 클립보드에 텍스트를 직접 복사하는 함수
                // function copyToClipboard(text) {
                //     const el = document.createElement('textarea');
                //     el.value = text;
                //     document.body.appendChild(el);
                //     el.select();
                //     document.execCommand('copy');
                //     document.body.removeChild(el);
                // }

                // cy.get('.floaty-info > div > :nth-child(1)')
                //     .click()
                //     .then($el => {
                //         // 요소의 텍스트를 추출하여 클립보드에 직접 복사
                //         const textToCopy = $el.text();

                //         // window 객체에 접근하여 클립보드에 텍스트 복사
                //         cy.window().then(win => {
                //             // 클립보드에 텍스트 복사
                //             copyToClipboard(textToCopy);
                //         });

                //         cy.get('.feedback-button > :nth-child(4) > button').click();
                //         cy.get('#question-textarea').type('{ctrl+v}');
                //         cy.get('.chat-send-button').click();

                //         // 클립보드에 복사된 텍스트를 검증
                //         cy.window().its('navigator.clipboard').invoke('readText').should('equal', textToCopy);
            });

        // 공유 중단
        cy.get('.floaty-info > div > :nth-child(2)').click();
        cy.log('공유 중단');
        cy.contains('링크 복사').should('not.exist');
        cy.contains('공유 중단').should('not.exist');
    });
});
