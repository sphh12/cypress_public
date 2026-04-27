# Shell 스크립트 가이드

shell 폴더의 스크립트 파일 용도와 호출 관계를 정리한 문서입니다.

---

## 활성 파일

### run-test.sh (Docker 메인 실행 스크립트)

| 항목 | 내용 |
|------|------|
| 용도 | Docker 환경에서 Cypress 테스트 실행 |
| 호출 | `docker-compose.yml` → `command: sh /app/shell/run-test.sh` |
| 실행 테스트 | `gme.cy.js` (SPEC_FILE 환경변수로 변경 가능) |
| 브라우저 | Chrome (headless) |

**실행 흐름:**
```
yarn cypress install
→ Cypress 테스트 실행 (--record --headless)
→ 결과 로그 저장 (result/orign.txt → result/result.txt)
→ visualization.js로 HTML 변환 (result/result_html.txt)
→ HTML 리포트 저장 (cypress-history/)
→ curl.sh로 이메일 발송
```

---

### run-sample.sh (Docker Dev 실행 스크립트)

| 항목 | 내용 |
|------|------|
| 용도 | gme_dev.cy.js 실행용 (Modify Customer Bank 등) |
| 호출 | docker-compose.yml의 SPEC_FILE 변경 시 사용 |
| 특이사항 | Xvfb 가상 디스플레이 설정 포함 (pyautogui 대응) |

**run-test.sh와의 차이점:**
- Xvfb 시작 로직 포함 (Linux/Docker 환경 감지)
- 기본 SPEC_FILE이 `gme_dev.cy.js`
- 이메일 제목에 "(GME Dev)" 포함

---

### curl.sh (이메일 발송)

| 항목 | 내용 |
|------|------|
| 용도 | Gmail SMTP로 테스트 결과 이메일 발송 |
| 호출 | run-test.sh, run-sample.sh에서 호출 |
| 인증 | 환경변수 SMTP_USER, SMTP_PASS 사용 |
| 수신자 | sph12.test@gmail.com, philiph@gmeremit.com |

**특징:**
- 본문만 전송 (HTML 첨부 없음)
- 환경변수로 SMTP 인증 정보 주입
- `result/result_html.txt` 내용을 이메일 본문으로 사용

---

### visualization.js (테스트 결과 HTML 변환)

| 항목 | 내용 |
|------|------|
| 용도 | Cypress 결과 텍스트 → 이메일 본문용 HTML 테이블 변환 |
| 호출 | run-test.sh, run-sample.sh에서 호출 |
| 입력 | `result/result.txt` (Cypress "Run Finished" 이후 로그) |
| 출력 | `result/result_html.txt` (HTML 테이블) |

**변환 항목:**
- P/F (통과/실패), Spec (파일명), Time (실행 시간)
- Tests, Passing, Failing, Pending, Skipped 수치
- Cypress Cloud Recorded Run 링크

**참고:** 파일 내부에 주석 처리된 개선 버전(1~117행)과 실제 실행되는 구버전(128~252행)이 혼재

---

## 호출 관계도

```
docker-compose.yml
  └── run-test.sh (메인)  /  run-sample.sh (dev)
        ├── yarn cypress run (테스트 실행)
        ├── visualization.js (결과 변환)
        └── curl.sh (이메일 발송)
```

---

## 아카이브 파일 (shell/archive/)

미사용 파일들을 보관한 폴더입니다. 필요 시 복원 가능합니다.

| 파일 | 원래 용도 | 아카이브 사유 |
|------|-----------|--------------|
| gme_main.sh | 단독 실행 스크립트 (gme.cy.js) | run-test.sh로 대체됨, RECORD_KEY 하드코딩 |
| gme_dev.sh | 단독 실행 스크립트 (구버전) | run-sample.sh로 대체됨, 주석 코드 대량 |
| gme_test3.sh | 단독 실행 스크립트 | run-test.sh로 대체됨 |
| test.sh | 이전 테스트 스크립트 | run-test.sh로 대체됨, 주석 코드 대부분 |
| curl.sh | 이메일 발송 (초기 버전) | curl.sh로 대체됨, 비밀번호 하드코딩 |
| curl_copy.sh | 이메일 발송 (고급 버전) | curl.sh로 대체됨, QP 인코딩+첨부 기능 |
| generate-summary.mjs | mochawesome JSON → 텍스트 요약 | 현재 미사용, visualization.js 사용 중 |
| upload-to-drive.js | Google Drive 리포트 업로드 | 어디서도 호출되지 않음 |

---

## 환경변수 의존성

| 환경변수 | 사용 파일 | 설명 |
|----------|-----------|------|
| CYPRESS_RECORD_KEY | run-test.sh, run-sample.sh | Cypress Cloud 기록 키 |
| SPEC_FILE | run-test.sh, run-sample.sh | 실행할 테스트 파일 경로 |
| SMTP_USER | curl.sh | Gmail 계정 |
| SMTP_PASS | curl.sh | Gmail 앱 비밀번호 |
| ENVIRONMENT | run-test.sh, run-sample.sh | 이메일 제목에 표시 (Docker 등) |

---

## 작성 일시
- 작성: 2026-03-12
- 기준: shell 폴더 전체 파일 분석
