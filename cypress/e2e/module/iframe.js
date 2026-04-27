export const getMainFrame = () => {
    return cy.get('iframe#mainFrame', { timeout: 10000 }).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);
};

// iframe 페이지 유효성 검사
export const validatePage = () => {
    cy.log('## [1/5] iframe 로딩 확인 ##');
    getMainFrame().should('exist');

    // iframe 로딩 안정화 대기 — DOM detach 방어
    // .panel이 나타날 때까지 재시도하여 페이지 전환 완료를 보장
    cy.get('iframe#mainFrame', { timeout: 20000 })
        .its('0.contentDocument.body')
        .should('not.be.empty')
        .find('.panel', { timeout: 20000 })
        .should('have.length.at.least', 1);

    cy.log('## [2/5] 서버 에러 없음 확인 ##');
    getMainFrame().should('not.contain', 'Server Error');
    getMainFrame().should('not.contain', '404');
    getMainFrame().should('not.contain', 'Page not found');

    cy.log('## [3/5] 레이아웃 요소 표시 확인 ##');
    getMainFrame().find('.page-wrapper').should('have.length', 1);
    getMainFrame().find('.panel').should('have.length.at.least', 1);

    cy.log('## [4/5] 로딩 완료 확인 ##');
    getMainFrame().find('.loading, .spinner', { timeout: 15000 }).should('not.exist');

    cy.log('## [5/5] 페이지 유효성 검사 - 통과 ##');
};

export const stubIframeDialogs = (confirmReturn = true) => {
    return cy
        .get('iframe#mainFrame', { timeout: 10000 })
        .its('0.contentWindow')
        .then(iframeWindow => {
            // Sinon stub 생성 및 alias 설정
            const confirmStub = Cypress.sinon.stub(iframeWindow, 'confirm').returns(confirmReturn);
            const alertStub = Cypress.sinon.stub(iframeWindow, 'alert');

            // alias로 저장 (검증용)
            cy.wrap(confirmStub).as('confirmStub');
            cy.wrap(alertStub).as('alertStub');

            return null; // then 블록 명시적 종료
        });
};
