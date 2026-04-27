import { getMainFrame, stubIframeDialogs, validatePage } from '../../../module/iframe';

// 날짜 가져오기
const date = Cypress.getDate();

describe('SYSTEM SECURITY', () => {
    beforeEach(() => {
        cy.viewport(1920, 1080); // 화면크기 설정
        cy.visit(Cypress.env('live_gme'));
        cy.get('[name="txtUsername"]').type(Cypress.env('live_id_gme01'));
        cy.get('[name="txtPwd"]').type(Cypress.env('live_pw_gme01'));
        cy.get('[name="txtCompcode"]').type(Cypress.env('live_code_gme01'));
        cy.get('[name="btnLogin"]').click();
        cy.get('#chatBubbleImageId', { timeout: 10000 }).should('be.visible');
        cy.get('#gptcb-overlay', { timeout: 20000 }).should('not.exist'); // overlay 대기
        cy.log('## 로그인 ##');
    });

    it('Core System Logs - API Logs', function () {
        // Step 1: 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Core System Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('API Logs').click({ force: true });
        cy.log('## API Logs - 진입 성공 ##');

        validatePage();
        cy.wait(2000); // iframe DOM 안정화 대기

        // Step 2: 타이틀 확인 — 'API Transaction Log List'
        // getMainFrame()은 .then(cy.wrap)으로 인해 재시도 시 stale body를 참조함
        // → 직접 체이닝하면 실패 시 cy.get부터 다시 쿼리하여 안정적
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'API Transaction Log List');
        cy.log('## API Logs - 타이틀 확인 완료 ##');

        // Step 3: GME ControlNo 필드에 값 입력 (드롭다운 없이 직접 입력)
        getMainFrame().find('#apiLog_CONTROLNO').clear().type('80186392632');
        cy.log('## API Logs - controlNo 입력 완료 ##');

        // Step 3-1: From Date를 2026-04-01로 변경 (오늘 날짜 기본값으로는 과거 데이터 미조회)
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#apiLog_fromDate').val('2026-04-01');
            });
        cy.wait(500);

        // Step 4: Filter 버튼 클릭
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(3000);

        // Step 5: 데이터 노출 확인
        getMainFrame().should($body => {
            const hasTable = $body.find('table tr').length > 1;
            expect(hasTable, '검색 결과 테이블 데이터 존재').to.be.true;
        });
        cy.log('## API Logs - 데이터 노출 확인 완료 ##');

        // Step 6: Provider 컬럼에 'IMENepal' 표시 확인
        getMainFrame().find('table tbody').should('contain.text', 'IMENepal');
        cy.log('## API Logs - Provider IMENepal 확인 완료 ##');
    });

    it('Core System Logs - TxnErrorLogs', function () {
        // Step 1: 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Core System Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('TxnErrorLogs').click({ force: true });
        cy.log('## TxnErrorLogs - 진입 성공 ##');

        validatePage();
        cy.wait(2000); // iframe DOM 안정화 대기

        // Step 2: 타이틀 확인 — 'Transaction Error Logs Customer List'
        // getMainFrame()은 .then(cy.wrap)으로 인해 재시도 시 stale body를 참조함
        // → 직접 체이닝하면 실패 시 cy.get부터 다시 쿼리하여 안정적
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'Transaction Error Logs Customer List');
        cy.log('## TxnErrorLogs - 타이틀 확인 완료 ##');

        // Step 3: Search By > User ID 선택
        getMainFrame().find('#gridDisplay_searchBy').select('email');
        cy.wait(500);

        // Step 4: Search Value 입력
        getMainFrame().find('#gridDisplay_searchValue').clear().type(Cypress.env('search_username'));
        cy.log('## TxnErrorLogs - 검색 조건 설정 완료 ##');

        // Step 5: Filter 버튼 클릭
        // Filter 버튼은 <input type="button" value="Filter">이므로 input[value="Filter"] 사용
        // ※ button:contains("Filter")는 <button> 태그만 검색하여 <input>을 찾지 못함
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(3000);

        // Step 6: 데이터 노출 확인 (데이터 테이블: #gridDisplay_body)
        // 테이블 구조: tbody 내 첫 행 = TH(헤더), 두 번째 행부터 = TD(데이터)
        getMainFrame().find('#gridDisplay_body tbody tr').should('have.length.greaterThan', 1);
        cy.log('## TxnErrorLogs - 데이터 노출 확인 완료 ##');

        // Step 7: Error Message 컬럼(index 10) 텍스트 존재 확인
        // 에러 메시지 내용은 건마다 다를 수 있으므로, 텍스트가 비어있지 않은지만 검증
        // 첫 번째 행은 TH(헤더)이므로 eq(1)로 두 번째 행(첫 데이터 행)을 선택
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const $dataRow = win.jQuery('#gridDisplay_body tbody tr').eq(1);
                const errorMsg = $dataRow.find('td').eq(10).text().trim();
                expect(errorMsg.length, 'Error Message 컬럼에 텍스트 존재').to.be.greaterThan(0);
                cy.log(`## TxnErrorLogs - Error Message 확인: "${errorMsg.substring(0, 50)}..." ##`);
            });
        cy.log('## TxnErrorLogs - 검색 및 에러 메시지 검증 완료 ##');
    });

    it('Mobile App Logs - Customer Logs', function () {
        // 동적 Username(이메일) 저장용 변수
        // KFTC Transaction Logs에서 overseas 관련 동작(Success!) 사용자의 이메일을 추출하여 사용
        let savedEmail = '';

        // ===== Phase 1: KFTC Transaction Logs에서 검색용 이메일 추출 =====

        // Step 1: KFTC Logs 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('KFTC Logs').click({ force: true });
        cy.log('## KFTC Logs - 진입 (이메일 추출용) ##');

        validatePage();
        cy.wait(2000);

        // Step 2: Tab2(KFTC Transaction Logs) 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('KFTC Transaction Logs').click();
        cy.wait(3000);
        validatePage();
        cy.wait(2000);

        // Step 3: 검색 조건 설정 — Country Group / nepal / 오늘 날짜
        getMainFrame().find('#grid_FaceVerificationlist_searchCriteria').select('countryGroup');
        cy.wait(500);
        getMainFrame().find('#grid_FaceVerificationlist_searchValue').clear().type('nepal');
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const today = new Date().toISOString().split('T')[0];
                win.jQuery('#grid_FaceVerificationlist_fromDate').val(today);
                win.jQuery('#grid_FaceVerificationlist_toDate').val(today);
            });
        cy.log('## KFTC Tab2 - 검색 조건 설정 완료 ##');

        // Step 4: Filter 클릭
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(5000);

        // Step 5: per page를 100으로 변경하여 Success! 행을 찾기 쉽게
        // select에 ID가 없으므로 name 속성으로 접근, 변경 후 Nav() 호출로 재조회
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('select[name="grid_FaceVerificationlist_pageSize"]').val('100');
                win.Nav(1, 'grid_FaceVerificationlist', false);
            });
        cy.wait(5000);

        // Step 6: Remarks 컬럼(index 7)에 'Success!'가 있는 행의 ViewRemark URL로 이메일 추출
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const $rows = win.jQuery('#grid_FaceVerificationlist_body tbody tr');
                let remarkUrl = '';

                // Success! 행 찾기 (첫 번째 행은 헤더이므로 index 1부터)
                for (let i = 1; i < $rows.length; i++) {
                    const remarksText = $rows.eq(i).find('td').eq(7).text().trim();
                    if (remarksText === 'Success!') {
                        const onclick = $rows.eq(i).find('td:last a').attr('onclick');
                        const match = onclick.match(/OpenInNewWindow\('(.+?)'\)/);
                        if (match) {
                            remarkUrl = match[1];
                            break;
                        }
                    }
                }
                expect(remarkUrl, 'Success! 행의 ViewRemark URL 추출').to.not.be.empty;
                cy.log(`## ViewRemark URL: ${remarkUrl} ##`);

                // fetch로 ViewRemark 페이지 HTML 가져오기
                return cy.wrap(win.fetch(remarkUrl, { credentials: 'include' }).then(res => res.text()));
            })
            .then(html => {
                // HTML 파싱하여 Username(이메일) 추출
                // ViewRemark 구조: <td>Username:</td><td><span>email@example.com</span></td>
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const tds = doc.querySelectorAll('td');

                for (let i = 0; i < tds.length; i++) {
                    const label = tds[i].textContent.trim();
                    if (label === 'Username:' || label === 'User Name:') {
                        const nextTd = tds[i + 1];
                        if (nextTd) {
                            savedEmail = nextTd.textContent.trim();
                            break;
                        }
                    }
                }
                expect(savedEmail, 'ViewRemark에서 이메일 추출 성공').to.not.be.empty;
                cy.log(`## 추출된 이메일: "${savedEmail}" ##`);
            });

        // ===== Phase 2: Customer Logs 페이지로 이동하여 검색 =====
        // Phase1에서 KFTC 100건 로드 상태 → iframe 전환 시 stale DOM 방어 필요

        // Step 7: Customer Logs 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('Customer Logs').click({ force: true });
        cy.log('## Customer Logs - 메뉴 클릭 완료 ##');

        // iframe 전환 대기: KFTC 페이지(100건)에서 Customer Logs로 완전히 바뀔 때까지
        // 'User Logs' 타이틀이 나타나면 Customer Logs 페이지가 로드된 것
        cy.wait(3000); // iframe src 전환 여유 시간
        cy.get('iframe#mainFrame', { timeout: 20000 }).its('0.contentDocument.body').should('contain.text', 'User Logs');
        cy.log('## Customer Logs - iframe 전환 확인 완료 ##');

        validatePage();
        cy.wait(2000);
        cy.log('## Customer Logs - 타이틀 확인 완료 ##');

        // Step 9: 검색 조건 입력
        // Type > Outbound+General
        getMainFrame().find('#grid_customerLogs_txnType').select('outbound');
        cy.wait(500);

        // Method Name > Overseas Transaction
        getMainFrame().find('#grid_customerLogs_methodName').select('overseas');
        cy.wait(500);

        // Search By > User Id (value: email)
        getMainFrame().find('#grid_customerLogs_searchBy').select('email');
        cy.wait(500);

        // Search Value > KFTC에서 추출한 이메일
        cy.then(() => {
            getMainFrame().find('#grid_customerLogs_searchValue').clear().type(savedEmail);
            cy.log(`## Customer Logs - 검색값 "${savedEmail}" 입력 완료 ##`);
        });

        // Created Date, From Time, To Time — readonly 필드이므로 jQuery .val()로 설정
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                win.jQuery('#grid_customerLogs_createdDate').val(today);
                win.jQuery('#grid_customerLogs_fromTime').val('00:00');
                win.jQuery('#grid_customerLogs_toTime').val('23:00');
            });
        cy.log('## Customer Logs - 검색 조건 설정 완료 ##');

        // Step 10: Filter 버튼 클릭
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(5000);

        // Step 11: 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('#grid_customerLogs_body tbody tr');
                expect(rows.length, '데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Customer Logs - 데이터 노출 확인 완료 ##');

        // Step 12: 검색 결과 검증 — Created By 컬럼(index 2)에 추출된 이메일 포함 확인
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const $dataRow = win.jQuery('#grid_customerLogs_body tbody tr').eq(1);
                const createdBy = $dataRow.find('td').eq(2).text().trim();
                expect(createdBy, 'Created By 컬럼에 추출된 이메일 포함').to.include(savedEmail);
            });
        cy.log('## Customer Logs - 검색 결과 검증 완료 ##');
    });

    it('Mobile App Logs - KFTC Logs', function () {
        // 동적 Username 저장용 변수
        // Tab2에서 최신 로그의 Username을 추출하여 Tab1 검색에 사용
        let savedUsername = '';

        // Step 1: 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        cy.contains('KFTC Logs').click({ force: true });
        cy.log('## KFTC Logs - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // Step 2: 타이틀 확인 — 'API Transaction Log List'
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'API Transaction Log List');
        cy.log('## KFTC Logs - 타이틀 확인 완료 ##');

        // ===== Tab2: KFTC Transaction Logs (먼저 실행) =====
        // 배치 처리로 Tab1 데이터가 클리어될 수 있으므로,
        // Tab2에서 오늘 날짜의 최신 로그 Username을 먼저 추출하여 Tab1 검색에 활용

        // Step 3: Tab2 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('KFTC Transaction Logs').click();
        cy.wait(3000);

        validatePage();
        cy.wait(2000);

        // Step 4: 검색 조건 설정 — Country Group / nepal / 오늘 날짜
        // Search By > Country Group
        getMainFrame().find('#grid_FaceVerificationlist_searchCriteria').select('countryGroup');
        cy.wait(500);

        // Search Value > nepal
        getMainFrame().find('#grid_FaceVerificationlist_searchValue').clear().type('nepal');

        // Start Date, End Date — readonly 필드이므로 jQuery .val()로 설정
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                win.jQuery('#grid_FaceVerificationlist_fromDate').val(today);
                win.jQuery('#grid_FaceVerificationlist_toDate').val(today);
            });
        cy.log('## KFTC Logs Tab2 - 검색 조건 설정 완료 ##');

        // Step 5: Filter 클릭
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(5000);

        // Step 6: 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('#grid_FaceVerificationlist_body tbody tr');
                expect(rows.length, 'KFTC Transaction Logs 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## KFTC Logs Tab2 - 데이터 노출 확인 완료 ##');

        // Step 7: View Details(Remarks) 버튼의 onclick에서 ViewRemark URL을 추출하고,
        // fetch로 HTML을 가져와서 마스킹 안 된 Username을 파싱
        // ※ OpenInNewWindow()는 window.open()으로 팝업을 여는 방식이라 Cypress에서 차단됨
        // ※ 테이블의 Username은 마스킹 처리(예: EL*******)되어 있어 원본을 알 수 없음
        // → ViewRemark.aspx를 fetch하면 마스킹 안 된 원본 Username을 가져올 수 있음
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                // 첫 번째 데이터 행의 마지막 컬럼 <a> 태그에서 onclick 속성 추출
                const $link = win.jQuery('#grid_FaceVerificationlist_body tbody tr').eq(1).find('td:last a');
                const onclickStr = $link.attr('onclick'); // "OpenInNewWindow('ViewRemark.aspx?id=123456')"

                // URL 부분 추출: 'ViewRemark.aspx?id=...'
                const urlMatch = onclickStr.match(/OpenInNewWindow\('(.+?)'\)/);
                expect(urlMatch, 'ViewRemark URL 추출').to.not.be.null;
                const remarkUrl = urlMatch[1];
                cy.log(`## ViewRemark URL: ${remarkUrl} ##`);

                // fetch로 ViewRemark 페이지 HTML 가져오기
                return cy.wrap(win.fetch(remarkUrl, { credentials: 'include' }).then(res => res.text()));
            })
            .then(html => {
                // HTML 파싱하여 Username 추출
                // ViewRemark.aspx 구조: <td>Username:</td><td><span>ELBADAWI</span></td>
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const tds = doc.querySelectorAll('td');

                let found = false;
                for (let i = 0; i < tds.length; i++) {
                    const label = tds[i].textContent.trim();
                    if (label === 'Username:' || label === 'User Name:') {
                        const nextTd = tds[i + 1];
                        if (nextTd) {
                            savedUsername = nextTd.textContent.trim();
                            found = true;
                            break;
                        }
                    }
                }

                expect(found, 'ViewRemark에서 Username 추출 성공').to.be.true;
                expect(savedUsername, 'Username 값이 비어있지 않음').to.not.be.empty;
                cy.log(`## KFTC Logs Tab2 - 추출된 Username: "${savedUsername}" ##`);
            });
        cy.log('## KFTC Logs Tab2 - 검증 완료 ##');

        // ===== Tab1: KFTC Logs =====
        // Step 10: Tab1 클릭
        cy.get('iframe#mainFrame').its('0.contentDocument.body').find('a').contains('KFTC Logs').first().click();
        cy.wait(3000);

        validatePage();
        cy.wait(2000);

        // Step 11: 저장된 Username으로 검색
        cy.then(() => {
            // cy.then()으로 감싸서 savedUsername 값이 확정된 후 실행
            getMainFrame().find('#kftcLog_requestedBy').clear().type(savedUsername);
            cy.log(`## KFTC Logs Tab1 - Username "${savedUsername}" 입력 완료 ##`);
        });

        // Step 12: Filter 클릭
        getMainFrame().find('input[value="Filter"]').first().click();
        cy.wait(5000);

        // Step 13: 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('#kftcLog_body tbody tr');
                expect(rows.length, 'KFTC Logs 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## KFTC Logs Tab1 - 데이터 노출 확인 완료 ##');

        // Step 14: Provider 컬럼(index 1)에 'KFTC' 확인
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const provider = win.jQuery('#kftcLog_body tbody tr').eq(1).find('td').eq(1).text().trim();
                expect(provider, 'Provider 컬럼에 KFTC').to.include('KFTC');
            });
        cy.log('## KFTC Logs Tab1 - Provider KFTC 검증 완료 ##');
    });

    it('Mobile App Logs - Error Logs', function () {
        // Step 1: 메뉴 진입
        cy.get('#navbar-main > .nav > :nth-child(2) > .dropdown-toggle').click({ force: true });
        cy.wait(2 * 1000);
        cy.contains('Mobile App Logs').trigger('mouseover');
        cy.wait(2 * 1000);
        // cy.contains('Error Logs')는 'Oris Report Error Logs'를 먼저 매칭하므로
        // 정규식으로 정확히 'Error Logs'만 매칭
        cy.contains('a', /^Error Logs$/).click({ force: true });
        cy.log('## Error Logs - 진입 성공 ##');

        validatePage();
        cy.wait(2000);

        // Step 2: 타이틀 확인 — 'System Security  Exception'
        cy.get('iframe#mainFrame', { timeout: 15000 }).its('0.contentDocument.body').should('contain.text', 'System Security');
        cy.log('## Error Logs - 타이틀 확인 완료 ##');

        // Step 3: User Name 입력
        // Cypress .type()으로 입력하면 Nav() 함수가 값을 인식하지 못하는 경우가 있음
        // → jQuery .val()로 설정 후 Filter 클릭
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.jQuery('#grdAppEx_createdBy').val(Cypress.env('live_id_gme01'));
            });
        cy.log('## Error Logs - 검색 조건 설정 완료 ##');

        // Step 4: Filter 클릭 — Nav 함수를 직접 호출하여 확실하게 검색 실행
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                win.Nav(1, 'grdAppEx', false, 1);
            });
        cy.wait(5000);

        // Step 5: 데이터 노출 확인
        cy.get('iframe#mainFrame', { timeout: 15000 })
            .its('0.contentDocument.body')
            .should($body => {
                const rows = $body.find('#grdAppEx_body tbody tr');
                expect(rows.length, 'Error Logs 데이터 행 존재').to.be.greaterThan(1);
            });
        cy.log('## Error Logs - 데이터 노출 확인 완료 ##');

        // Step 6: Page 컬럼(index 1) 텍스트 존재 확인
        cy.get('iframe#mainFrame')
            .its('0.contentWindow')
            .then(win => {
                const page = win.jQuery('#grdAppEx_body tbody tr').eq(1).find('td').eq(1).text().trim();
                expect(page.length, 'Page 컬럼에 URL 텍스트 존재').to.be.greaterThan(0);
            });
        cy.log('## Error Logs - Page 컬럼 검증 완료 ##');
    });
});
