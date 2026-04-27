// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

const dataTransfer = new DataTransfer(); // dataTransfer 객체 정의

Cypress.Commands.add('ModuleAdd', (select, target, x_coordinate, y_coordinate) => {
    cy.get(select).trigger('dragstart', { dataTransfer, button: 0, force: true }).trigger('dragover', { clientX: 100, clientY: 100 });
    cy.get(target).trigger('drop', {
        dataTransfer,
        which: 1,
        pageX: x_coordinate,
        pageY: y_coordinate,
        force: true,
    });

});


Cypress.Commands.add('getAll', () => {
    cy.getAllCookies(); // 쿠키 삭제
    cy.getAllLocalStorage(); // 로컬 삭제
    cy.getAllSessionStorage(); // 세션 삭제
});


    /**
     * usages:
     * cy.paste('text to paste') OR:
     * cy.paste({ pastePayload: 'text to paste', pasteType: 'text/plain' })
     */



// 날짜 헬퍼 (한국 시간 기준)
Cypress.getDate = () => {
  const d = new Date();
  const kr = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  
  const yy = String(kr.getFullYear()).slice(-2);
  const mm = String(kr.getMonth() + 1).padStart(2, '0');
  const dd = String(kr.getDate()).padStart(2, '0');
  const HH = String(kr.getHours()).padStart(2, '0');
  const MM = String(kr.getMinutes()).padStart(2, '0');
  const SS = String(kr.getSeconds()).padStart(2, '0');
  
  return {
    yymmdd: `${yy}${mm}${dd}`,                              // 260109
    yy_mm_dd: `${yy}_${mm}_${dd}`,                          // 26_01_09
    yy_mm_dd_dash: `${yy}-${mm}-${dd}`,                     // 26-01-09
    yyyy_mm_dd: `${kr.getFullYear()}_${mm}_${dd}`,          // 2026_01_09
    yyyy_mm_dd_dash: `${kr.getFullYear()}-${mm}-${dd}`,     // 2026-01-09 
    yymmdd_HHMM: `${yy}${mm}${dd}_${HH}${MM}`,              // 260109_1654
    yymmdd_HHMMSS: `${yy}${mm}${dd}_${HH}${MM}${SS}`,       // 260109_165412

    
  };
};
