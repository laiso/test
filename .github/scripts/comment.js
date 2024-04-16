import fs from 'fs';
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN
});


const owner = 'laiso';
const repo = 'test';
const issue_number = 2; // Issue番号を指定

fs.readFile('out/answer.txt', 'utf8', (err, data) => {
  if (err) {
    console.error("ファイルの読み込み中にエラーが発生しました:", err);
    return;
  }
  

  octokit.issues.createComment({
    owner,
    repo,
    issue_number,
    body: data
  }).then(() => {
    console.log('Issueにコメントが投稿されました。');
  }).catch(err => {
    console.error('コメントの投稿に失敗しました:', err);
  });
});