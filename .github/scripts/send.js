import fs from 'fs'
import https from 'https'

// const model = 'gemini-pro'
const model = 'gemini-1.5-pro-latest'
const issue = process.argv[2];
console.log(`Received issue for processing: ${issue}`);

function readFile() {
    fs.readFile('out/all_files.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        // console.log('File content:', data);
        accessWebsite(data, issue);
    });
}

function accessWebsite(files, issue) {
    const data = JSON.stringify({
        "contents": [
            {
                "role": "user",
                "parts": {
                    "text": `ISSUE:
${issue}
FILES:
${files}
`
                }
            }
        ]
    });
    // console.log(data);
    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${model}:generateContent`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'x-goog-api-key': process.env.GOOGLE_API_KEY
        }
    };

    const req = https.request(options, (res) => {
        console.log('HTTP Status Code:', res.statusCode);
        let responseBody = '';
        res.on('data', (d) => {
            responseBody += d;
        });
        res.on('end', () => {
            const responseJson = JSON.parse(responseBody);
            const content = responseJson.candidates[0].content.parts[0].text;
            fs.writeFile('out/answer.txt', content, (err) => {
                if (err) {
                    console.error('Error writing the patch file:', err);
                } else {
                    console.log('Patch file written successfully.');
                }
            });
        });
    });

    req.on('error', (e) => {
        console.error('Error accessing the website:', e);
    });

    req.write(data);
    req.end();
}

// メイン関数の実行
readFile();