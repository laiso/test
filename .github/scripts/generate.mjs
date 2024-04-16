import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process';

function getGitTrackedFiles(basePath) {
    const command = `git -C ${basePath} ls-files`;
    try {
        const stdout = execSync(command);
        return stdout.toString().split(/\r?\n/).filter(line => line);
    } catch (err) {
        console.error(`Error executing git ls-files: ${err}`);
        return [];
    }
}

function concatenateFilesUsingGit(basePath) {
    const files = getGitTrackedFiles(basePath);
    const filesData = {};
    files.forEach(file => {
        const fullPath = path.join(basePath, file);
        try {
            const data = fs.readFileSync(fullPath, 'utf8');
            filesData[file] = data; // Store file content under its path
        } catch (err) {
            console.error(`Error reading file: ${err}`);
        }
    });
    return filesData;
}

const directoryPath = process.argv[2] || '.';
const outputPath = path.join('out', 'all_files.json');
if (!fs.existsSync('out')) {
    fs.mkdirSync('out');
}
try {
    const filesData = concatenateFilesUsingGit(directoryPath);
    fs.writeFileSync(outputPath, JSON.stringify(filesData));
} catch (err) {
    console.error(`Error writing file: ${err}`);
}