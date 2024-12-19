const { tagsOrder, processAtsAndOrder } = require('../../../config');

class SortCss {
    sortAtsArray(atsArray) {
        return atsArray
            .map(at => {
                const sortedCssArray = this.sortCssArray(at[1]);
                return [at[0], sortedCssArray];
            })
            .toSorted((a, b) => b[0] - a[0])
            .toSorted((a, b) => this.sortAts(a[0], b[0]));
    }

    sortAts(a, b) {
        const atRuleType = atRule => atRule.split(' ')[0];
        const ruleTypeA = atRuleType(a);
        const ruleTypeB = atRuleType(b);
        const ruleOrderA = processAtsAndOrder.indexOf(ruleTypeA);
        const ruleOrderB = processAtsAndOrder.indexOf(ruleTypeB);
        return ruleOrderA - ruleOrderB;
    }

    sortCssArray(cssArray) {
        return cssArray
            .map(rule => {
                if (rule[0].length > 1) {
                    rule[0] = rule[0].toSorted((a, b) => this.sortTags([a], [b]));
                }
                return rule;
            })
            .toSorted((a, b) => this.sortTags(a[0], b[0]));
    }

    sortTags(a, b) {
        const sameFirstSelector = a[0] == b[0];
        const mostSelectorsFirst = b.length - a.length;
        if (sameFirstSelector && mostSelectorsFirst) {
            return mostSelectorsFirst;
        }
        return this.getSelectorsOrder(a, b);
    }

    getSelectorsOrder(a, b) {
        let orderA;
        let orderB;
        const getTags = arr => arr[0].replace(/(\+ |> )/g, '').split(' ');
        const [tagsA, tagsB] = [getTags(a), getTags(b)];
        let i = 0;
        do {
            const firstTagA = tagsA.shift() || '';
            const firstTagB = tagsB.shift() || '';
            const tagA = this.getFirstSelector(firstTagA);
            const tagB = this.getFirstSelector(firstTagB);
            orderA = tagsOrder.indexOf(tagA);
            orderB = tagsOrder.indexOf(tagB);
            if (orderA != orderB) {
                return orderA - orderB;
            }
            const specialSort = this.sortSpecials(a[0], b[0], firstTagA, firstTagB, i);
            if (specialSort) {
                return specialSort;
            }
            i++;
        } while (orderA == orderB && (tagsA.length || tagsB.length));
        return a[0].localeCompare(b[0]);
    }

    getFirstSelector(selectors) {
        selectors = selectors?.replaceAll('\t', '');
        if (!selectors) {
            return 'root';
        }
        if (selectors == '#root') {
            return '#root';
        }
        if (selectors.at(0) == ':') {
            return 'root';
        }
        if (selectors.at(0) == '*') {
            return '*';
        }
        if (selectors.at(0) == '.') {
            return 'class';
        }
        if (selectors.at(0) == '#') {
            return 'id';
        }
        if (selectors.at(0) == '@') {
            return '@';
        }
        let [firstTag] = selectors.split(' ');
        [firstTag] = firstTag.match(/^(\w+)/);
        if (!tagsOrder.includes(firstTag)) {
            return 'otherTags';
        }
        return firstTag;
    }

    sortSpecials(a, b, firstTagA, firstTagB, i) {
        const getRemainder = list =>
            list
                .split(' ')
                .slice(i + 1)
                .join(' ');
        const sameLength = getRemainder(a) == getRemainder(b);
        const sameName = firstTagA.split(':')[0] == firstTagB.split(':')[0];
        const sameNameBracket = firstTagA.split('[')[0] == firstTagB.split('[')[0];
        const sameNameSub = firstTagA.slice(1).split('.')[0] == firstTagB.slice(1).split('.')[0];

        const pseudoLast = firstTagA.includes(':') - firstTagB.includes(':');
        const bracketLast = firstTagA.includes('[') - firstTagB.includes('[');
        const hasSubClassLast = firstTagA.slice(1).includes('.') - firstTagB.slice(1).includes('.');
        const matchNames = firstTagA.match(/^(\w+)/)?.at(1) == firstTagB.match(/^(\w+)/)?.at(1);
        const bothClasses = firstTagA[0] == '.' && firstTagB[0] == '.';
        const bothIds = firstTagA[0] == '#' && firstTagB[0] == '#';
        if (sameLength) {
            if (hasSubClassLast && pseudoLast) {
                return firstTagA.includes(':') ? 1 : -1;
            }
            if (bracketLast && pseudoLast) {
                return firstTagA.includes(':') ? 1 : -1;
            }
            if (sameNameSub && hasSubClassLast) {
                return hasSubClassLast;
            }
            if (sameName && pseudoLast) {
                return pseudoLast;
            }
            if (sameNameBracket && bracketLast) {
                return bracketLast;
            }
        }
        const compaire = firstTagA.localeCompare(firstTagB);
        if (
            (!matchNames && !sameNameSub && !sameNameBracket && compaire) ||
            ((bothClasses || bothIds) && compaire)
        ) {
            return compaire;
        }
    }
}

module.exports = new SortCss();
