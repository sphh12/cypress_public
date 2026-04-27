const { loginModule } = require('../module/manager.module.js');

describe('setting', () => {
    beforeEach(() => {
        loginModule.login(Cypress.env('Prod'), Cypress.env('id_test02'), Cypress.env('pw_public'));
    });

    it('내 정보', () => {
        // 설정 - 내 정보 진입
        cy.get('.gnb__user-info > .btn').click();
        cy.get('.gnb__user-info > .drop-container > :nth-child(1)').click();

        // 내정보 > 이름 변경
        cy.get('#userName').click().clear();
        const dayjs = require('dayjs');
        cy.get('#userName').type('테스트_' + dayjs().format('MMDD_hh:mm'));
        cy.get('.user-info-form__button-box > .btn').click();
        cy.get('.user-info-form__button-box > .btn').should('be.disabled');

        // 내정보 > 업종 변경
        cy.log('업종');
        const options = ['1001', '1002', '1003', '1004', '1005', '1006', '1007', '1008', '1009', '1010'];

        // 초기값 가져오기

        cy.get('#industry').then($select => {
            const initialValue = $select.val();

            function selectRandomOption() {
                const randomIndex = Math.floor(Math.random() * options.length);
                const randomOption = options[randomIndex];

                // 초기값과 랜덤값이 동일한지 확인
                if (randomOption === initialValue) {
                    // 동일하면 다시 실행
                    selectRandomOption();
                } else {
                    // 다르면 랜덤값 선택
                    cy.get('#industry').select(randomOption);
                    cy.get('.user-info-form__button-box > .btn').click();
                    cy.get('.user-info-form__button-box > .btn').should('be.disabled');
                }
            }

            selectRandomOption();
        });

        cy.log('직업');
        // 내정보 > 직업 변경
        const options1 = ['1101', '1102', '1103', '1104', '1105', '1106', '1107', '1108', '1109', '1110', '1111', '1112', '1113'];

        // 초기값 가져오기
        cy.get('#job').then($select => {
            const initialValue1 = $select.val();

            function selectRandomOption1() {
                const randomIndex1 = Math.floor(Math.random() * options1.length);
                const randomOption1 = options1[randomIndex1];

                // 초기값과 랜덤값이 동일한지 확인
                if (randomOption1 === initialValue1) {
                    // 동일하면 다시 실행
                    selectRandomOption1();
                } else {
                    // 다르면 랜덤값 선택
                    cy.get('#job').select(randomOption1);
                    cy.get('.user-info-form__button-box > .btn').click();
                    cy.get('.user-info-form__button-box > .btn').should('be.disabled');
                }
            }

            selectRandomOption1();
        });

        cy.log('사용목적');
        // 내정보 > 사용목적 변경
        const options2 = [
            '.checkbox-round__wrap > :nth-child(1) > label',
            '.checkbox-round__wrap > :nth-child(2) > label',
            '.checkbox-round__wrap > :nth-child(3) > label',
            '.checkbox-round__wrap > :nth-child(4) > label',
            '.checkbox-round__wrap > :nth-child(5) > label',
        ];
        const randomIndex2 = Math.floor(Math.random() * options2.length);
        const randomOption2 = options2[randomIndex2];
        cy.get(randomOption2).click();
        cy.get('.user-info-form__button-box > .btn').click();
        cy.get('.user-info-form__button-box > .btn').should('be.disabled');

        cy.log('수신 동의');
        // 내정보 > 수신동의
        cy.get(':nth-child(1) > dl > dt').then($elem => {
            const text = $elem.text();

            if (text.includes('동의 날짜')) {
                // 수신동의 토글 - ON
                cy.log('수신동의 토글 - ON');
                cy.get(':nth-child(1) > dl > dt').should('contain.text', '동의 날짜');
                cy.get('.toggle-switch > div').click();
                cy.get(':nth-child(1) > dl > dt').should('not.contain.text', '동의 날짜');
                cy.log('수신동의 토글 - OFF');
            } else {
                // 수신동의 토글 - OFF
                cy.log('수신동의 토글 - OFF');
                cy.get(':nth-child(1) > dl > dt').should('not.contain.text', '동의 날짜');
                cy.get('.toggle-switch > div').click();
                cy.get(':nth-child(1) > dl > dt').should('contain.text', '동의 날짜');
                cy.log('수신동의 토글 - ON');
            }
        });
    });

    it('서비스 설정', () => {
        // 파일 첨부
        cy.get('.chat-file-button').selectFile('cypress/fixtures/(Doc-01)위험관리_계획서_및_보고서_작성_가이드.pdf', {
            force: true,
        });
        cy.contains('업로드가 성공하였습니다.', { timeout: 20 * 1000 });
        cy.log('파일첨부 완료');

        cy.get('#question-textarea').type('위험 관리 보고서가 무엇인가요?');
        cy.get('.chat-send-button').click();
        cy.get('.answer-recommend', { timeout: 20 * 1000 });

        // 설정 진입
        cy.get('.gnb__user-info > .btn').click();
        cy.get('.gnb__user-info > .drop-container > :nth-child(1)').click();

        cy.get('.modal-setting__nav--main > :nth-child(2)').click();
        cy.wait(3 * 1000);

        // 파일 저장 용량 추출
        cy.get('.disk-status > .service-status__info > dt').then($elem => {
            const elementText = $elem.text().trim();
            cy.log(`Element text: ${elementText}`);

            if (!isNaN(elementText)) {
                const value = Number(elementText);
                cy.log(`Parsed value: ${value}`);

                // 요소 값이 0이 아닌지 확인
                if (value !== 0) {
                    cy.log(`Parsed value는 0이 아님 => 파일 저장 용량 사용중`);

                    // 파일 용량 초기화
                    cy.get(':nth-child(1) > section > .btn').click();
                    cy.get('dt').contains('삭제하시겠습니까?');
                    cy.get('.dialog-footer > .danger').click();
                    cy.get('.go3958317564 > button').contains('모든 파일 삭제에 성공했습니다.');
                    cy.wait(2 * 1000);

                    // .disk-status > .service-status__info > dt 요소 선택
                    cy.get('.disk-status > .service-status__info > dt').then($elem => {
                        const elementText2 = $elem.text().trim();
                        cy.log(`Element text2: ${elementText2}`);

                        // 텍스트가 숫자인지 확인
                        if (!isNaN(elementText2)) {
                            const value2 = Number(elementText2);
                            cy.log(`Parsed value2: ${value2}`);

                            // 값이 0인지 확인
                            expect(value2).to.equal(0);
                            cy.log(`Parsed value2는 0 => 파일 용량 초기화 완료 !`);
                        } else {
                            // 텍스트가 숫자가 아닌 경우 에러 처리
                            throw new Error('Element text is not a number');
                        }
                    });
                } else {
                    cy.log(`Parsed value는 0 => 파일 저장 용량 사용안함`);
                    return;
                }

                // 숫자가 0이 아닌지 단언
                cy.log(`Parsed value: ${value}`);
                expect(value).to.not.equal(0);
            } else {
                // 텍스트가 숫자가 아닌 경우 에러 처리
                throw new Error('Element text is not a number');
            }
        });

        /*   cy.log(`Parsed value-2: ${value}`);
    expect(value).to.equal(0); */

        //////////////////////////////////////////////////////////////

        // 서비스 설정 > 모든 채팅 삭제
        cy.log('## 모든 채팅 삭제 ##');
        cy.get('.modal-setting__nav--main > :nth-child(2)').click();
        cy.get(':nth-child(2) > section > .btn').click();
        cy.get('dt').contains('삭제하시겠습니까?');
        cy.wait( 2* 1000)
        cy.get('.dialog-footer > .danger').click();
        cy.get('.go3958317564 > button').contains('모든 채팅방 삭제에 성공했습니다.');

        cy.get('.close-button > .fa-light').click();

        // 채팅방 목록이 존재하지 않는지 확인
        cy.get('.chat-history__list').within(() => {
            cy.get('.chat-history__list-item').should('not.exist');
        });
    });
});
