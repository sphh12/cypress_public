const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
// const { cli } = require('cypress');

dayjs.extend(utc);
dayjs.extend(timezone);


const CurrentDate = dayjs().tz('Asia/Seoul').format('YYYY.MM.DD');
// 현재 날짜를 YYYY.MM.DD 형식으로 설정하고 자정으로 변환
const ToDay = dayjs().tz('Asia/Seoul').startOf('day').valueOf(); // 밀리초 단위로 변환



describe('피드백 관리', () => {
    it('피드백 생성', () => {
        cy.visit(Cypress.env('Prod'));
        cy.contains("로그인").click()
        cy.get("#username", { timeout: 10 * 1000 }).type(Cypress.env('id_test02')); // 이메일 입력
        cy.get("#password", { timeout: 10 * 1000 }).type(Cypress.env('pw_public')); // 비밀번호 입력
        cy.get(".btn", { timeout: 10 * 1000 }).click();
        cy.wait(2 * 1000);
        cy.log("로그인");

        cy.get('#question-textarea').type('신규 사업 아이템 발굴을 위해 어떤 프로세스를 거쳐야 할까요?');
        cy.get('.chat-send-button').click();
        cy.get('.answer-recommend', { timeout: 60 * 1000 });

        // 채팅방 이름 변경
        cy.get('.current > .drop-wrap > .btn-ellipsis > .fa-light').click({ force: true });
        cy.get('.current > .drop-wrap > .drop-container > :nth-child(2)').click();
        cy.get('.name-change').clear();

        // 현재 시간을 채팅방으로 이름으로 설정
        // const dayjs = require('dayjs');
        cy.get('.name-change').type('긍정 피드백/' + CurrentDate + '{enter}');
        
        // 긍정 피드백
        cy.get('.feedback-button > :nth-child(2) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(1) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(2) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(3) > button').click()
        cy.get('.feedback-box__content > ul > :nth-child(4) > button').click()
        cy.get('div > input').type("자동화 테스트 - 긍정 피드백")
        cy.get('.feedback-box__send-button > .btn').click()
        cy.get('.go3958317564 > button').contains("피드백을 남겨주셔서 감사합니다")

    })

    it('피드백 조회', () => {
        cy.visit(Cypress.env('ProdAdmin'));
        cy.wait(3 * 1000);
        cy.get("#username", { timeout: 10 * 1000 }).type(Cypress.env('admin')); // 이메일 입력
        cy.get("#password", { timeout: 10 * 1000 }).type(Cypress.env('pw_admin')); // 비밀번호 입력
        cy.get(".btn", { timeout: 10 * 1000 }).click();
        cy.wait(2 * 1000);
        cy.log("로그인");

        cy.contains("피드백 관리").click();
        cy.wait(3 * 1000)
        cy.get('h1').contains("피드백 관리")

        // 작성자
        cy.get('[class="MuiFormControl-root MuiTextField-root block css-i44wyl"]').type('test02')

        // 작성 시작일
        cy.get(':nth-child(1) > .MuiInputBase-root').last().click({force : true})
        cy.wait( 3* 1000)
        cy.get('.MuiPickersDay-today').click({force : true})
        cy.contains("OK").click()
    
        // 작성 종료일
        cy.get(':nth-child(3) > .MuiInputBase-root').click({force:true})
        cy.wait( 3* 1000)
        cy.get('.MuiPickersDay-today').click({force : true})
        cy.contains("OK").click()
     
        // 모델
        cy.get('#mui-component-select-apiName').click()
        cy.get('[data-value="GPT-4"]').click()

        // 유형
        cy.get('.text-left > :nth-child(2) > :nth-child(2)').click()

        // 피드백 내용
        cy.get(':nth-child(6) > .MuiInputBase-root > .MuiSelect-select').click()
        cy.get('[data-value="1401"]').click() // 믿을 수 있는 출처


        cy.contains("검색").click(); 
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인
        cy.get(':nth-child(1) > .button-bg > .MuiButtonBase-root').click()
        
        // 상세정보
        cy.get(':nth-child(3) > td').contains("긍정 피드백")
        cy.contains("목록 가기").click()

        cy.contains("초기화").click()
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인

        // 검색결과 개수 비교
        cy.get('.numbering')
        .invoke('text')
        .then((text) => {
            const number = parseInt(text.replace(/\D/g, ''), 10); // 숫자만 추출하여 정수로 변환
            expect(number).to.be.gte(50);
        });
    })
})
