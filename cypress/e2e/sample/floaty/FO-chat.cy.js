const { loginModule } = require('../module/manager.module.js');

describe('chat', () => {
    beforeEach(() => {
        loginModule.login(Cypress.env('Prod'), Cypress.env('id_test01'), Cypress.env('pw_public'));
    });

    it('문서 검색', () => {
        // 새 채팅
        cy.get('.chatting-lnb__button > .btn').click();

        // 파일 첨부
        cy.get('.chat-file-button').selectFile('cypress/fixtures/(Doc-01)위험관리_계획서_및_보고서_작성_가이드.pdf', {
            force: true,
        });
        cy.contains('업로드가 성공하였습니다.', { timeout: 30 * 1000 });
        cy.log('파일첨부 성공 !');

        //////////////////////////////////////////////////////////////////////////////////////////////////////
        // 파일 첨부 - 드래그앤드랍
        // cy.get(".chat-file-button").selectFile("cypress/fixtures/sample1.pdf", {action: "drag-drop"});
        // cy.contains("업로드가 성공하였습니다.", {timeout: 20 * 1000});
        ////////////////////////////////////////////////////////////////////////////////////////////////////////

        // 첨부 파일 리스트 확인
        cy.get('.selector-button__name').click();
        cy.get('.uploaded-list').contains('(Doc-01)위험관리_계획서_및_보고서_작성_가이드.pdf');

        // 질문 - 문서 검색
        cy.get('body').click(0, 0);
        cy.get('#question-textarea').type('위험 관리 보고서가 무엇인가요?');
        cy.get('.chat-send-button').click();
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('exist');

        // 답변 확인 - answer-recommend 표시 확인
        cy.get('.answer-recommend', { timeout: 60 * 1000 });
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('not.exist');
        cy.get('.answer-box').should('not.contain', '답변 생성에 실패했습니다.');

        // 채팅방 이름 변경
        cy.get('.current > .drop-wrap > .btn-ellipsis > .fa-light').click({ force: true });
        cy.get('.current > .drop-wrap > .drop-container > :nth-child(2)').click();
        cy.get('.name-change').clear();

        // 현재 시간을 채팅방으로 이름으로 설정
        const dayjs = require('dayjs');
        cy.get('.name-change').type('Doc/' + dayjs().format('YYMMDD_hh:mm') + '{enter}');
        

        // 각주 클릭 - 미리보기
        cy.get(':nth-child(1) > p > .footnote-button').first().click({ force: true });
        cy.get('.context-box').should('be.visible');

        // 각주 타이틀과 참조 타이틀 일치 확인
        cy.get('.context-box__title')
            .invoke('text')
            .then(contextBoxText => {
                cy.get(':nth-child(1) > .answer-source__item--text > p').invoke('text').should('eq', contextBoxText);
                cy.get('.selector-button__name').click();
            });
    });

    it('웹 검색', () => {
        // 웹 검색
        cy.get('.chatting-lnb__button > .btn').click();
        cy.get('.web-search-button__toggle').click();
        cy.get('#question-textarea').type('신규 사업 아이템 발굴을 위해 어떤 프로세스를 거쳐야 할까요?');
        cy.get('.chat-send-button').click();
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('exist');

        // 답변 확인 - answer-recommend 표시 확인
        cy.get('.answer-recommend', { timeout: 60 * 1000 });
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('not.exist');
        cy.get('.answer-box').should('not.contain', '답변 생성에 실패했습니다.');

        // 웹 검색 아이콘 확인
        // cy.get('body').trigger('mousedown');
        cy.wait(2 * 1000);
        cy.get(':nth-child(1)').should('be.visible');
        cy.get('.answer-source').should('be.visible');

        /////////// 복사 확인  //////////////////////////////////////////////////////////////////////
        // cy.get(".feedback-button > :nth-child(2) > button", {  timeout: 60 * 1000, }).click()

        // cy.get('.feedback-button > :nth-child(4) > button').click()
        // cy.get('#question-textarea').type("{ctrl+v}")
        ///////////////////////////////////////////////////////////////////////////////////////////

        // 채팅방 이름 변경
        cy.get('.current > .drop-wrap > .btn-ellipsis > .fa-light').click({ force: true });
        cy.get('.current > .drop-wrap > .drop-container > :nth-child(2)').click();
        cy.get('.name-change').clear();

        // 현재 시간을 채팅방으로 이름으로 설정
        const dayjs = require('dayjs');
        cy.get('.name-change').type('Web/' + dayjs().format('YYMMDD_hh:mm') + '{enter}');
        
        //각주 선택
        cy.get(':nth-child(1) > p > .footnote-button').first().click({ force: true });
        cy.get('.context-box').should('be.visible');

        // 각주 타이틀과 참조 타이틀 비교
        // cy.get('.context-box__title')
        //     .invoke('text')
        //     .then(contextBoxText => {
        //         cy.get(':nth-child(1) > .answer-source__item--text > p').invoke('text').should('eq', contextBoxText);
        //         // cy.get('.answer-source > ul').invoke('text').should('eq', contextBoxText);
        //     });


        cy.get('.context-box__title')
            .invoke('text')
            .then(contextBoxText => {
                // 각 항목을 배열로 만들어 순회
                const itemSelectors = [
                    ':nth-child(1) > .answer-source__item--text > p',
                    ':nth-child(2) > .answer-source__item--text > p',
                    ':nth-child(3) > .answer-source__item--text > p',
                    ':nth-child(4) > .answer-source__item--text > p',
                    ':nth-child(5) > .answer-source__item--text > p'
                ];

        // 일치 여부를 확인할 변수를 초기화
        let isMatchFound = false;

        // 각 항목을 순회하며 일치 여부 확인
        const checkItems = itemSelectors.map(selector => {
            return cy.get(selector).invoke('text').then(answerSourceText => {
                if (answerSourceText === contextBoxText) {
                    isMatchFound = true; // 일치하는 경우 true로 설정
                }
            });
        });

        // 모든 항목의 확인이 끝난 후 패스 여부 결정
        cy.wrap(checkItems).then(() => {
            if (isMatchFound) {
                cy.log('일치하는 항목을 찾았습니다. 테스트 패스.');
            } else {
                throw new Error('일치하는 항목이 없습니다. 테스트 실패.');
            }
        });
        });      

    });

    it('GPT - 4o mini', () => {
        // GPT4o mini 질문
        cy.get('.chatting-lnb__button > .btn').click();
        cy.get('.select-form__button').contains('GPT-4o mini');
        cy.get('#question-textarea').type('신규 사업 아이템 발굴을 위해 어떤 프로세스를 거쳐야 할까요?');
        cy.get('.chat-send-button').click();
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('exist');

        // 답변 확인 - answer-recommend 표시 확인
        cy.get('.answer-recommend', { timeout: 60 * 1000 });
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('not.exist');
        cy.get('.answer-box').should('not.contain', '답변 생성에 실패했습니다.');
        cy.get('.tag').contains('GPT-4o mini');

        // 채팅방 이름 변경
        cy.get('.current > .drop-wrap > .btn-ellipsis > .fa-light').click({ force: true });
        cy.get('.current > .drop-wrap > .drop-container > :nth-child(2)').click();
        cy.get('.name-change').clear();

        // 현재 시간을 채팅방으로 이름으로 설정
        const dayjs = require('dayjs');
        cy.get('.name-change').type('GPT-4o mini/' + dayjs().format('YYMMDD_hh:mm') + '{enter}');
        
        // 긍정 피드백
        cy.get('.feedback-button > :nth-child(2) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(1) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(2) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(3) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(4) > button').click()
        cy.get('div > input').type("자동화 테스트 - 긍정 피드백")
        cy.get('.feedback-box__send-button > .btn').click()
        cy.get('.go3958317564 > button').contains("피드백을 남겨주셔서 감사합니다")

    });

    it('GPT - 4o', () => {
        // GPT-4o 질문
        cy.get('.chatting-lnb__button > .btn').click();
        cy.get('.select-form__button').click();
        cy.get('.select-form__drop-box > ul > :nth-child(2)').click();
        cy.get('.select-form__button').contains('GPT-4');
        cy.get('#question-textarea').type('신규 사업 아이템 발굴을 위해 어떤 프로세스를 거쳐야 할까요?');
        cy.get('.chat-send-button').click();
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('exist');

        // 답변 확인 - answer-recommend 표시 확인
        cy.get('.answer-recommend', { timeout: 60 * 1000 });
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('not.exist');
        cy.get('.answer-box').should('not.contain', '답변 생성에 실패했습니다.');
        cy.get('.tag').contains('GPT-4');

        // 채팅방 이름 변경
        cy.get('.current > .drop-wrap > .btn-ellipsis > .fa-light').click({ force: true });
        cy.get('.current > .drop-wrap > .drop-container > :nth-child(2)').click();
        cy.get('.name-change').clear();

        // 현재 시간을 채팅방으로 이름으로 설정
        const dayjs = require('dayjs');
        cy.get('.name-change').type('GPT-4/' + dayjs().format('YYMMDD_hh:mm') + '{enter}');

        // 부정 피드백
        cy.get('.feedback-button > :nth-child(3) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(1) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(2) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(3) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(4) > button').click()
        cy.get('div > input').type("자동화 테스트 - 부정 피드백")
        cy.get('.feedback-box__send-button > .btn').click()
        cy.get('.go3958317564 > button').contains("피드백을 남겨주셔서 감사합니다")

        // 재생성
        cy.get('.feedback-button > :nth-child(1) > button').click()
        cy.wait(2 * 1000)
        cy.get('.answer-recommend', { timeout: 60 * 1000 });
        cy.get('.answer-box').contains('질문을 꼼꼼히 분석 중입니다.').should('not.exist');
        cy.get('.answer-box').should('not.contain', '답변 생성에 실패했습니다.');
        cy.log("재생성 완료")
    });
});
