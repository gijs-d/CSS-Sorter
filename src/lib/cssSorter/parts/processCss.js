const { changeFontPxToRem, processAtsAndOrder } = require('../../../config');

class ProcessCss {
    stats = { dirs: 0, files: 0, rules: 0, merged: 0 };

    cssStringToArray(cssString) {
        cssString = cssString.replaceAll('\r', '').replaceAll('\n', '');
        return this.splitCssAndAts(cssString);
    }

    splitCssAndAts(cssString) {
        let atsArray = cssString.split('@').slice(1);
        if (atsArray.length) {
            let extra = atsArray
                .filter(at => !processAtsAndOrder.includes(at.split(' ')[0]))
                .map(at => '@' + at)
                .join('');
            atsArray = atsArray
                .filter(at => processAtsAndOrder.includes(at.split(' ')[0]))
                .map(at => {
                    const splitOn = at.includes('}}') ? '}}' : '}';
                    const splited = at.split(splitOn);
                    extra += splited[1] || '';
                    return splited[0];
                });
            cssString = cssString.slice(0, cssString.indexOf('@')) + extra;
            atsArray = this.processAts(atsArray);
        }
        const cssArray = this.getCssArray(cssString, false);
        return [cssArray, atsArray];
    }

    processAts(ats) {
        return ats.map(at => {
            const [title, cssString] = this.splitAtRule(at);
            const cssArray = this.getCssArray(cssString, true);
            return [title, cssArray];
        });
    }

    splitAtRule(at) {
        const rules = at.split('{');
        const title = rules.shift();
        const css = rules.join('{');
        return [title.trim(), css];
    }

    getCssArray(cssString, media) {
        return cssString
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('}')
            .map(line => this.processLine(line, media))
            .filter(rule => rule[0]);
    }

    processLine(line, media) {
        if (!line) {
            return [false];
        }
        this.stats.rules++;
        const rule = line.trim().split('{');
        const selector = this.processSelector(rule[0]);
        const values = this.processValues(rule[1], media) || [];
        return [selector, values];
    }

    processSelector(selectorString) {
        return selectorString
            ?.trim()
            .split(',')
            .filter(selector => selector)
            .map(selector => selector.trim());
    }

    processValues(valuesString, media) {
        return valuesString
            ?.trim()
            .split(';')
            .filter(value => value)
            .map(value => value.trim())
            .toSorted((a, b) => a.split(':')[0].localeCompare(b.split(':')[0]))
            .map(value => {
                const [v1, v2] = value.split(':');
                if (changeFontPxToRem && v1 == 'font-size' && v2?.includes('px')) {
                    const px = Number(v2.split('px')[0].trim());
                    const rem = px / 16;
                    value = `${v1}: ${rem}rem`;
                }
                return `\n${media ? '\t' : ''}\t${value.trim()};`;
            })
            .join('');
    }
}

module.exports = new ProcessCss();
