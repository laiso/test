import { Octokit } from "@octokit/rest";
import { exec } from "child_process";

// GitHubの認証情報
const octokit = new Octokit({
    auth: process.env.GITHUB_ACCESS_TOKEN
});

// リポジトリの情報
const owner = 'laiso';
const repo = 'test';
const base = 'main'; // ベースブランチ
const branchSuffix = new Date().toISOString().replace(/[-:.]/g, '');
const head = `patch-branch-${branchSuffix}`; // パッチを適用するブランチ名を動的に生成

const title = 'Apply patch from generated_patch.patch'; // PRのタイトル
const body = 'This PR applies a patch from out/generated_patch.patch'; // PRの説明

// パッチファイルの適用とブランチの作成 
exec(`git checkout -b ${head} && git apply out/generated_patch.patch`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error applying patch: ${error}`);
        return;
    }
    console.log('Patch applied successfully.');

    // コミットとプッシュ
    exec(`git config user.email "temporary@example.com" && git config user.name "Temporary User"`, (configError) => {
        if (configError) {
            console.error(`Error setting git config: ${configError}`);
            return;
        }
        console.log('Git user config set successfully.');
    });
    exec(`git commit -am "Apply generated patch" && git push origin ${head}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error committing or pushing: ${error}`);
            return;
        }
        console.log('Commit and push successful.');

        // プルリクエストの作成
        try {
            const { data } = await octokit.pulls.create({
                owner,
                repo,
                title,
                body,
                head,
                base,
                maintainer_can_modify: true,
            });
            console.log(`Pull request created: ${data.html_url}`);
        } catch (error) {
            console.error(`Error creating pull request: ${error}`);
        }
    });
});