const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// 현재 날짜를 YYYY.MM.DD 형식으로 설정하고 자정으로 변환
const ToDay = dayjs().tz('Asia/Seoul').startOf('day').valueOf(); // 밀리초 단위로 변환


describe('회원 목록', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('ProdAdmin'));
        cy.wait(3 * 1000);
        cy.get("#username", { timeout: 10 * 1000 }).type(Cypress.env('admin')); // 이메일 입력
        cy.get("#password", { timeout: 10 * 1000 }).type(Cypress.env('pw_admin')); // 비밀번호 입력
        cy.get(".btn", { timeout: 10 * 1000 }).click();
        cy.wait(2 * 1000);
        cy.log("로그인");
    });

    it('회원 목록 조회', () => {
        cy.contains("회원 목록").click();
        cy.wait(2 * 1000)
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인
        cy.get('h1').contains("회원 목록")
        
        // cy.get('tbody > :nth-child(1) > :nth-child(2)', { timeout: 60 * 1000 }); // 조회 => 데이터 존재 확인


        // cy.get('[name="userName"]').type('test10') // 이름
        // cy.get('[name="userEmail"]').type('test10@teml.net') // 이메일
        // cy.get(':nth-child(1) > :nth-child(4) > .MuiInputBase-root > .MuiSelect-select').click() // 업종
        // cy.get('[data-value="1005"]').click()
        // cy.get(':nth-child(2) > :nth-child(4) > .MuiInputBase-root > .MuiSelect-select').click() // 직업
        // cy.get('[data-value="1102"]').click()

        // cy.get(':nth-child(3) > :nth-child(4) > :nth-child(3) > :nth-child(2)').click() // 회원상태 - 정지
        // cy.get(':nth-child(4) > :nth-child(4) > :nth-child(2) > :nth-child(2)').click() //마케팅 - 동의     

        // // //  종료일   :nth-child(3) > .MuiInputBase-root

     
        
    //     cy.get(':nth-child(2) > .MuiStack-root > :nth-child(1) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root').first().click({force : true})
    //     cy.get('.MuiPickersCalendarHeader-labelContainer > .MuiButtonBase-root').click({force : true})
    //     cy.get(':nth-child(125) > .MuiPickersYear-yearButton').click({force : true}) // 2024 년도


    //     cy.get('[class="MuiPickersFadeTransitionGroup-root css-1bx5ylf"]')
    //     .invoke('text') // 요소의 텍스트를 가져옵니다.
    //     .then((text) => {
    //       const monthText = text.split(' ')[0]; // 월 텍스트 추출 (예: '8월')
    //       const monthNumber = parseInt(monthText, 10); // 숫자로 변환
      
    //     // monthNumber를 Cypress 로그에 출력
    //     cy.log(`현재 월: ${monthNumber}`); // Cypress 로그에 출력

    //       // 목표 월
    //       const targetMonth = 7; // 7월
      
    //       // 차이 계산
    //       const difference = monthNumber - targetMonth;
      
    //      // 차이에 따라 이전 또는 다음 버튼 클릭
    //     if (difference > 0) {
    //         // 현재 월이 목표 월보다 크면 '이전' 버튼 클릭
    //         for (let i = 0; i < difference; i++) {
    //         cy.get('.MuiIconButton-edgeEnd').click({ multiple: true }); // '이전' 버튼 클릭
    //         }
    //     } else if (difference < 0) {
    //         // 현재 월이 목표 월보다 작으면 '다음' 버튼 클릭
    //         for (let i = 0; i < Math.abs(difference); i++) {
    //         cy.get('.MuiIconButton-edgeStart').click({ multiple: true }); // '다음' 버튼 클릭
    //         }
    //     }
    // });







    //     // // // 

    //     // cy.get(':nth-child(3) > :nth-child(2) > .MuiStack-root > :nth-child(1) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root')
    //     // cy.get(':nth-child(1) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root').first().click({force : true})
    //     // cy.wait( 3* 1000)
    //     // cy.get('[class="MuiPickersFadeTransitionGroup-root css-1bx5ylf"]').click()
    //     // cy.contains('2024').click()

    //     cy.get('[class="MuiPickersFadeTransitionGroup-root css-1bx5ylf"]')
    //     .invoke('text') // 요소의 텍스트를 가져옵니다.
    //     .then((text) => {
    //       const monthText = text.split(' ')[0]; // 월 텍스트 추출 (예: '8월')
    //       const monthNumber = parseInt(monthText, 10); // 숫자로 변환
      
    //     // monthNumber를 Cypress 로그에 출력
    //     cy.log(`현재 월: ${monthNumber}`); // Cypress 로그에 출력

    //       // 목표 월
    //       const targetMonth = 7; // 7월
      
    //       // 차이 계산
    //       const difference = monthNumber - targetMonth;
      
    //      // 차이에 따라 이전 또는 다음 버튼 클릭
    //     if (difference > 0) {
    //         // 현재 월이 목표 월보다 크면 '이전' 버튼 클릭
    //         for (let i = 0; i < difference; i++) {
    //         cy.get('.MuiIconButton-edgeEnd').click({ multiple: true }); // '이전' 버튼 클릭
    //         }
    //     } else if (difference < 0) {
    //         // 현재 월이 목표 월보다 작으면 '다음' 버튼 클릭
    //         for (let i = 0; i < Math.abs(difference); i++) {
    //         cy.get('.MuiIconButton-edgeStart').click({ multiple: true }); // '다음' 버튼 클릭
    //         }
    //     }
    // });



    //     // 이전
    //     cy.get('.MuiIconButton-edgeEnd').click()
    //     // 다음
    //     cy.get('.MuiIconButton-edgeStart').click()


    //     // [class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd css-b52kj1"]
    //     cy.get('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd Mui-readOnly MuiInputBase-readOnly css-b52kj1"]').first().type("2024.07.18")
    //     cy.get('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd Mui-readOnly MuiInputBase-readOnly css-b52kj1"]').eq(1).type("2024.07.18")
    //     cy.get('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd Mui-readOnly MuiInputBase-readOnly css-b52kj1"]').eq(2).type("2024.07.18")
    //     cy.get('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd Mui-readOnly MuiInputBase-readOnly css-b52kj1"]').last().type("2024.07.18")


        ///////////////////////////////////////////////
        // 날짜 직접 입력 - 실패
        // // 피드백 검색 MuiStack-root > :nth-child(1) > .MuiInputBase-root
        // cy.get('.MuiStack-root > :nth-child(1) > .MuiInputBase-root').find('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd css-b52kj1"]').should('be.visible').type(CurrentDate); // 작성일 시작일
        // cy.get(':nth-child(3) > .MuiInputBase-root').find('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd css-b52kj1"]').type(CurrentDate); // 작성일 종료일
        // // cy.get('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall MuiInputBase-inputAdornedEnd css-b52kj1"]').eq(1).type(CurrentDate); // 작성일 종료일일
        // cy.get('[class="MuiInputBase-input MuiOutlinedInput-input MuiInputBase-inputSizeSmall css-1o6z5ng"]').type('@teml.net') // 작성자

        // cy.get('.main-content').click()
        // cy.get('[class="MuiButtonBase-root MuiIconButton-root MuiIconButton-edgeEnd MuiIconButton-sizeMedium css-slyssw"]').eq(0).click({force:true})
        // cy.get('.MuiPickersCalendarHeader-labelContainer > .MuiButtonBase-root').click()
        // cy.get('.MuiYearCalendar-root').contains('2024').click()


        /// 수정중
        // cy.get(':nth-child(1) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root').focus().click({force:true})
        // cy.get(':nth-child(1) > .MuiInputBase-root').find('[class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-vubbuv"]').click({force:true})


        // cy.log(ToDay)
        // cy.get(':nth-child(3) > :nth-child(2) > .MuiStack-root > :nth-child(1) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root').click({force:true})
        // cy.get(`[data-timestamp="${ToDay}"]`).click()
        // cy.get(':nth-child(3) > :nth-child(2) > .MuiStack-root > :nth-child(3) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root').click({force:true})
        // cy.get(`[data-timestamp="${ToDay}"]`).click()
        // cy.get(':nth-child(4) > :nth-child(2) > .MuiStack-root > :nth-child(1) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root').click({force:true})
        // cy.get(`[data-timestamp="${ToDay}"]`).click()
        // cy.get(':nth-child(4) > :nth-child(2) > .MuiStack-root > :nth-child(3) > .MuiInputBase-root > .MuiInputAdornment-root > .MuiButtonBase-root').click({force:true})
        // cy.get(`[data-timestamp="${ToDay}"]`).click()

        
        // cy.get('[name="joinStartDate"]').type('2024.07.18') // 가입일 시작일
        // cy.get('[name="joinEndDate"]').type('2024.07.18') // 가입일 종료일
        // cy.get('[name="lastLoginStartDate"]').type('2024.07.18') // 최근 접속일 시작일
        // cy.get('[name="lastLoginEndDate"]').type('2024.07.18') // 최근 접속일 종료일

        cy.get('[name="userEmail"]').type('test10')
        cy.contains("검색").click()
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인
        cy.contains('.table-secondary > tbody > tr > :nth-child(3)', 'test10@teml.net').should('exist')
        cy.contains("초기화").click()
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인
        cy.get('.numbering').invoke('text').then((text) => { // 카운트 확인
            const number = parseInt(text.replace(/\D/g, ''), 10); // 숫자만 추출하여 정수로 변환
            expect(number).to.be.gte(50); //  데이터 50개 이상인지 확인
        });
    })

    it('회원 목록 정렬 - 최근 가입순', () => {
        cy.contains("회원 목록").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("회원 목록")

        //최근 가입순 정렬
        cy.get('#mui-component-select-sort').contains("최근 가입순")
        function parseDate(dateString) {
            const [date, time] = dateString.split(' ');
            const [year, month, day] = date.split('-');
            const [hour, minute, second] = time.split(':'); // 에러 자주 남
            return new Date(year, month - 1, day, hour, minute, second);
          }
          
        cy.get('tbody > :nth-child(1) > :nth-child(8)').then(($dateElement) => {
            const firstElementDateText = $dateElement.text();
            const firstElementDate = parseDate(firstElementDateText);
        
        cy.get('tbody > :nth-child(2) > :nth-child(8)').then(($dateElement2) => {
            const secondElementDateText = $dateElement2.text();
            const secondElementDate = parseDate(secondElementDateText);
        
            expect(firstElementDate).to.be.greaterThan(secondElementDate); //날짜 비교
        });
        });
    })

    it('회원 목록 정렬 - 최근 접속일순', () => {
        cy.contains("회원 목록").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("회원 목록")

        function parseDate(dateString) {
            const [date, time] = dateString.split(' ');
            const [year, month, day] = date.split('-');
            const [hour, minute, second] = time.split(':'); // 에러 자주 남
            return new Date(year, month - 1, day, hour, minute, second);
        }


        // 최근 접속일 정렬
        cy.get('#mui-component-select-sort').click()
        cy.contains("최근 접속일순").click()
        cy.get('#mui-component-select-sort').contains("최근 접속일순")
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인       
          
        cy.get('tbody > :nth-child(1) > :nth-child(8)').then(($dateElement) => {
            const firstElementDateText = $dateElement.text();
            const firstElementDate = parseDate(firstElementDateText);
        
        cy.get('tbody > :nth-child(2) > :nth-child(8)').then(($dateElement2) => {
            const secondElementDateText = $dateElement2.text();
            const secondElementDate = parseDate(secondElementDateText);
        
        cy.get('tbody > :nth-child(1) > :nth-child(9)').then(($dateElement3) => {
        const firstElementDateText = $dateElement3.text();
        const firstElementDate = parseDate(firstElementDateText);
        
        cy.get('tbody > :nth-child(2) > :nth-child(9)').then(($dateElement4) => {
            const secondElementDateText = $dateElement4.text();
            const secondElementDate = parseDate(secondElementDateText);
        
            expect(firstElementDate).to.be.greaterThan(secondElementDate);
        });
        });       
        })
        })
    })

    it.skip('회원 목록 정렬 2 - 방식 변경', () => {
        cy.contains("회원 목록").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("회원 목록")

        //최근 가입순 정렬
        cy.get('#mui-component-select-sort').contains("최근 가입순")
    
        cy.get('tbody > :nth-child(1) > :nth-child(8)').invoke('text').then((membership1) => {
            // text1 값이 숫자나 날짜 형식인지 확인
            if (!isNaN(parseFloat(membership1)) || !isNaN(Date.parse(membership1))) {
            cy.get('tbody > :nth-child(2) > :nth-child(8)').invoke('text').then((membership2) => {
                // text1과 text2 값 비교
                expect(parseFloat(membership1)).to.be.greaterThan(parseFloat(membership2));
                });
            } else {
            // text1 값이 숫자나 날짜 형식이 아닌 경우 처리
            cy.log('ERROR - text1 value is not a number or date:', membership1);
            }
        });

        // 최근 접속일 정렬
        cy.get('#mui-component-select-sort').click()
        cy.contains("최근 접속일순").click()
        cy.get('#mui-component-select-sort').contains("최근 접속일순")
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인    
        
        cy.get('tbody > :nth-child(1) > :nth-child(9)').invoke('text').then((recent1) => {
            // text1 값이 숫자나 날짜 형식인지 확인
            if (!isNaN(parseFloat(recent1)) || !isNaN(Date.parse(recent1))) {
            cy.get('tbody > :nth-child(2) > :nth-child(9)').invoke('text').then((recent2) => {
                // text1과 text2 값 비교
                expect(parseFloat(recent1)).to.be.greaterThan(parseFloat(recent2));
                // expect(parseFloat(recent1)).to.be.at.least(parseFloat(recent2));
                });
            } else {
            // text1 값이 숫자나 날짜 형식이 아닌 경우 처리
            cy.log('ERROR - text1 value is not a number or date:', recent1);
            }
        });
    })

    it('회원 목록 다운로드', () => {
        cy.contains("회원 목록").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("회원 목록")
    
        // ## 엑셀 파일 다운로드 ##
        const downloadFilePath = 'cypress/downloads/';

        // 테스트 액션 전 다운로드 파일 개수 저장
        let initialFileCount;
        cy.task('getFileCount', downloadFilePath).then((count) => {
        initialFileCount = count;
        cy.log(`Before Download : ${initialFileCount}`);
        });
 
        // 다운로드 버튼 클릭
        cy.get('.right-control > .MuiButtonBase-root').click();
        cy.wait(10 * 1000)

        // 테스트 액션 후 다운로드 파일 개수 확인
        cy.task('getFileCount', downloadFilePath).then((count) => {   
        cy.log(`After Download : ${count}`);
        expect(count).to.equal(initialFileCount + 1);

        // 다운로드된 파일 삭제
        cy.task('deleteFiles', downloadFilePath).then(() => {
        cy.log('Downloaded files deleted');
        });
        })
    })

    it('회원 정보 수정', () => {
        cy.contains("회원 목록").click();
        cy.wait(2 * 1000)
        cy.get('h1').contains("회원 목록")
        cy.get('[name="userEmail"]').type('test10') // 이메일 검색
        cy.contains("검색").click()
        cy.get('.MuiPagination-ul > :nth-child(3) > .MuiButtonBase-root', { timeout: 60 * 1000 });  // 페이지 로딩 확인
        cy.contains("상세보기").click()
        cy.wait(2 * 1000)
        cy.get('h1').contains("상세정보")
        cy.get('.tag').contains("정지")
        cy.get('.MuiSelect-select').click()
        cy.contains("정상").click({force:true})
        cy.contains("저장").click()
        cy.get('.go2072408551').contains("회원 정보가 수정되었습니다")

        // 기존값 복구
        cy.get('.tag').contains("정상")
        cy.get('.MuiSelect-select').click()
        cy.contains("정지").click({force:true})
        cy.contains("저장").click()
        cy.get('.dialog-container').contains("저장").click()
        cy.get('.go2072408551').contains("회원 정보가 수정되었습니다")
    })
})
