function login(Site, Id, Password) {
  cy.visit(Site);
  cy.get(".gnb__user-info > .btn", { timeout: 3 * 1000 }).click();
  cy.wait(2 * 1000);
  cy.log(Id);

  cy.get("#username", { timeout: 10 * 1000 }).type(Id); // 이메일 입력
  cy.get("#password", { timeout: 10 * 1000 }).type(Password); // 비밀번호 입력
  cy.get(".btn", { timeout: 10 * 1000 }).click();
  cy.wait(3 * 1000);
  cy.log("로그인 성공");
}
module.exports = {
  login: login,
};
