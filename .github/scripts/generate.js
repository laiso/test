import fs from 'fs';
import path from 'path';
import * as minimatch from 'minimatch';

function concatenateFilesRecursively(dir, outputPath, basePath = dir) {
    try {
        const dirents = fs.readdirSync(dir, { withFileTypes: true });
        dirents.forEach((dirent) => {
            const fullPath = path.join(dir, dirent.name);
            if (shouldIgnore(fullPath, basePath)) {
                return; // Skip if matches .gitignore patterns
            }
            if (dirent.isDirectory()) {
                console.log(`Processing directory: ${fullPath}`);
                concatenateFilesRecursively(fullPath, outputPath, basePath);
            } else {
                console.log(`Processing file: ${fullPath}`);
                try {
                    const data = fs.readFileSync(fullPath, 'utf8');
                    const relativePath = path.relative(basePath, fullPath);
                    const header = `# ${relativePath}\n`;
                    const content = `${header}${data}\n\n`;
                    fs.appendFileSync(outputPath, content);
                } catch (err) {
                    console.error(`Error reading file: ${err}`);
                }
            }
        });
    } catch (err) {
        console.error(`Error occurred: ${err}`);
    }
}

function shouldIgnore(file, basePath) {
    const ignorePatterns = getIgnorePatterns(basePath);
    const isDirectory = fs.statSync(file).isDirectory();
    const relativePath = path.relative(basePath, file) + (isDirectory ? '/' : '');

    const isIgnored = ignorePatterns.some(pattern => {
        const match = minimatch.minimatch(relativePath, pattern, { dot: true, matchBase: true });
        return match;
    });
    console.log(`Final decision for ${relativePath}: ${isIgnored ? 'Ignored' : 'Included'}`);
    return isIgnored;
}

function getIgnorePatterns(directoryPath) {
    let ignorePatterns = [];
    const gitignorePath = path.join(directoryPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        ignorePatterns = gitignoreContent.split(/\r?\n/).filter(line => line && !line.startsWith('#'));
    }
    return ignorePatterns;
}

const directoryPath = process.argv[2] || '.';
const outputPath = path.join('out', 'all_files_concatenated.txt');
if (!fs.existsSync('out')) {
    fs.mkdirSync('out');
}
try {
    fs.writeFileSync(outputPath, '');
    concatenateFilesRecursively(directoryPath, outputPath);
} catch (err) {
    console.error(`Error writing file: ${err}`);
}