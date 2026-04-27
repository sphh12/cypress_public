


#!/usr/bin/env bash
# 목적: Cypress 실행 → 요약 텍스트 생성 → 메일 전송
# - Cypress 리포트(index.html/.jsons)가 생성되어야 generate-summary가 동작합니다.
# - curl.sh는 본문을 QP 인코딩으로 전송하고 첨부(index.html)를 base64(76자 줄바꿈)로 전송합니다.

set -euo pipefail

# --- 사전 설정 ---
export CYPRESS_RECORD_KEY="${CYPRESS_RECORD_KEY:-de5c757d-fd5f-44ff-b890-5fd02449b49f}"
export SMTP_USER="${SMTP_USER:-sph12.test@gmail.com}"             # 환경변수로 치환 가능(권장)
export SMTP_APP_PASSWORD="${SMTP_APP_PASSWORD:-yddyelxnftylsfym}"                 # 반드시 앱 비밀번호(16자리) 필요
export RECIPIENTS="${RECIPIENTS:-sph12.test@gmail.com, philiph@gmeremit.com}"

# 제목/환경(필요 시 덮어쓰기)
export subject="${subject:-자동화 테스트 결과}"
export environment="${environment:-Docker}"

# --- 디렉터리 준비 ---
mkdir -p ./result

# --- zip 설치 (없으면 설치) ---
if ! command -v zip >/dev/null 2>&1; then
  apt-get update && apt-get install -y zip
fi

# --- Cypress 설치 (yarn 또는 npx 중 택1) ---
# yarn cypress install
npx cypress install

# --- Cypress 테스트 실행 + 로그 저장 ---
NO_COLOR=1 npx cypress run \
  --record \
  --key "$CYPRESS_RECORD_KEY" \
  --tag "GME Test" \
  --spec "cypress/e2e/test/GME/gme.cy.js" \
  --browser chrome \
  2>&1 | tee ./result/origin.txt

# (옵션) 전체 로그에서 "Run Finished" 이후만 추출
sed -n '/Run Finished/,$p' ./result/origin.txt > ./result/result.txt

# --- 리포트 존재 확인 (첨부로 보낼 파일) ---
if [ ! -f "./cypress/reports/html/index.html" ]; then
  echo "[ERROR] Cypress HTML report not found: ./cypress/reports/html/index.html" >&2
  exit 1
fi

# --- 이메일 본문용 요약 생성 ---
# generate-summary.mjs는 shell/ 하위에 있어야 상대경로가 올바릅니다.
if node ./shell/generate-summary.mjs; then
  echo "[INFO] Summary generated at ./result/result_html.txt"
else
  echo "[WARN] generate-summary.mjs 실패. fallback으로 간단 요약을 생성합니다."
  {
    echo "[Cypress 테스트 결과 요약]"
    echo "로그 파일: ./result/result.txt"
    echo
    sed -n '1,120p' ./result/result.txt
  } > ./result/result_html.txt
fi

# --- 메일 전송 ---
# curl.sh는 ./result/result_html.txt를 읽어 본문(QP 인라인)으로 보내고,
# ./cypress/reports/html/index.html을 첨부(base64, 76자 줄바꿈)로 보냅니다.
# 내부에서 587/STARTTLS + CRLF 변환 처리합니다.
SMTP_USER="$SMTP_USER" SMTP_APP_PASSWORD="$SMTP_APP_PASSWORD" RECIPIENTS="$RECIPIENTS" \
  sh ./shell/curl_copy.sh

echo "[DONE] 메일 전송 플로우 완료."
