
// // 수정한 코드 - 251216-----------------------------------------------------

// const fs = require('fs');

// // 입력/출력 경로
// const inputFile = './result/result.txt';
// const outputFile = './result/result_html.txt';

// // 안전 읽기
// const data = fs.existsSync(inputFile) ? fs.readFileSync(inputFile, 'utf8') : '';
// const lines = data ? data.split('\n') : [];

// let index = 5;

// // 파서
// function parseData(lines) {
//   const results = [];
//   while (index < lines.length) {
//     const line = lines[index].trim();
//     if (!line) { index += 2; continue; }

//     const parts = line.split(/\s+/);
//     if (parts.length !== 10 || parts[0] !== '│') break;

//     const num = (s) => {
//       const n = parseInt(s, 10);
//       return Number.isFinite(n) ? n : 0; // 기본값 0으로 처리 (undefined 방지)
//     };

//     results.push({
//       pf: parts[1] || '-',
//       spec: parts[2] || '-',
//       time: parts[3] || '-',
//       tests: num(parts[4]),
//       passing: num(parts[5]),
//       failing: num(parts[6]),
//       pending: num(parts[7]),
//       skipped: num(parts[8]),
//     });
//     index += 2;
//   }

//   // 합계 라인 처리 (있을 때만)
//   let recorded_line = '';
//   if (index < lines.length) {
//     const result_line = lines[index].trim();
//     if (result_line) {
//       const p = result_line.split(/\s{2,}/);
//       results.push({
//         pf: p[0] || '-',
//         spec: p[1] || '-',
//         time: p[2] || '-',
//         tests: parseInt(p[3], 10) || 0,
//         passing: parseInt(p[4], 10) || 0,
//         failing: parseInt(p[5], 10) || 0,
//         pending: parseInt(p[6], 10) || 0,
//         skipped: parseInt(p[7], 10) || 0,
//       });
//     }
//   }

//   // 링크 라인 (안전 처리)
//   if (index + 5 < lines.length) {
//     recorded_line = (lines[index + 5] || '').trim();
//   }
//   return { results, recorded_line };
// }

// // 최소 스타일 + 클래스 재사용
// function buildHTML(results, recorded_line) {
//   const safeLinkText = recorded_line || '';
//   const linkParts = safeLinkText.split(/\s+/);
//   const href = linkParts[2] || '#';

//   const rows = results.map((r, i) =>
//     `<tr class="${i === results.length - 1 ? 'sum' : ''}">
//       <td>${r.pf}</td><td>${r.spec}</td><td>${r.time}</td>
//       <td>${r.tests}</td><td>${r.passing}</td><td>${r.failing}</td><td>${r.pending}</td><td>${r.skipped}</td>
//     </tr>`
//   ).join('');

//   const html =
//     `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cypress Test Results</title>
//       <style>
//         table{width:100%;border-collapse:collapse}
//         th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}
//         th{background:#f2f2f2}
//         tr.sum{background:#f2f2f2}
//         .pass{color:#0a0}.fail{color:#d00}
//       </style>
//     </head><body>
//       <h1>Cypress Test Results</h1>
//       <table>
//         <tr><th>P/F</th><th>Spec</th><th>Time</th><th>Tests</th><th>Passing</th><th>Failing</th><th>Pending</th><th>Skipped</th></tr>
//         ${rows}
//       </table>
//       ${href && href !== '#' ? `<p>${href}${safeLinkText}</a></p>` : ''}
//     </body></html>`;

//   return html;
// }

// // 미니파이
// function minifyHTML(html) {
//   return html
//     .replace(/<!--[\s\S]*?-->/g, '')
//     .replace(/\s{2,}/g, ' ')
//     .replace(/>\s+</g, '><')
//     .trim();
// }

// const { results, recorded_line } = parseData(lines);
// const html = minifyHTML(buildHTML(results, recorded_line));
// fs.writeFileSync(outputFile, html);
// console.log('HTML file generated:', outputFile, 'bytes=', Buffer.byteLength(html));











// 옛날 코드---------------------------------------------------

const fs = require('fs');
const path = require('path');

// 입력 파일 경로
const inputFile = './result/result.txt';

// 출력 파일 경로
const outputFile = './result/result_html.txt';

// 텍스트 파일 읽기
const data = fs.readFileSync(inputFile, 'utf8');
const lines = data.split('\n');
let index = 5;

const parseData = (lines) => { // 인자로 lines를 받게 수정
  const results = [];
  while (index < lines.length) {
    const line = lines[index].trim();
    if (line) {
      const parts = line.split(/\s+/);
      if (parts.length != 10 || parts[0] != "│") {
        break;
      }
      results.push({
        pf: parts[1],
        spec: parts[2],
        time: parts[3],
        tests: isNaN(parseInt(parts[4])) ? '-' : parseInt(parts[4]),
        passing: isNaN(parseInt(parts[5])) ? '-' : parseInt(parts[5]),
        failing: isNaN(parseInt(parts[6])) ? '-' : parseInt(parts[6]),
        pending: isNaN(parseInt(parts[7])) ? '-' : parseInt(parts[7]),
        skipped: isNaN(parseInt(parts[8])) ? '-' : parseInt(parts[8])
      });
    }
    index += 2;
  }

  if (index < lines.length) {
    const result_line = lines[index].trim();
    if (result_line) {
      const parts = result_line.split(/\s{2,}/);
      results.push({
        pf: parts[0],
        spec: parts[1],
        time: parts[2],
        tests: isNaN(parseInt(parts[3])) ? '-' : parseInt(parts[3]),
        passing: isNaN(parseInt(parts[4])) ? '-' : parseInt(parts[4]),
        failing: isNaN(parseInt(parts[5])) ? '-' : parseInt(parts[5]),
        pending: isNaN(parseInt(parts[6])) ? '-' : parseInt(parts[6]),
        skipped: isNaN(parseInt(parts[7])) ? '-' : parseInt(parts[7])
      });
    }
  }

  // Cloud 링크 또는 로컬 리포트 경로
  let recorded_line = (index + 5 < lines.length) ? lines[index + 5].trim() : '';

  // record 모드가 아닌 경우 로컬 리포트 경로 표시
  const reportPath = process.env.REPORT_PATH || '';
  if (!recorded_line && reportPath) {
    recorded_line = `__LOCAL_REPORT__${reportPath}`;
  }

  return { results, recorded_line };
};
// HTML 템플릿 생성
const generateHTML = (results, recorded_line) => {
  let linkHTML = '';
  if (recorded_line.startsWith('__LOCAL_REPORT__')) {
    const localPath = recorded_line.replace('__LOCAL_REPORT__', '');
    const windowsPath = localPath.replace('/app/cypress-history/', '바탕화면/cypress history/');
    linkHTML = `<p style="color:#555; font-size:14px;">📋 Mochawesome Report: <strong>${windowsPath}</strong></p>`;
  } else if (recorded_line) {
    const href = recorded_line.split(/\s+/)[2] || '#';
    linkHTML = `<a href="${href}">${recorded_line}</a>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Cypress Test Results</title>
  <style>
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    .passed {
      color: green;
    }
    .failed {
      color: red;
    }
  </style>
</head>
<body>
  <h1>Cypress Test Results</h1>
  <table>
    <tr style="background-color: #f2f2f2;">
      <th>P/F</th>
      <th>Spec</th>
      <th>Time</th>
      <th>Tests</th>
      <th>Passing</th>
      <th>Failing</th>
      <th>Pending</th>
      <th>Skipped</th>
    </tr>
    ${results.map((result, index) => `
    <tr style="background-color: ${index === results.length - 1 ? '#f2f2f2' : 'transparent'};">
      <td>${result.pf}</td>
      <td>${result.spec}</td>
      <td>${result.time}</td>
      <td>${result.tests}</td>
      <td>${result.passing}</td>
      <td>${result.failing}</td>
      <td>${result.pending}</td>
      <td>${result.skipped}</td>
    </tr>
    `).join('')}
  </table>
  ${linkHTML}
</body>
</html>
`;
};

// HTML 파일 작성
const { results, recorded_line } = parseData(lines); // 반환된 객체를 구조분해 할당
const html = generateHTML(results, recorded_line);
fs.writeFileSync(outputFile, html);

console.log('HTML file generated:', outputFile);

