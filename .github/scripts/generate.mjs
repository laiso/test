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
    const filesData = [];
    files.forEach(file => {
        if (!file.startsWith('.github/')) {
            const fullPath = path.join(basePath, file);
            try {
                const data = fs.readFileSync(fullPath, 'utf8').replace(/"/g, '""'); // Escape double quotes
                filesData.push(`"${file}","${data}"`); // Format as CSV
            } catch (err) {
                console.error(`Error reading file: ${err}`);
            }
        }
    });
    return filesData;
}
const directoryPath = process.argv[2] || '.';
const outputDir = 'out'
const outputPath = path.join(outputDir, 'all_files.csv'); // Change output file extension to .csv
try {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const filesData = concatenateFilesUsingGit(directoryPath);
    fs.writeFileSync(outputPath, filesData.join('\n')); // Write each file data as a new line in CSV format
} catch (err) {
    console.error(`Error writing file: ${err}`);
}