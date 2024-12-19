const sortCss = require('./parts/sortCss');
const processCss = require('./parts/processCss');
const {
    addPxFontSizeToHtmlTag,
    logAddPxFontSizeToHtmlTag,
    logMergedSelectors,
    mergeDuplicateSelectors,
    addMergedComments,
} = require('../../config');

class CssSorter {
    stats = { dirs: 0, files: 0, rules: 0, merged: 0 };

    constructor(stats) {
        this.stats = stats;
        processCss.stats = stats;
    }

    sortCssString(cssString) {
        const [cssArray, atsArray] = processCss.cssStringToArray(cssString);
        let sortedCssArray = sortCss.sortCssArray(cssArray);
        if (mergeDuplicateSelectors) {
            sortedCssArray = this.mergeSameSelectors(sortedCssArray);
        }
        if (addPxFontSizeToHtmlTag) {
            this.addPxToHtmlTag(sortedCssArray);
        }
        const sortedAtsArray = sortCss.sortAtsArray(atsArray);
        const sortedCssString = this.cssArrayToString(sortedCssArray);
        const sortedAtsString = this.atsArrayToString(sortedAtsArray);
        return sortedCssString + sortedAtsString;
    }

    addPxToHtmlTag(sortedCssArray) {
        const htmlRule = sortedCssArray.findLast(rule => rule[0].toString() === 'html');
        if (htmlRule) {
            htmlRule[1] += `\n\tfont-size: ${addPxFontSizeToHtmlTag}px;`;
            if (logAddPxFontSizeToHtmlTag) {
                console.log(`Added "font-size: ${addPxFontSizeToHtmlTag}px;" to html Tag`);
            }
        }
    }

    atsArrayToString(sortedAtsArray) {
        return sortedAtsArray
            .map(at => {
                const cssString = this.cssArrayToString(at[1], true);
                return `\n@${at[0]} {\n${cssString}}`;
            })
            .join('\n');
    }

    cssArrayToString(cssArray, media) {
        return cssArray
            .map(rule => {
                rule[0] = rule[0].join(',\n');
                rule[0] = media ? `\t${rule[0].replaceAll('\n', '\n\t')}` : rule[0];
                return `${rule.join(' {')}\n${media ? '\t' : ''}}\n`;
            })
            .join('\n');
    }

    mergeSameSelectors(arr) {
        const comment = addMergedComments ? '\t/* merged */' : '';
        arr.filter(
            (rule, i) => i != arr.findIndex(rule2 => rule2[0].toString() == rule[0].toString())
        ).forEach(rule => {
            const sameSelector = arr.find(rule2 => rule2[0].toString() == rule[0].toString());
            this.stats.merged++;
            if (logMergedSelectors) {
                const selector = rule[0].toString().replaceAll('\n', ' ');
                console.log(`Merge duplicate selector: ${selector}`);
            }
            if (sameSelector[1] && rule[1]) {
                sameSelector[1] += `\n${comment}${rule[1]}`;
            } else if (sameSelector[1] || rule[1]) {
                sameSelector[1] = `${comment}${sameSelector[1] ? sameSelector[1] : rule[1]}`;
            }
            rule[0] = 0;
        });
        return arr.filter(rule => rule[0]);
    }
}

module.exports = CssSorter;
