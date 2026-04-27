const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// 설정
const CREDENTIALS_PATH = './credentials.json';
const REPORT_FILE = './cypress/reports/html/index.html';
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'YOUR_FOLDER_ID_HERE';

async function uploadToDrive() {
    try {
        // 인증
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // 파일명 생성 (날짜 포함)
        const date = new Date().toISOString().split('T')[0];
        const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
        const fileName = `cypress-report-${date}-${time}.html`;

        // 파일 업로드
        const fileMetadata = {
            name: fileName,
            parents: [FOLDER_ID],
        };

        const media = {
            mimeType: 'text/html',
            body: fs.createReadStream(REPORT_FILE),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        // 파일 공개 설정 (링크가 있는 모든 사용자 접근 가능)
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // 공유 링크 가져오기
        const file = await drive.files.get({
            fileId: response.data.id,
            fields: 'webViewLink, webContentLink',
        });

        const downloadLink = file.data.webContentLink || file.data.webViewLink;
        
        console.log('UPLOAD_SUCCESS');
        console.log('FILE_ID:' + response.data.id);
        console.log('DOWNLOAD_LINK:' + downloadLink);
        
        // 링크를 파일로 저장 (curl3.sh에서 사용)
        fs.writeFileSync('./result/report_link.txt', downloadLink);
        
        return downloadLink;
    } catch (error) {
        console.error('UPLOAD_ERROR:', error.message);
        process.exit(1);
    }
}

uploadToDrive();