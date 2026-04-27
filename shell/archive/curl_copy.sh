
#!/usr/bin/env sh
# 목적: 본문은 확실히 표시(quoted-printable) + 첨부(index.html) 성공
# - 본문: result_html.txt → 안전한 HTML로 래핑 후 quoted-printable 인코딩(인라인)
# - 첨부: index.html(base64, 76자 줄바꿈, attachment)
# - Recorded Run / cloud.cypress.io 라인 제거(본문 텍스트)
# - 전체 CRLF 변환
# - 587/STARTTLS 전송

set -eu

# === 메타데이터(외부 환경변수로 덮어쓰기 가능) ===
environment=${environment:-"Docker"}
subject=${subject:-"자동화 테스트 결과"}
date_hdr=$(date -R)

# === 수신자/SMTP 계정(환경변수로 주입) ===
SMTP_USER=${SMTP_USER:-"sph12.test@gmail.com"}
SMTP_APP_PASSWORD=${SMTP_APP_PASSWORD:? "Gmail 앱 비밀번호(SMTP_APP_PASSWORD)가 필요합니다"}
RECIPIENTS=${RECIPIENTS:-"sph12.test@gmail.com, philiph@gmeremit.com"}

# === 경로 정의 ===
html_path="./cypress/reports/html/index.html"   # 첨부 원본
text_summary_path="./result/result_html.txt"    # 본문으로 넣을 텍스트

[ -f "$html_path" ] || { echo "[ERROR] Not found: $html_path" >&2; exit 1; }
[ -f "$text_summary_path" ] || { echo "[ERROR] Not found: $text_summary_path" >&2; exit 1; }

# === 본문 텍스트 준비: Recorded Run / cloud.cypress.io 라인 제거 ===
sanitized_text_file="$(mktemp)"
sed -E '/cloud\.cypress\.io/d; /Recorded Run:/d' "$text_summary_path" > "$sanitized_text_file"

# === 본문 HTML 생성(간단/안전한 구조: 스크립트/외부 링크 없음) ===
inline_html_file="$(mktemp)"
# HTML 이스케이프 (&, <, >)
escaped_text="$(sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' "$sanitized_text_file")"

cat > "$inline_html_file" <<HTML
<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<title>Cypress Test Results</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, sans-serif; line-height:1.5; }
  pre { white-space: pre-wrap; word-break: break-word; }
  .title { font-weight: 600; margin-bottom: 8px; }
</style>
</head>
<body>
  <div class="title">[$environment] $subject</div>
  <pre>$escaped_text</pre>
  <p>자세한 HTML 리포트는 첨부 <strong>index.html</strong>을 다운로드하여 확인하세요.</p>
</body>
</html>
HTML

[ -s "$inline_html_file" ] || { echo "[ERROR] inline_html_file is empty or missing: $inline_html_file" >&2; exit 1; }

# === 본문 HTML → quoted-printable 변환(표준 호환 ↑) ===
qp_body_file="$(mktemp)"
cat "$inline_html_file" | node -e '
const fs = require("fs");
const input = fs.readFileSync(0, "utf8"); // read from stdin
function toQP(s) {
  const lines = []; let line = "";
  const buf = Buffer.from(s, "utf8");
  for (let i = 0; i < buf.length; i++) {
    const b = buf[i];
    if (b === 13) continue;
    if (b === 10) {
      if (line.endsWith(" ")) line = line.slice(0, -1) + "=20";
      if (line.endsWith("\t")) line = line.slice(0, -1) + "=09";
      lines.push(line); line = ""; continue;
    }
    const ch = String.fromCharCode(b);
    const printable = ((b >= 33 && b <= 126 && ch !== "=") || ch === " " || ch === "\t");
    let token = printable ? ch : ("=" + b.toString(16).toUpperCase().padStart(2, "0"));
    if ((line.length + token.length) >= 76) {
      if (line.endsWith(" ")) line = line.slice(0, -1) + "=20";
      if (line.endsWith("\t")) line = line.slice(0, -1) + "=09";
      lines.push(line + "="); line = "";
    }
    line += token;
  }
  if (line.length > 0) {
    if (line.endsWith(" ")) line = line.slice(0, -1) + "=20";
    if (line.endsWith("\t")) line = line.slice(0, -1) + "=09";
    lines.push(line);
  }
  return lines.join("\r\n");
}
process.stdout.write(toQP(input));
' > "$qp_body_file"

# === 첨부 base64(76자 줄바꿈; SMTP 줄 길이 제한 안전) ===
if base64 --help 2>&1 | grep -q '\-w'; then
  B64_ATTACH="base64 -w 76 \"$html_path\""   # GNU
else
  B64_ATTACH="base64 -b 76 \"$html_path\""   # BSD/macOS
fi

boundary_mixed="boundary-mixed-$(date +%s)"
boundary_alt="boundary-alt-$(date +%s)"
email_body_file="$(mktemp)"

# === MIME 작성(LF로 작성 후 나중에 CRLF로 변환) ===
cat > "$email_body_file" <<EOF
From: <$SMTP_USER>
To: $RECIPIENTS
Subject: [$environment] $subject - $(date '+%Y.%m.%d (%a)')
Date: $date_hdr
Message-ID: <$(date +%s).$(uuidgen 2>/dev/null || echo random)@gmail.com>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="$boundary_mixed"

--$boundary_mixed
Content-Type: multipart/alternative; boundary="$boundary_alt"

--$boundary_alt
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 7bit
Content-Disposition: inline

$(cat "$sanitized_text_file")

--$boundary_alt
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable
Content-Disposition: inline

$(cat "$qp_body_file")

--$boundary_alt--
EOF

# 첨부 파트
cat >> "$email_body_file" <<EOF

--$boundary_mixed
Content-Type: text/html; charset=UTF-8; name="index.html"
Content-Transfer-Encoding: base64
Content-Disposition: attachment; filename="index.html"

EOF

# 첨부 base64(76자 줄바꿈)
# shellcheck disable=SC2086
eval $B64_ATTACH >> "$email_body_file"

# mixed 종료
cat >> "$email_body_file" <<EOF

--$boundary_mixed--
EOF

# === CRLF 변환(SMTP/MIME 안전) ===
if command -v perl >/dev/null 2>&1; then
  perl -pe 's/\n/\r\n/g' -i "$email_body_file"
else
  tmp_crlf="$(mktemp)"
  awk '{printf "%s\r\n", $0}' "$email_body_file" > "$tmp_crlf"
  mv "$tmp_crlf" "$email_body_file"
fi

# === 587/STARTTLS로 전송 ===
curl -vvv --url 'smtp://smtp.gmail.com:587' \
  --ssl-reqd \
  --mail-from "$SMTP_USER" \
  $(printf -- " --mail-rcpt %s" "$(echo "$RECIPIENTS" | tr ',' '\n' | xargs)") \
  --user "$SMTP_USER:$SMTP_APP_PASSWORD" \
  --upload-file "$email_body_file" \
  --max-time 600

# === 임시 파일 정리(안전) ===
: "${sanitized_text_file:=}" ; [ -n "$sanitized_text_file" ] && rm -f -- "$sanitized_text_file" || true
: "${inline_html_file:=}"    ; [ -n "$inline_html_file" ]    && rm -f -- "$inline_html_file"    || true
: "${qp_body_file:=}"        ; [ -n "$qp_body_file" ]        && rm -f -- "$qp_body_file"        || true
: "${email_body_file:=}"     ; [ -n "$email_body_file" ]     && rm -f -- "$email_body_file"     || true
``
