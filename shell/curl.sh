#!/bin/bash

email_body_file=$(mktemp)

# 리포트 링크 가져오기
REPORT_LINK="${report_link:-}"

if [ -n "$REPORT_LINK" ]; then
    LINK_SECTION="<br><br><p><strong>📎 상세 HTML 리포트 다운로드:</strong></p><p><a href=\\"$REPORT_LINK\\">$REPORT_LINK</a></p>"
else
    LINK_SECTION=""
fi

cat <<EOF > $email_body_file
From: sph12.test@gmail.com
To: sph12.test@gmail.com, philiph@gmeremit.com
Subject: [$environment] $subject - $date
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

$file_content

$LINK_SECTION

EOF

SMTP_HOST="${SMTP_HOST:-smtp.gmail.com}"
SMTP_PORT="${SMTP_PORT:-587}"
SMTP_USER="${SMTP_USER:-sph12.test@gmail.com}"
SMTP_PASS="${SMTP_PASS}"

echo "SMTP 서버: $SMTP_HOST:$SMTP_PORT"
echo "이메일 크기: $(wc -c < $email_body_file) bytes"

curl -v --url "smtp://${SMTP_HOST}:${SMTP_PORT}" --ssl-reqd --mail-from "sph12.test@gmail.com" --mail-rcpt "sph12.test@gmail.com" --mail-rcpt "philiph@gmeremit.com" --user "${SMTP_USER}:${SMTP_PASS}" --upload-file "$email_body_file" --max-time 120 --connect-timeout 30

rm "$email_body_file"

echo "이메일 발송 완료!"