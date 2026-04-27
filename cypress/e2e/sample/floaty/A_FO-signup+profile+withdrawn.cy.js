const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
const CurrentDate = dayjs().tz('Asia/Seoul').format('MMDD_hhmm');
const email = `signup_${CurrentDate}@blondmail.com`;



describe('회원가입 / 프로필 설정 / 회원 탈퇴', () => {   
    it('회원가입', () => {
        cy.visit(Cypress.env('Prod'));
        cy.get('.gnb__user-info > .btn').click();
        cy.get('.register-content > :nth-child(1) > a').click();
        cy.get('ul > :nth-child(1) > .checkbox-radio > label').click();
        cy.get(':nth-child(2) > .checkbox-radio > label').click();
        cy.get(':nth-child(3) > .checkbox-radio > label').click();
        cy.get('.btn').click();

        
        // ## iframe ##
        cy.window().then({ timeout: 60000 }, win => {
            const iframe = win.document.createElement('iframe'); // iframe 요소 생성
            iframe.id = 'newIframe'; // iframe id 지정
            iframe.src = 'https://inboxes.com/'; // iframe에 로드할 페이지 URL
            iframe.style.width = '1920px'; // iframe width 지정
            iframe.style.height = '1080px'; // iframe height 지정
            win.document.body.appendChild(iframe); // html body에 생성한 iframe 추가
        });

        // iframe 로드 확인
        cy.frameLoaded('#newIframe', { timeout: 60000 }); // 타임아웃 설정

        cy.iframe('#newIframe').within(() => {
            // 일회용 이메일 생성
            cy.wait(3000); // 3초 대기 후 진행
            cy.contains('Get my first inbox!').click({ force: true });
            cy.wait(2000); // 2초 대기
            cy.get('.rounded-l-lg').type('signup_' + CurrentDate);
            cy.wait(2000); // 2초 대기
            cy.get('.mt-8 > .block').select('blondmail.com');
            cy.get('.max-w-sm > :nth-child(3)').click();
        }).then({ timeout: 120000 }, function() {
            // 추가 작업 또는 확인 코드 작성
            console.log('iframe 내 작업이 완료되었습니다.');
        });



        // 이메일 인증번호 요청
        cy.get('#joinName').clear().type('테스트_' + CurrentDate);
        cy.get('#joinEmail').clear().type(email);
        cy.get('.btn').click();

        // 이메일 확인 => 인증번호 추출 (iframe 접근)
        cy.iframe('#newIframe').within(() => {
            cy.get('.h-16 > .hidden > .flex', { timeout: 60 * 1000 });  // 페이지 로딩 확인
            cy.wait(3 * 1000);
            cy.get('.border-b > :nth-child(2)').click();

            cy.get('[height="100"] > table > tbody > :nth-child(2) > td')
                .invoke('text')
                .then(extractedText => {
                    // 추출한 텍스트를 변수에 저장
                    const authNum = extractedText.trim(); // 필요하다면 trim()으로 공백 제거
                    cy.log('인증번호:', authNum);
                    cy.wrap(authNum).as('authNum'); // email 변수를 Cypress alias로 저장
                });
        });

        // iframe 제거
        cy.get('#newIframe').then($iframe => {
            // iframe의 부모 요소를 가져와서 iframe을 제거합니다.
            $iframe.remove();
        });

        // 인증번호 입력.
        cy.get('@authNum').then(authNum => {
            cy.get('.xlarge').type(authNum);
            cy.get('.btn').click();
        });

        // 비밀번호 설정
        cy.get('#first-password').type('qwe123..');
        cy.get('#password-check').type('qwe123..');
        cy.get('.btn').click();

        cy.get('.dialog-box').contains('회원가입이 완료되었습니다');
        cy.get('.dialog-footer > .btn').click();
    });

    it('로그인 - 프로필 설정, 회원 탈퇴', () => {
        cy.visit('https://floaty.deepnoid.com/');
        cy.get('.gnb__user-info > .btn').click();

        cy.get('#username').type(email);
        cy.get('#password').type('qwe123..');
        cy.get('.btn').click();
        cy.log('로그인 완료');

        //프로필 설정 팝업
        //안내 팝업
        cy.get('.modal-box').contains('환영합니다');
        cy.get('.onboarding-buttons > .primary').click();

        // 업종, 직업 입력
        cy.get('#onboarding-business').select('1005');
        cy.get('#onboarding-job').select('1114');
        cy.get('.mt16').type('프로필 설정 테스트');
        cy.get('.onboarding-buttons > .primary').click();

        // 사용 목적
        cy.get(':nth-child(1) > .checkbox-radio > label').click();
        cy.get(':nth-child(2) > .checkbox-radio > label').click();
        cy.get(':nth-child(3) > .checkbox-radio > label').click();
        cy.get('.onboarding-buttons > .primary').click();
        cy.wait(2000);

        cy.get('dd').contains('프로필 설정이 완료되었습니다');
        cy.get('.onboarding-buttons > .btn').click();
        cy.log('프로필 설정 완료');

        // 프로필 설정값 확인
        cy.get('.gnb__user-info > .btn').click();
        cy.get('.drop-container > :nth-child(1)').click();

        cy.get('#industry').contains('IT/기술');
        cy.get('#job').contains('기타(직접 입력)');
        cy.get('.user-info-form__button-box > .btn').should('be.disabled');

        // 회원 탈퇴
        cy.get('section > .btn').click();

        cy.get(':nth-child(1) > h4').contains('정말 탈퇴하시겠어요');
        cy.get('.withdrawal__content > :nth-child(1) > .checkbox-radio > label').click();
        cy.get('[style="order: 1;"] > .checkbox-radio > label').click();
        cy.get('[style="order: 2;"] > .checkbox-radio > label').click();
        cy.get('[style="order: 6; grid-area: 2 / 2 / 5 / 3;"] > .checkbox-radio > label').click();
        cy.get('.mt10').type('회원 탈퇴 테스트');

        cy.get('.danger').click();
        cy.get('.dialog-box').contains('탈퇴가 완료되었습니다');
        cy.get('.dialog-footer > .btn').click();
        cy.log('탈퇴 완료');
    });

    it('탈퇴 회원 로그인', () => {
        cy.visit('https://floaty.deepnoid.com/');
        cy.get('.gnb__user-info > .btn').click();
        cy.get('#username').type(email);
        cy.get('#password').type('qwe123..');
        cy.get('.btn').click();

        cy.get('.dialog-box').contains('탈퇴 회원입니다');
        cy.get('.dialog-footer > .btn').click();
    });
});
