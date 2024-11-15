const fs = require('fs').promises;
const {
    inputPath, target, outputPath, changeFontPxToRem,
    logFileNames, logDirNames, logMergedSelectors,
    mergeDuplicateSelectors, tagsOrder, processAtsAndOrder
} = require('./config');

(async () => {
    if (!target.includes('.')) {
        sortFiles(target);
    } else {
        sortFile(inputPath, target);
    }
})();

async function sortFiles(path) {
    const dirs = await fs.readdir(inputPath + path);
    if (logDirNames) { console.log(path, dirs); }
    for (const dir of dirs) {
        if (dir.includes('.')) {
            await sortFile(inputPath, `${path}/${dir}`);
        } else {
            await sortFiles(`${path}/${dir}`);
        }
    }
}

async function sortFile(dirName, fileName) {
    if (logFileNames) { console.log(`Sort file: ${dirName}${fileName}`); }
    let text = await getFile(dirName + fileName);
    text = cleanText(text);
    let ats;
    [text, ats] = getAts(text);
    if (ats) {
        ats = ats.map(at => {
            const [title, css] = splitAtRule(at);
            const sortedCss = sortCss(css, true).replaceAll('}', '\t}');
            return `@${title} {\n${sortedCss}\n}\n`;
        }).toSorted().toSorted(sortAts).join('\n');
    }
    text = sortCss(text);
    if (ats) { text += '\n' + ats; }
    let dirs = fileName.split('/');
    if (dirs.length > 1) {
        dirs = dirs.slice(0, -1).join('/');
        await fs.mkdir(outputPath + dirs, { recursive: true });
    }
    if (logFileNames) { console.log(`Save file: ${outputPath}${fileName}`); }
    fs.writeFile(outputPath + fileName, text);
}

function cleanText(text) {
    return text.replaceAll('\r', '').replaceAll('\n', '');
}

function getAts(text) {
    let ats = text.split('@').slice(1);
    if (ats.length) {
        let extra = '';
        ats.filter(at => !processAtsAndOrder.includes(at.split(' ')[0])).map(at => extra += '@' + at);
        ats = ats.filter(at => processAtsAndOrder.includes(at.split(' ')[0]))
            .map(at => {
                const splited = at.split('}}');
                extra += splited[1] || '';
                return splited[0];
            });
        text = text.slice(0, text.indexOf('@')) + extra;
    } else {
        ats = '';
    }
    return [text, ats];
}

function splitAtRule(atRule) {
    const rules = atRule.split('{');
    const title = rules.shift();
    const css = rules.join('{');
    return [title, css];
}

function sortAts(a, b) {
    const ruleTypeA = atRuleType(a);
    const ruleTypeB = atRuleType(b);
    const ruleOrderA = processAtsAndOrder.indexOf(ruleTypeA);
    const ruleOrderB = processAtsAndOrder.indexOf(ruleTypeB);
    return ruleOrderA - ruleOrderB;
}

function atRuleType(cssRule) {
    return cssRule.split(' ')[0].slice(1);
}

function sortCss(text, media) {
    let arr = getCssArray(text, media);
    if (mergeDuplicateSelectors) {
        arr = mergeSameSelectors(arr);
    }
    return cssArrayToString(arr);
}

function mergeSameSelectors(arr) {
    arr.filter((firstRule, i) => i != arr.findIndex(secondRule => secondRule[0] == firstRule[0]))
        .forEach(secondRule => {
            const sameSelector = arr.find(firstRule => firstRule[0] == secondRule[0]);
            if (logMergedSelectors) { console.log(`Merge duplicate selector: ${secondRule[0].replaceAll('\n', ' ')}`); }
            if (sameSelector[1] && secondRule[1]) {
                sameSelector[1] += ';\n\t/* merged */\n' + secondRule[1];
            } else if ((sameSelector[1] || secondRule[1])) {
                sameSelector[1] = '\t/* merged */\n' + (sameSelector[1] ? sameSelector[1] : secondRule[1]);
            }
            secondRule[0] = 0;
        });
    return arr.filter(rule => rule[0]);
}

async function getFile(path) {
    const file = await fs.readFile(path);
    return file.toString();
}

function getCssArray(text, media) {
    return text.split('}').map(line => processLine(line, media))
        .filter(v => v[0]).toSorted((a, b) => sortTags(a[0], b[0]));
}

function sortTags(a, b) {
    const tagA = getFirstSelector(a);
    const tagB = getFirstSelector(b);
    const orderA = tagsOrder.indexOf(tagA);
    const orderB = tagsOrder.indexOf(tagB);
    if (orderA != orderB) { return orderA - orderB; }
    const sameName = tagA != 'class' ||
        b.split(',')[0].split(':')[0] == b.split(',')[0].split(':')[0];
    const hasPseudoA = a.includes(':');
    const hasPseudoB = b.includes(':');
    const pseudoLast = hasPseudoA - hasPseudoB;
    if (pseudoLast && sameName) { return pseudoLast; }
    const isGroupA = a.includes(',');
    const isGroupB = b.includes(',');
    const groupFirst = isGroupB - isGroupA;
    const depthGroupA = a.split(',')[0].split(' ').length;
    const depthGroupB = b.split(',')[0].split(' ').length;
    const groupIsNotDescendant = depthGroupA == depthGroupB;
    if (groupFirst && groupIsNotDescendant) { return groupFirst; }
    return a.localeCompare(b);
}

function getFirstSelector(text) {
    text = text.replaceAll('\t', '');
    if (text.at(0) == ':') { return 'root'; }
    if (text.at(0) == '*') { return '*'; }
    if (text.at(0) == '.') { return 'class'; }
    if (text.at(0) == '#') { return 'id'; }
    if (text.at(0) == '@') { return '@'; }
    let [firstTag] = text.split(' ');
    [firstTag] = firstTag.match(/^(\w+)/);
    if (!tagsOrder.includes(firstTag)) { return 'otherTags'; }
    return firstTag;
}

function processLine(line, media) {
    if (!line) { return [false]; }
    const style = line.trim().split('{');
    const selector = style[0]?.trim().split(',')?.filter(v => v).map(v => v.trim())
        .toSorted(sortTags).map(v => (media ? '\t' : '') + v).join(',\n');

    const values = style[1]?.trim().split(';')?.filter(v => v).map(v => v.trim())
        .toSorted((a, b) =>
            a.split(':')[0].localeCompare(b.split(':')[0])
        )?.map(v => {
            const [v1, v2] = v.split(':');
            if (changeFontPxToRem && v1 == 'font-size' && v2?.includes('px')) {
                const px = Number(v2.split('px')[0].trim());
                const rem = px / 16;
                v = `${v1}: ${rem}rem`;
            }
            return v;
        })?.map(v => (media ? '\t' : '') + '\t' + v.trim()).join(';\n');
    return [selector, values];
}

function cssArrayToString(arr) {
    return arr.map(l => l.join(' {\n') + (l[1] ? ';' : '')).join('\n}\n\n') + '\n}\n';
}