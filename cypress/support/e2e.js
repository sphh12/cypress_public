// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:

// Alternatively you can use CommonJS syntax:
require('./commands');
require('typescript');
require('cypress-iframe');
require('cypress-clipboard');
require('cypress-xpath');
require('cypress-mochawesome-reporter/register');
require('cypress-real-events');

// require("puppeteer");



//  ## 에러메시지 무시 (특정 메시지에 한정) ##
Cypress.on('uncaught:exception', (err, runnable) => {
  const msg = (err && err.message) ? err.message : '';

  const IGNORED_PATTERNS = [
    'backstretch',
    'WOW',
    'digest',
    'No dialog is showing', 
  ];

  const shouldIgnore = IGNORED_PATTERNS.some((pat) => msg.includes(pat));

  if (shouldIgnore) {
    return false;
  }
});


