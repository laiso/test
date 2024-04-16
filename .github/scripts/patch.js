import fs from 'fs'
import https from 'https'

// const model = 'gemini-pro'
const model = 'gemini-1.5-pro-latest'
const issue = "Add healthcheck endpoint to src/index.js"

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
                    "text": `generate a PATCH file as unidiff format for the given code and issue. 
RULES: 
- result must always be possible to successfully apply git-apply.
- Do not include tab characters in patch
ISSUE:
${issue}
FILES:
${files}
`
                }
            }
        ],
        "tools": [
            {
                "function_declarations": [
                    {
                        "name": "generate_patch_file",
                        "description": "generate a PATCH file as unidiff format for the given code and issue",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "content": {
                                    "type": "string",
                                    "description": ".patch file body"
                                },
                                "title": {
                                    "type": "string",
                                    "description": "one-line comment for patch"
                                },
                                "description": {
                                    "type": "string",
                                    "description": "more details for patch. what you did. why."
                                }
                            },
                            "required": [
                                "content",
                                "title",
                                "description"
                            ]
                        }
                    }
                ]
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
            console.log(responseBody)
            const responseJson = JSON.parse(responseBody);
            const patchContent = responseJson.candidates[0].content.parts[0].functionCall.args.content;
            const content = patchContent
                // .replace(/\\n/g, '\n')
                // .replace(/\\'/g, '\'')
                // .replace(/\t/g, '    ');
            fs.writeFile('out/generated_patch.patch', content, (err) => {
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