#!/bin/bash

echo "=== Cypress 테스트 시작 ==="

yarn cypress install

apt-get update && apt-get install -y curl netcat-openbsd || true

mkdir -p result

SPEC_FILE="${SPEC_FILE:-cypress/e2e/test/GME/gme.cy.js}"

echo "=== Cypress 테스트 실행 ==="
echo "실행 스크립트 : $SPEC_FILE"
# [record 모드] NO_COLOR=1 yarn cypress run --record --key $CYPRESS_RECORD_KEY --spec "$SPEC_FILE" --config specPattern="$SPEC_FILE" --browser chrome --headless 2>&1 | tee ./result/orign.txt || true
NO_COLOR=1 yarn cypress run --spec "$SPEC_FILE" --config specPattern="$SPEC_FILE" --browser chrome --headless 2>&1 | tee ./result/orign.txt || true

sed -n '/Run Finished/,$p' ./result/orign.txt > ./result/result.txt

# 리포트 경로 먼저 설정 (visualization.js에서 REPORT_PATH 참조)
HISTORY_DIR="/app/cypress-history"
TIMESTAMP=$(date +"%y%m%d_%H%M")
REPORT_DIR="$HISTORY_DIR/report_${TIMESTAMP}"
mkdir -p "$REPORT_DIR"
export REPORT_PATH="$REPORT_DIR/report_${TIMESTAMP}.html"

> ./result/result_html.txt
node ./shell/visualization.js

# HTML 리포트 파일 저장
cp ./cypress/reports/html/index.html "$REPORT_DIR/report_${TIMESTAMP}.html"
echo "=== HTML 리포트 저장 완료: $REPORT_DIR/report_${TIMESTAMP}.html ==="

# 실패한 테스트의 비디오 파일 복사 (성공한 비디오는 cypress.config.js에서 자동 삭제됨)
if [ -d "./cypress/videos" ] && [ "$(ls -A ./cypress/videos 2>/dev/null)" ]; then
    mkdir -p "$REPORT_DIR/videos"
    mv ./cypress/videos/* "$REPORT_DIR/videos/"
    echo "=== 비디오 파일 저장 완료: $REPORT_DIR/videos/ ==="
else
    echo "=== 비디오 파일 없음 (모든 테스트 성공) ==="
fi
export file_content=$(cat ./result/result_html.txt)
export date=$(date +"%Y.%m.%d (%a)")
export subject="자동화 테스트 결과"
export environment="${ENVIRONMENT:-Docker}"

echo "=== 이메일 발송 ==="
sh ./shell/curl.sh

echo "=== 테스트 완료 ==="