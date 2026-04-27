# ## 예전 코드 ##

email_body_file=$(mktemp)
cat <<EOF > $email_body_file
From: <sph12.test@gmail.com>
To: sph12.test@gmail.com, philiph@gmeremit.com
Subject: [$environment] $subject - $date
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="boundary-mixed"

--boundary-mixed
Content-Type: text/html; charset=UTF-8

$file_content

--boundary-mixed
Content-Type: text/plain
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="index.html"

$(base64 ./cypress/reports/html/index.html)

--boundary-mixed--
EOF


# GMAIL
curl -vvv --url 'smtp://smtp.gmail.com:587' \
     --ssl-reqd \
     --mail-from 'sph12.test@gmail.com' \
     --mail-rcpt 'sph12.test@gmail.com' \
     --mail-rcpt 'philiph@gmeremit.com' \
     --user 'sph12.test@gmail.com:mxol bprwybllqpdk' \
     --upload-file "$email_body_file" \
     --max-time 6000 \
     --connect-timeout 60     


# Clean up temporary file
rm "$email_body_file"





# # === 587/STARTTLS로 전송 ===
# curl -vvv --url 'smtp://smtp.gmail.com:587' \
#   --ssl-reqd \
#   --mail-from 'sph12.test@gmail.com' \
#   --mail-rcpt 'sph12.test@gmail.com' \
#   --mail-rcpt 'philiph@gmeremit.com' \
#   --user 'sph12.test@gmail.com:yddyelxnftylsfym' \
#   --upload-file "$email_body_file" \
#   --max-time 600




# # ## 백업 파일 251216 -- 본문 성공, 첨부파일 실패 -----------------------------


# email_body_file=$(mktemp)


# # 1. HTML 리포트 압축
# # zip -j ./cypress/reports/html/index.zip ./cypress/reports/html/index.html
# zip -r ./report.zip ./cypress/reports/html


# # 2. 이메일 본문 작성
# cat <<EOF > $email_body_file
# From: <sph12.test@gmail.com>
# To: sph12.test@gmail.com, philiph@gmeremit.com
# Subject: [$environment] $subject - $date
# MIME-Version: 1.0
# Content-Type: multipart/mixed; boundary="boundary-mixed"

# --boundary-mixed
# Content-Type: text/html; charset=UTF-8

# $file_content

# --boundary-mixed
# Content-Type: application/zip
# Content-Transfer-Encoding: base64
# Content-Disposition: attachment; filename="index.zip"

# $(base64 ./cypress/reports/html/index.zip)

# --boundary-mixed--
# EOF



# # 3. Gmail SMTP로 전송
# curl -vvv --url 'smtps://smtp.gmail.com:465' \
#      --mail-from 'sph12.test@gmail.com' \
#      --mail-rcpt 'sph12.test@gmail.com' \
#      --mail-rcpt 'philiph@gmeremit.com' \
#      --user 'sph12.test@gmail.com:yddyelxnftylsfym' \
#      --upload-file "$email_body_file" \
#      --max-time 600 --tlsv1.2

# # 4. 임시 파일 정리
# rm "$email_body_file"






# # 251216 조합-2 // 일단 성공 (본문 빈약) ---------------------



# #!/usr/bin/env sh
# # 목적: 본문은 확실히 표시(quoted-printable) + 첨부(index.html) 성공
# # - 본문: result_html.txt → 안전한 HTML로 래핑 후 quoted-printable 인코딩(인라인)
# # - 첨부: index.html(base64, 76자 줄바꿈, attachment)
# # - Recorded Run / cloud.cypress.io 라인 제거(본문 텍스트)
# # - 전체 CRLF 변환
# # - 587/STARTTLS 전송

# set -eu

# # === 메타데이터(외부 환경변수로 덮어쓰기 가능) ===
# environment=${environment:-"Docker"}
# subject=${subject:-"자동화 테스트 결과"}
# date_hdr=$(date -R)  # RFC 2822 형식 (예: Tue, 16 Dec 2025 07:15:00 +0900)

# # === 경로 정의 ===
# html_path="./cypress/reports/html/index.html"   # 첨부 원본
# text_summary_path="./result/result_html.txt"    # 본문으로 넣을 텍스트(메일 본문 표시 성공했던 소스)

# # 필수 파일 확인
# [ -f "$html_path" ] || { echo "[ERROR] Not found: $html_path" >&2; exit 1; }

# # === 본문 텍스트 준비: Recorded Run / cloud.cypress.io 라인 제거 ===
# sanitized_text_file="$(mktemp)"
# if [ -f "$text_summary_path" ]; then
#   sed -E '/cloud\.cypress\.io/d; /Recorded Run:/d' "$text_summary_path" > "$sanitized_text_file"
# else
#   # result_html.txt가 없으면 최소 안내 텍스트 생성
#   printf "Cypress Test Results\n\n- 자세한 내용은 첨부 index.html을 확인하세요.\n" > "$sanitized_text_file"
# fi

# # === 본문 HTML 생성(간단/안전한 구조: 스크립트/외부 링크 없음) ===
# inline_html_file="$(mktemp)"
# # 텍스트 이스케이프 (&, <, >) 후 <pre>로 감싸기
# escaped_text="$(sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' "$sanitized_text_file")"

# cat > "$inline_html_file" <<HTML
# <!doctype html>
# <html>
# <head>
# <meta charset="UTF-8">
# <title>Cypress Test Results</title>
# <style>
#   body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, sans-serif; line-height:1.5; }
#   pre { white-space: pre-wrap; word-break: break-word; }
#   .title { font-weight: 600; margin-bottom: 8px; }
# </style>
# </head>
# <body>
#   <div class="title">[$environment] $subject</div>
#   <pre>$escaped_text</pre>
#   <p>자세한 HTML 리포트는 첨부 <strong>index.html</strong>을 다운로드하여 확인하세요.</p>
# </body>
# </html>
# HTML

# # 본문 HTML 파일 존재/크기 확인
# [ -s "$inline_html_file" ] || { echo "[ERROR] inline_html_file is empty or missing: $inline_html_file" >&2; exit 1; }

# # === 본문 HTML을 quoted-printable 인코딩으로 변환(표준 호환 ↑) ===
# # Node가 stdin을 읽도록 구현 → 인자 누락 에러 회피
# qp_body_file="$(mktemp)"
# if command -v node >/dev/null 2>&1; then
#   # stdin → Node
#   cat "$inline_html_file" | node -e '
#   const fs = require("fs");
#   const input = fs.readFileSync(0, "utf8"); // read from stdin

#   function toQP(s) {
#     const lines = [];
#     let line = "";
#     const buf = Buffer.from(s, "utf8");

#     for (let i = 0; i < buf.length; i++) {
#       const b = buf[i];
#       if (b === 13) continue;        // ignore CR
#       if (b === 10) {                // LF → line break
#         // line-end space/tab must be encoded
#         if (line.endsWith(" ")) line = line.slice(0, -1) + "=20";
#         if (line.endsWith("\t")) line = line.slice(0, -1) + "=09";
#         lines.push(line);
#         line = "";
#         continue;
#       }
#       const ch = String.fromCharCode(b);
#       const printable = ((b >= 33 && b <= 126 && ch !== "=") || ch === " " || ch === "\t");
#       let token = printable ? ch : ("=" + b.toString(16).toUpperCase().padStart(2, "0"));

#       // QP 76-column soft wrap
#       if ((line.length + token.length) >= 76) {
#         if (line.endsWith(" ")) line = line.slice(0, -1) + "=20";
#         if (line.endsWith("\t")) line = line.slice(0, -1) + "=09";
#         lines.push(line + "=");  // soft break
#         line = "";
#       }
#       line += token;
#     }
#     if (line.length > 0) {
#       if (line.endsWith(" ")) line = line.slice(0, -1) + "=20";
#       if (line.endsWith("\t")) line = line.slice(0, -1) + "=09";
#       lines.push(line);
#     }
#     return lines.join("\r\n");
#   }

#   process.stdout.write(toQP(input));
#   ' > "$qp_body_file"
# else
#   # Node가 없으면: 본문을 text/plain(7bit)로 보내는 대안 처리(최소 호환)
#   # 후단에서 text/html(QP) 파트 대신 text/plain로 치환할 수 있도록 빈 파일 생성
#   printf "%s\n" "[WARN] Node not found; will fallback to text/plain body." >&2
#   : > "$qp_body_file"
# fi

# # === 첨부 base64(76자 줄바꿈; SMTP 줄 길이 제한 안전) ===
# if base64 --help 2>&1 | grep -q '\-w'; then
#   B64_ATTACH="base64 -w 76 \"$html_path\""   # GNU
# else
#   B64_ATTACH="base64 -b 76 \"$html_path\""   # BSD/macOS
# fi

# boundary_mixed="boundary-mixed-$(date +%s)"
# boundary_alt="boundary-alt-$(date +%s)"
# email_body_file="$(mktemp)"

# # === MIME 작성(LF로 작성 후 나중에 CRLF로 변환) ===
# # 최상위: multipart/mixed
# #   1) multipart/alternative: text/plain + text/html(QP inline)
# #   2) attachment: index.html(base64)
# cat > "$email_body_file" <<EOF
# From: <sph12.test@gmail.com>
# To: sph12.test@gmail.com, philiph@gmeremit.com
# Subject: [$environment] $subject - $(date '+%Y.%m.%d (%a)')
# Date: $date_hdr
# Message-ID: <$(date +%s).$(uuidgen 2>/dev/null || echo random)@gmail.com>
# MIME-Version: 1.0
# Content-Type: multipart/mixed; boundary="$boundary_mixed"

# --$boundary_mixed
# Content-Type: multipart/alternative; boundary="$boundary_alt"

# --$boundary_alt
# Content-Type: text/plain; charset=UTF-8
# Content-Transfer-Encoding: 7bit
# Content-Disposition: inline

# $(cat "$sanitized_text_file")
# EOF

# # 본문 HTML 파트: Node가 있으면 QP로, 없으면 text/plain만 유지
# if command -v node >/dev/null 2>&1 && [ -s "$qp_body_file" ]; then
#   cat >> "$email_body_file" <<EOF

# --$boundary_alt
# Content-Type: text/html; charset=UTF-8
# Content-Transfer-Encoding: quoted-printable
# Content-Disposition: inline

# $(cat "$qp_body_file")

# EOF
# fi

# # alternative 종료
# cat >> "$email_body_file" <<EOF
# --$boundary_alt--
# EOF

# # 첨부 파트
# cat >> "$email_body_file" <<EOF

# --$boundary_mixed
# Content-Type: text/html; charset=UTF-8; name="index.html"
# Content-Transfer-Encoding: base64
# Content-Disposition: attachment; filename="index.html"

# EOF

# # 첨부 base64(76자 줄바꿈)
# # shellcheck disable=SC2086
# eval $B64_ATTACH >> "$email_body_file"

# # mixed 종료
# cat >> "$email_body_file" <<EOF

# --$boundary_mixed--
# EOF

# # === CRLF 변환(SMTP/MIME 안전) ===
# if command -v perl >/dev/null 2>&1; then
#   perl -pe 's/\n/\r\n/g' -i "$email_body_file"
# else
#   tmp_crlf="$(mktemp)"
#   awk '{printf "%s\r\n", $0}' "$email_body_file" > "$tmp_crlf"
#   mv "$tmp_crlf" "$email_body_file"
# fi

# # === 587/STARTTLS로 전송 ===
# curl -vvv --url 'smtp://smtp.gmail.com:587' \
#   --ssl-reqd \
#   --mail-from 'sph12.test@gmail.com' \
#   --mail-rcpt 'sph12.test@gmail.com' \
#   --mail-rcpt 'philiph@gmeremit.com' \
#   --user 'sph12.test@gmail.com:yddyelxnftylsfym' \
#   --upload-file "$email_body_file" \
#   --max-time 600

# # === 임시 파일 정리(안전) ===
# : "${sanitized_text_file:=}" ; [ -n "$sanitized_text_file" ] && rm -f -- "$sanitized_text_file" || true
# : "${inline_html_file:=}"    ; [ -n "$inline_html_file" ]    && rm -f -- "$inline_html_file"    || true
# : "${qp_body_file:=}"        ; [ -n "$qp_body_file" ]        && rm -f -- "$qp_body_file"        || true
# : "${email_body_file:=}"     ; [ -n "$email_body_file" ]     && rm -f -- "$email_body_file"     || true
# ``

