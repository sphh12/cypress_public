export CYPRESS_RECORD_KEY="de5c757d-fd5f-44ff-b890-5fd02449b49f"
yarn cypress install
apt-get update && apt-get install -y curl
mkdir -p result



# # #  단일 스크립트 실행
NO_COLOR=1 yarn cypress run --record --key $CYPRESS_RECORD_KEY \
    --spec "cypress/e2e/test/GME/gme.cy.js" \
    --browser chrome 2>&1 | tee ./result/orign.txt

sed -n '/Run Finished/,$p' ./result/orign.txt > ./result/result.txt

> ./result/result_html.txt

node ./shell/visualization.js

export file_content=$(cat ./result/result_html.txt)
export date=`date +"%Y.%m.%d (%a)" `
export subject="자동화 테스트 결과"
export environment="Docker"

sh ./shell/curl3.sh