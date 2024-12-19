const fs = require('fs').promises;
const CssSorter = require('./lib/cssSorter');
const { inputPath, outputPath, clearOutputDir, logFileNames, logDirNames } = require('./config');

const stats = { dirs: 0, files: 0, rules: 0, merged: 0 };
const cssSorter = new CssSorter(stats);

(async () => {
    console.time('Sort time');
    if (clearOutputDir) {
        await fs.rm(outputPath, { recursive: true });
        await fs.mkdir(outputPath);
        console.log(`Cleared output dir: ${outputPath}\n`);
    }
    let dirName = inputPath.split('/');
    const target = '/' + dirName.pop();
    dirName = dirName.slice(0, -1).join('/');
    if (!target.includes('.')) {
        await sortFiles();
    } else {
        await sortFile(dirName, target);
    }
    console.log('\n-------------------------');
    console.timeEnd('Sort time');
    console.log(
        Object.entries(stats)
            .map(stat => `${stat[0].charAt(0).toUpperCase() + stat[0].slice(1)}:\t${stat[1]}`)
            .join('\n'),
        '\n-------------------------'
    );
})();

async function sortFiles(path = '') {
    stats.dirs++;
    const dirs = await fs.readdir(inputPath + path);
    if (logDirNames) {
        console.log(`Sort dir: ${path || '/'}  `, dirs);
    }
    for (const dir of dirs) {
        if (dir.includes('.')) {
            await sortFile(inputPath, `${path}/${dir}`);
        } else {
            await sortFiles(`${path}/${dir}`);
        }
    }
}

async function sortFile(dirName, fileName = '') {
    stats.files++;
    if (logFileNames) {
        console.log(`Sort file: ${dirName}${fileName}`);
    }
    let cssString = await fs.readFile(dirName + fileName);
    cssString = cssSorter.sortCssString(cssString.toString());
    let dirs = fileName.split('/');
    if (dirs.length > 1) {
        dirs = dirs.slice(0, -1).join('/');
        await fs.mkdir(outputPath + dirs, { recursive: true });
    }
    if (logFileNames) {
        console.log(`Save file: ${outputPath}${fileName}`);
    }
    fs.writeFile(outputPath + fileName, cssString);
}
