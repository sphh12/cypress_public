# export CYPRESS_RECORD_KEY="f0448cc2-7bbf-4ce4-9c4b-59b30d5af72e"
export CYPRESS_RECORD_KEY="de5c757d-fd5f-44ff-b890-5fd02449b49f"
yarn cypress install
apt-get update && apt-get install -y curl

mkdir -p result

# 전체 스크립트 실행
# NO_COLOR=1 yarn cypress run --record --key $CYPRESS_RECORD_KEY \
#     --spec "cypress/e2e/test/" \
#     --browser chrome 2>&1 | tee ./result/orign.txt


# # #  단일 스크립트 실행
NO_COLOR=1 yarn cypress run --record --key $CYPRESS_RECORD_KEY --tag "GME Test"\
    --spec "cypress/e2e/test/GME/gme.cy.js" \
    --browser chrome 2>&1 | tee ./result/orign.txt


# NO_COLOR=1 yarn cypress-repeat run -n 2 \
#     --record --key $CYPRESS_RECORD_KEY \
#     --spec "A_FO-signup+profile+withdrawn.cy.js,cypress/e2e/test/BO-withdrawn_management.cy.js" \
#     --browser chrome 2>&1 | tee ./result/orign.txt
    
# --spec "cypress/e2e/test/FO-NonLogin.cy.js,cypress/e2e/test/A_FO-signup+profile+withdrawn.cy.js,cypress/e2e/test/BO-withdrawn_management.cy.js" \


sed -n '/Run Finished/,$p' ./result/orign.txt > ./result/result.txt

> ./result/result_html.txt

node ./shell/visualization.js

export file_content=$(cat ./result/result_html.txt)
export date=`date +"%Y.%m.%d (%a)" `
export subject="자동화 테스트 결과"
export environment="Docker"

sh ./shell/curl.sh
