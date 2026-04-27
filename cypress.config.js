require('dotenv').config();
const { defineConfig } = require('cypress');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      require('tsconfig-paths').register();
      return config;
    },
  },
};
//테스트 코드 끝

module.exports = defineConfig({
    chromeWebSecurity: false,
    projectId: 'tagp8n', //Cypress Cloud

    viewportWidth: 1980,
    viewportHeight: 1080,
    pageLoadTimeout: 60000,

    experimentalStudio: true,
    video: true,

    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
        charts: true,
        reportPageTitle: 'custom-title',
        embeddedScreenshots: true,
        inlineAssets: true,
        saveAllAttempts: false,
    },
    e2e: {
        defaultCommandTimeout: 5000,
        pageLoadTimeout: 120000, // 120초로 설정 (필요에 따라 조정 가능)
        setupNodeEvents(on, config) {
            // Docker/Linux 환경에서 Chrome 안정성 플래그 추가
            on('before:browser:launch', (browser, launchOptions) => {
                if (browser.name === 'chrome') {
                    launchOptions.args.push('--no-sandbox');
                    launchOptions.args.push('--disable-dev-shm-usage');
                    launchOptions.args.push('--disable-gpu');
                    console.log('Chrome 플래그 추가: --no-sandbox, --disable-dev-shm-usage, --disable-gpu');
                }
                return launchOptions;
            });

            on('task', {
                getLatestDownloadedFile(downloadPath) {
                  const files = fs.readdirSync(downloadPath);
                  const latestFile = files.reduce((prev, curr) => {
                    const prevMtime = fs.statSync(path.join(downloadPath, prev)).mtime.getTime();
                    const currMtime = fs.statSync(path.join(downloadPath, curr)).mtime.getTime();
                    return currMtime > prevMtime ? curr : prev;
                  }, '');
                  return latestFile;
                },
                getFileCount(downloadPath) {
                  return fs.readdirSync(downloadPath).length;
                },
                deleteFiles(downloadPath) {
                  const files = fs.readdirSync(downloadPath);
                  files.forEach((file) => {
                    fs.unlinkSync(path.join(downloadPath, file));
                  });
                  return null;
                },
                clickAlert() {
                  // Python 스크립트를 백그라운드에서 실행 (완료 대기 안 함)
                  // Windows: python, Linux/Docker: python3
                  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
                  exec(`${pythonCmd} ./cypress/e2e/module/click_alert.py`, (error, stdout, stderr) => {
                    if (error) {
                      console.error('Python 스크립트 실행 오류:', error.message);
                    } else {
                      console.log('Python stdout:', stdout);
                    }
                    if (stderr) {
                      console.error('Python stderr:', stderr);
                    }
                  });

                  // 즉시 반환 (백그라운드에서 계속 실행)
                  return Promise.resolve({
                    success: true,
                    message: 'Alert 클릭 스크립트 백그라운드 실행 시작'
                  });
                }
            });
                // implement node event listeners here
                require('cypress-mochawesome-reporter/plugin')(on);

            // 성공한 테스트의 비디오 자동 삭제 (실패 시에만 비디오 유지)
            on('after:spec', (spec, results) => {
                if (results && results.video) {
                    const hasFailures = results.tests && results.tests.some(
                        (test) => test.attempts && test.attempts.some((attempt) => attempt.state === 'failed')
                    );
                    if (!hasFailures) {
                        // 실패가 없으면 비디오 파일 삭제
                        fs.unlinkSync(results.video);
                        console.log(`비디오 삭제 (테스트 성공): ${spec.relative}`);
                    } else {
                        console.log(`비디오 유지 (테스트 실패): ${spec.relative}`);
                    }
                }
            });
        },
        specPattern: [
          // 'cypress/e2e/test/FO-NonLogin.cy.js',
          // 'cypress/e2e/test/A_FO-signup+profile+withdrawn.cy.js',
          // 'cypress/e2e/test/FO-setting.cy.js',
          // 'cypress/e2e/test/FO-chat.cy.js',
          // 'cypress/e2e/test/FO-[sample]link.cy.js',
          // 'cypress/e2e/test/BO-admin_management.cy.js',
          // 'cypress/e2e/test/BO-prompt_management.cy.js',
          // 'cypress/e2e/test/BO-model_management.cy.js',
          // 'cypress/e2e/test/BO-model_group_management.cy.js',
          // 'cypress/e2e/test/BO-user_list.cy.js',
          // 'cypress/e2e/test/BO-withdrawn_management.cy.js',
          // 'cypress/e2e/test/BO-feedback_management.cy.js',
          'cypress/e2e/test/GME/**/*.cy.js',
        ],
        
        env: {
            /* Site */
            Dev: process.env.SITE_DEV || '',
            DevAdmin: process.env.SITE_DEV_ADMIN || '',
            Prod: process.env.SITE_PROD || '',
            ProdAdmin: process.env.SITE_PROD_ADMIN || '',
            Stg: process.env.SITE_STG || '',
            StgAdmin: process.env.SITE_STG_ADMIN || '',

            /* Id / PW */
            id_test01: process.env.ID_TEST01 || '',
            id_test02: process.env.ID_TEST02 || '',
            id_test03: process.env.ID_TEST03 || '',
            admin: process.env.ID_ADMIN || '',
            pw_public: process.env.PW_PUBLIC || '',
            pw_admin: process.env.PW_ADMIN || '',

            /* Global Money Express */
            live_gme: process.env.LIVE_GME || '',
            live_id_gme01: process.env.LIVE_ID_GME01 || '',
            live_pw_gme01: process.env.LIVE_PW_GME01 || '',
            live_code_gme01: process.env.LIVE_CODE_GME01 || '',

            stg_gme: process.env.STG_GME || '',
            stg_id_gme01: process.env.STG_ID_GME01 || '',
            stg_pw_gme01: process.env.STG_PW_GME01 || '',
            stg_code_gme01: process.env.STG_CODE_GME01 || '',

            /* 고객 테스트 데이터 (민감정보) */
            customer_id_number: process.env.CUSTOMER_ID_NUMBER || '',
            customer_name: process.env.CUSTOMER_NAME || '',
            bank_a_name: process.env.BANK_A_NAME || '',
            bank_a_account: process.env.BANK_A_ACCOUNT || '',
            bank_b_name: process.env.BANK_B_NAME || '',
            bank_b_account: process.env.BANK_B_ACCOUNT || '',

            /* 검색 키워드 */
            search_username: process.env.SEARCH_USERNAME || '',

            /* content */
            EmailBody: `Cypress 자동화 테스트 스위트가 성공적으로 완료되었습니다`,
        },
    },
});
