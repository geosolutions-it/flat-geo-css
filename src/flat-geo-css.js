/*
 * Copyright 2021, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// based on GeoTools CSSParser
// https://github.com/geotools/geotools/blob/master/modules/unsupported/css/src/main/java/org/geotools/styling/css/CssParser.java

import moo from 'moo';

const OPTIONAL_WHITESPACE = '(?:\r|\t|\f|\n| ){0,}';
const WHITESPACE = '(?:\r|\t|\f|\n| ){1,}';
const COMMA = '\\,';
const COLON = ':';
const DIGIT = '[0-9]';
const OPEN_BRACE = '{';
const CLOSE_BRACE_SEMICOLON = `}${OPTIONAL_WHITESPACE};`;
const CLOSE_BRACE = '}';
const NUMBER = `${DIGIT}{1,}`;
const NAME_CHARACTER = '[\\-\\_a-zA-Z0-9]';
const SCALE_NUMBER = `${DIGIT}{1,}(?:\\.${DIGIT}{0,}|)(?:k|M|G|)`;
const CATCH_ALL_SELECTOR = '\\*';
const MIN_SCALE_SELECTOR = `\\[${OPTIONAL_WHITESPACE}(?:@scale|@sd)${OPTIONAL_WHITESPACE}(?:>=|>)${OPTIONAL_WHITESPACE}${SCALE_NUMBER}${OPTIONAL_WHITESPACE}\\]`;
const MAX_SCALE_SELECTOR = `\\[${OPTIONAL_WHITESPACE}(?:@scale|@sd)${OPTIONAL_WHITESPACE}(?:<=|<)${OPTIONAL_WHITESPACE}${SCALE_NUMBER}${OPTIONAL_WHITESPACE}\\]`;
const IDENTIFIER = `(?:-|)[_a-zA-Z]${NAME_CHARACTER}{0,}`;
const ID_SELECTOR = `#${IDENTIFIER}(?:\\:${IDENTIFIER}|)(?:\\.[^\\"|\\'|\\[|\\]|\\r|\\t|\\f|\\n| ]{1,}|)`;
const CLASS_NAME = 'mark|stroke|fill|symbol|shield|background'
const PSEUDO_CLASS_SELECTOR = `:(?:${CLASS_NAME})`;
const NUMBERED_PSEUDO_CLASS_SELECTOR = `:nth\\-(?:${CLASS_NAME})\\(${NUMBER}\\)`;
const QUALIFIED_IDENTIFIER = `${IDENTIFIER}(?:\\:${IDENTIFIER}|)`;
const TYPE_NAME_SELECTOR = QUALIFIED_IDENTIFIER;
const SINGLE_QUOTE_STRING = `\\'[^\\"|\\'|\\[|\\]]{0,}\\'`;
const DOUBLE_QUOTE_STRING = `\\"[^\\"|\\'|\\[|\\]]{0,}\\"`;
const ECQL = `\\[(?:${SINGLE_QUOTE_STRING}|${DOUBLE_QUOTE_STRING}|[^\\"|\\'|\\[|\\]]{0,}){1,}\\]`;
const ECQL_SELECTOR = ECQL;
const COMMENT = `\\/\\*[^\\*\\/]*?\\*\\/`;
const WHITE_SPACE_OR_COMMENT = `(?:${COMMENT}|${WHITESPACE}){0,}`;
const BASIC_SELECTOR =
    '(?:' +
        CATCH_ALL_SELECTOR +
        '|' + MIN_SCALE_SELECTOR +
        '|' + MAX_SCALE_SELECTOR +
        '|' + ID_SELECTOR +
        '|' + PSEUDO_CLASS_SELECTOR +
        '|' + NUMBERED_PSEUDO_CLASS_SELECTOR +
        '|' + TYPE_NAME_SELECTOR +
        '|' + ECQL_SELECTOR +
    ')';
const SELECTOR = `${BASIC_SELECTOR}(?:${OPTIONAL_WHITESPACE}${BASIC_SELECTOR}|${OPTIONAL_WHITESPACE}${COMMA}${OPTIONAL_WHITESPACE}${BASIC_SELECTOR}){0,}`
const NONE = 'none';
const SIMPLE_URL = `[a-zA-Z0-9-\\._\\]\\:\\/\\?\\#\\[\\]\\@\\|\\$\\&'\\*\\+\\,\\;\\=]{1,}`;
const QUOTED_URL = `\\'${SIMPLE_URL}\\'`;
const URL = '(?:' +
    QUOTED_URL +
    '|' + SIMPLE_URL +
    ')';
const URL_FUNCTION = `url${OPTIONAL_WHITESPACE}\\(${OPTIONAL_WHITESPACE}${URL}${OPTIONAL_WHITESPACE}\\)`;
const SYMBOL_FUNCTION = `symbol${OPTIONAL_WHITESPACE}\\(${OPTIONAL_WHITESPACE}${URL}${OPTIONAL_WHITESPACE}\\)`;
const HEX = '[a-fA-F0-9]';
const COLOR = `#(?:${HEX}${HEX}${HEX}${HEX}${HEX}${HEX}|${HEX}${HEX}${HEX})`;
const MEASURE = `${DIGIT}{1,}(?:\\.${DIGIT}{0,}|)(?:k|M|G|px|m|ft|%|deg|)`;
const MIXED_EXPRESSION = `\\[${OPTIONAL_WHITESPACE}[^\\[;]*?${OPTIONAL_WHITESPACE}\\]`;
const VARIABLE_VALUE = `@${IDENTIFIER}`
const QUOTED_NAME_CHARACTER = `\\'.*?\\'`;
const VAL = '(?:' +
    NONE +
    '|' + COLOR +
    '|' + MEASURE +
    '|' + QUOTED_NAME_CHARACTER +
    '|' + VARIABLE_VALUE +
    ')';
const FUNC = `${QUALIFIED_IDENTIFIER}${OPTIONAL_WHITESPACE}\\(${OPTIONAL_WHITESPACE}${VAL}(?:${OPTIONAL_WHITESPACE},${OPTIONAL_WHITESPACE}${VAL}${OPTIONAL_WHITESPACE}){0,}${OPTIONAL_WHITESPACE}\\)`;
const KEY_VAL = '(?:' +
    NONE +
    '|' + FUNC +
    '|' + COLOR +
    '|' + MEASURE +
    '|' + QUOTED_NAME_CHARACTER +
    '|' + VARIABLE_VALUE +
    ')';
const TRANSFORM_FUNCTION = `${QUALIFIED_IDENTIFIER}${OPTIONAL_WHITESPACE}\\(${OPTIONAL_WHITESPACE}${KEY_VAL}(?:${OPTIONAL_WHITESPACE},${OPTIONAL_WHITESPACE}${KEY_VAL}${OPTIONAL_WHITESPACE}){0,}${OPTIONAL_WHITESPACE}\\)`;
const STRING_VALUE = `\\'[^;\\'\\[\\]]*?\\'`;
const TEXT = `(?:${MIXED_EXPRESSION}|${STRING_VALUE}){1,}`;
const SIMPLE_VALUE = '(?:' +
    NONE +
    '|' + URL_FUNCTION +
    '|' + SYMBOL_FUNCTION +
    '|' + TRANSFORM_FUNCTION +
    '|' + COLOR +
    // '|' + NAMED_COLOR +
    '|' + MEASURE +
    '|' + IDENTIFIER + // Value Identifier
    '|' + VARIABLE_VALUE +
    '|' + TEXT +
    '|' + MIXED_EXPRESSION +
    ')';
const MULTI_VALUE = `${SIMPLE_VALUE}(?:${WHITESPACE}${SIMPLE_VALUE}){1,}`;
const VALUE = '(?:' +
    SIMPLE_VALUE +
    '|' + MULTI_VALUE +
    ')';
const PROPERTY = '' +
    WHITE_SPACE_OR_COMMENT +
    IDENTIFIER +
    OPTIONAL_WHITESPACE +
    COLON +
    OPTIONAL_WHITESPACE +
    VALUE +
    OPTIONAL_WHITESPACE +
    '(?:' +
    ',' +
    OPTIONAL_WHITESPACE +
    VALUE +
    '){0,}'
    + ';';

const DIRECTIVE = `@(?:mode|styleTitle|styleAbstract)${WHITESPACE}${SINGLE_QUOTE_STRING};`
const OPERATOR = `${WHITESPACE}(?:in|IN|not in|NOT IN|is|IS|like|ilike|LIKE|ILIKE|\\=|\\>|\\>\\=|\\<|\\<\\=|\\<\\>)${WHITESPACE}`;

function parseSelectorValue(value) {
    const isString = !!value.match(/'/g);
    if (isString) {
        return value.replace(new RegExp(`\\'([^\\"|\\'|\\[|\\]]{0,})\\'`, 'g'), '$1');
    }
    const numberValue = parseFloat(value);

    if (!isNaN(numberValue)) {
        return numberValue;
    }

    const trimValue = value.trim();

    if (trimValue === 'true' || trimValue === 'false') {
        return ['bool', trimValue];
    }

    return trimValue;
}

function getSelectorValue(value) {
    if (value.match(new RegExp(CATCH_ALL_SELECTOR)) && !value.match(new RegExp(ECQL_SELECTOR))) {
        return {
            value,
            type: 'allSelector'
        };
    }
    if (value.match(new RegExp(MIN_SCALE_SELECTOR))) {
        const operator = value.match(/>=|>/g)?.[0];
        const [ variable, scaleString ] = value
            .replace(/\[|\]/g, '')
            .split(new RegExp(`${OPTIONAL_WHITESPACE}(?:>=|>)${OPTIONAL_WHITESPACE}`));
        const scale = parseFloat(scaleString.replace(/k|M|G/g, ''));
        const suffix = scaleString.match(/(?:k|M|G)/g)?.[0];
        return {
            value,
            type: 'minScaleSelector',
            expression: [
                operator,
                ['get', variable],
                suffix
                    ? ['measure', scale, suffix]
                    : scale
            ]
        };
    }
    if (value.match(new RegExp(MAX_SCALE_SELECTOR))) {
        const operator = value.match(/<=|</g)?.[0];
        const [ variable, scaleString ] = value
            .replace(/\[|\]/g, '')
            .split(new RegExp(`${OPTIONAL_WHITESPACE}(?:<=|<)${OPTIONAL_WHITESPACE}`));
        const scale = parseFloat(scaleString.replace(/k|M|G/g, ''));
        const suffix = scaleString.match(/(?:k|M|G)/g)?.[0];
        return {
            value,
            type: 'maxScaleSelector',
            expression: [
                operator,
                ['get', variable],
                suffix
                    ? ['measure', scale, suffix]
                    : scale
            ]
        };
    }
    if (value.match(new RegExp(ID_SELECTOR))) {
        return {
            value,
            type: 'idSelector'
        };
    }
    if (value.match(new RegExp(PSEUDO_CLASS_SELECTOR))) {
        return {
            value,
            type: 'pseudoClassSelector'
        };
    }
    if (value.match(new RegExp(NUMBERED_PSEUDO_CLASS_SELECTOR))) {
        return {
            value,
            type: 'numberedPseudoClassSelector'
        };
    }
    if (value.match(new RegExp(ECQL_SELECTOR))) {

        const operators = {
            '=': '==',
            '>': '>',
            '>=': '>=',
            '<': '<',
            '<=': '<=',
            '<>': '!=',
            'like': 'like',
            'ilike': 'ilike',
            'LIKE': 'like',
            'ILIKE': 'ilike'
        };

        const OR = `${WHITESPACE}(?:or|OR)${WHITESPACE}`;
        const AND = `${WHITESPACE}(?:and|AND)${WHITESPACE}`;
        const any = value
            .match(new RegExp(OR, 'g')) && 'any';
        const all = value
            .match(new RegExp(AND, 'g')) && 'all';
        if (any && all) {
            throw new Error('or and operators');
        }
        const regex = any ? OR : AND;
        const expression = value
            .replace(/\[|\]/g, '')
            .split(new RegExp(regex, 'g'))
            .map((filter) => {
                const regex = new RegExp(OPERATOR);
                const operator = filter.match(regex)?.[0]?.trim?.();
                const operand = filter.split(new RegExp(OPERATOR));
                if (operators[operator]) {
                    return [
                        operators[operator],
                        ['get', operand[0]],
                        parseSelectorValue(operand[1])
                    ];
                }
                if ((operator === 'is' || operator === 'IS')
                && (operand[1] === 'null' || operand[1] === 'NULL')) {
                    return [
                        'isnull',
                        ['get', operand[0]]
                    ];
                }
                if (operator === 'in'
                || operator === 'not in'
                || operator === 'IN'
                || operator === 'NOT IN') {
                    const literal = operand[1]
                        .replace(/\(|\)/g, '')
                        .split(',')
                        .map((val => parseSelectorValue(val.trim())));
                    const inExpression = [
                        'in',
                        ['get', operand[0]],
                        ['literal', literal]
                    ];
                    return (operator === 'not in' || operator === 'NOT IN')
                        ? ['!', inExpression]
                        : inExpression
                }
                throw new Error(`
                operator not supported in selector: ${value}
                supported operators: ${Object.keys(operators).join(' ')}`);
            });
        return {
            value,
            expression: expression.length > 1 ? [any || all, ...expression] : expression[0],
            type: 'eCQLSelector'
        };
    }
    if (value.match(new RegExp(TYPE_NAME_SELECTOR))) {
        return {
            value,
            type: 'typeNameSelector'
        };
    }
    return {
        value,
        type: 'basicSelector'
    };
}

function getPropertyValue(value, key) {
    if (value.match(new RegExp(MULTI_VALUE))) {
        const values = value.match(new RegExp(SIMPLE_VALUE, 'g'));
        return ['array', ...values.map(val => getPropertyValue(val))]
    }
    if (value.match(new RegExp(URL_FUNCTION))) {
        const url = value.replace(new RegExp(`url${OPTIONAL_WHITESPACE}\\(${OPTIONAL_WHITESPACE}(${URL})${OPTIONAL_WHITESPACE}\\)`, 'g'), '$1');
        return ['url', url.replace(/'(.*?)'/g, '$1')];
    }
    if (value.match(new RegExp(SYMBOL_FUNCTION))) {
        const symbol = value.replace(new RegExp(`symbol${OPTIONAL_WHITESPACE}\\(${OPTIONAL_WHITESPACE}(${URL})${OPTIONAL_WHITESPACE}\\)`, 'g'), '$1');
        return ['symbol', symbol.replace(/'(.*?)'/g, '$1')];
    }
    if (value.match(new RegExp(MIXED_EXPRESSION)) && key !== 'label') {
        const content = value.replace(new RegExp(`\\[${OPTIONAL_WHITESPACE}([^\\[;]*?)${OPTIONAL_WHITESPACE}\\]`, 'g'), '$1');
        const operator = content.match(new RegExp(`${VALUE}(?:${WHITESPACE}(\\*|\\/|\\+|\\-)${WHITESPACE}${VALUE}){0,}`))?.[1];
        const operands = content.match(new RegExp(VALUE, 'g'));
        if (!operator) {
            return [ 'brace', getPropertyValue(operands[0]) ];
        }
        return [
            'brace',
            [
                operator,
                getPropertyValue(operands?.[0]),
                getPropertyValue(operands?.[1])
            ]
        ];
    }

    if (value.match(new RegExp(TRANSFORM_FUNCTION))) {
        const identifier = value.match(QUALIFIED_IDENTIFIER)?.[0];
        const args = value.replace(identifier, '').match(new RegExp(KEY_VAL, 'g'));
        return [
            identifier,
            ...args.map(arg => getPropertyValue(arg))
        ];
    }
   
    if (value.match(new RegExp(TEXT))) {
        const parts = value
            .match(new RegExp(`${MIXED_EXPRESSION}|${STRING_VALUE}`, 'g'))
            .map((part) => {
                if (part.match(new RegExp(STRING_VALUE)) && !part.match(new RegExp(MIXED_EXPRESSION))) {
                    return part.replace(/'([^;'[\]]*?)'/, '$1');
                }
                return getPropertyValue(part);
            });
        return parts.length === 1
            ? parts[0]
            : ['text', ...parts];
    }
    if (value.match(new RegExp(COLOR))) {
        return ['hex', value];
    }
    if (value.match(new RegExp(MEASURE))) {
        const measure = parseFloat(value.replace(/k|M|G|px|m|ft|%|deg/g, ''));
        const suffix = value.match(/(?:k|M|G|px|m|ft|%|deg)/g)?.[0];
        return suffix
            ? ['measure', measure, suffix]
            : measure;
    }
    if (value.match(new RegExp(IDENTIFIER))) {
        return ['get', value];
    }
    return value;
}

let lexer = moo.compile({
    directive: {
        match: new RegExp(DIRECTIVE),
        value: (token) => {
            const key = token.match(/@(:?mode|styleTitle|styleAbstract)/)[0];
            const value = token.match(/'.*?'/)[0].replace(/'(.*?)'/g, '$1');
            return {
                key,
                value
            };
        }
    },
    whitespace: {
        match: new RegExp(WHITESPACE),
        lineBreaks: true,
        value: (token) => ({
            value: token
        })
    },
    property: {
        match: new RegExp(PROPERTY),
        value: (token) => {
            const comment = token
                .match(new RegExp(WHITE_SPACE_OR_COMMENT))[0]
                .trim();
            const key = token
                .match(new RegExp(IDENTIFIER + OPTIONAL_WHITESPACE + COLON))[0]
                .replace(/:/, '')
                .trim();
            const value = token
                .replace(new RegExp(WHITE_SPACE_OR_COMMENT), '')
                .replace(new RegExp(IDENTIFIER + OPTIONAL_WHITESPACE + COLON), '')
                .match(new RegExp(`${SIMPLE_VALUE}(?:${WHITESPACE}${SIMPLE_VALUE}){0,}`, 'g'))
                .map(val => getPropertyValue(val, key));
            return {
                comment,
                key,
                value
            };
        }
    },
    openBrace: {
        match: new RegExp(OPEN_BRACE),
        value: (token) => ({
            value: token
        })
    },
    closeBraceSemicolon: {
        match: new RegExp(CLOSE_BRACE_SEMICOLON),
        value: (token) => ({
            value: token
        })
    },
    closeBrace: {
        match: new RegExp(CLOSE_BRACE),
        value: (token) => ({
            value: token
        })
    },
    selector: {
        match: new RegExp(WHITE_SPACE_OR_COMMENT + SELECTOR),
        value: (token) => {
            const comment = token
                .match(new RegExp(WHITE_SPACE_OR_COMMENT))[0]
                .trim();
            const title = comment
                ?.match(new RegExp(`@title${OPTIONAL_WHITESPACE}(\\:){0,1}${OPTIONAL_WHITESPACE}.*?\\*\\/`))
                ?.[0]
                ?.replace(new RegExp(`@title${OPTIONAL_WHITESPACE}(\\:){0,1}|\\*\\/`, 'g'), '')
                ?.trim();
            const source = comment
                ?.match(new RegExp(`@source${OPTIONAL_WHITESPACE}(\\:){0,1}${OPTIONAL_WHITESPACE}.*?\\*\\/`))
                ?.[0]
                ?.replace(new RegExp(`@source${OPTIONAL_WHITESPACE}(\\:){0,1}|\\*\\/`, 'g'), '')
                ?.trim();
            const selectorsWithoutComment = token.replace(new RegExp(WHITE_SPACE_OR_COMMENT), '');
            const selectorsOrGroupsString = selectorsWithoutComment.split(new RegExp(`\\]${OPTIONAL_WHITESPACE},${OPTIONAL_WHITESPACE}\\[`, 'g'));
            const selectorsGroups = selectorsOrGroupsString
                .map((selectorGroup, idx) => {
                    if (idx === 0) {
                        return selectorGroup + ']';
                    }
                    if (idx === selectorsOrGroupsString.length - 1) {
                        return '[' + selectorGroup;
                    }
                    return '[' + selectorGroup + ']'
                });
            const value = selectorsGroups
                .map(selectors =>
                    selectors
                        .match(new RegExp(BASIC_SELECTOR, 'g'))
                        .map(selector => getSelectorValue(selector))
                );
            return {
                source,
                title,
                comment,
                value
            };
        }
    }
});

function pipe(...functions) {
    return function(arg) {
        return functions.reduce((value, func) => func(value), arg);
    };
}

function tokenize(styleSheet) {
    lexer.reset(styleSheet);
    return Array.from(lexer);
}

function mapTokens(tokens) {
    return tokens.map(({ type, value, line, col, text }) => ({
        ...value,
        type,
        line,
        col,
        text
    }));
}

const ROOT_SELECTOR = [ 'typeNameSelector' ];

function checkSelectorValidity(tokens) {
    const singleSelector = [ 'pseudoClassSelector', 'numberedPseudoClassSelector', 'allSelector', 'typeNameSelector' ];
    
    tokens
        .filter(({ type }) => type === 'selector')
        .forEach(({ value, line, col, text, level }) => {
            const types = value.map((or) => or.map(and => and.type));
            const flatTypes = types.reduce((previous, current) => [ ...previous, ...current ]);
            if (flatTypes.length > 1 && flatTypes.find((flatType) => singleSelector.indexOf(flatType) !== -1)) {
                throw { line, col, text };
            }
            if (flatTypes.length === 1 && ROOT_SELECTOR.indexOf(flatTypes[0]) !== -1 && level !== 1) {
                throw { line, col, text };
            }
        });
    return tokens;
}

function assignLevelGroupRuleIds(tokens) {
    let levelCount = 0;
    let lastLevel = 0;
    let groupCount = 0;
    let rule = 0;
    return tokens
        .filter(({ type }) => type !== 'whitespace' && type !== 'directive')
        .map((token) => {
            lastLevel = levelCount;
            const { type } = token || {};
            if (type === 'openBrace') { levelCount++; rule++; }
            if (type === 'closeBrace' || type === 'closeBraceSemicolon') { levelCount--; }
            const level = (type === 'selector'
                || type === 'closeBrace'
                || type === 'closeBraceSemicolon')
                ? levelCount + 1
                : levelCount;
            let group = groupCount;
            if (lastLevel === 1 && level === 1 && type === 'closeBrace') {
                groupCount++;
                rule = 0;
                group = groupCount - 1;
            }
            return {
                ...token,
                ...(type === 'selector' && { rule }),
                level,
                group
            };
        });
}

function groupTokensByGroupLevelId(tokens) {
    const tokensObject = tokens.reduce((acc, token) => {
        const key = `${token.group}:${token.level}`;
        return {
            ...acc,
            [key]: acc[key]
                ? [ ...acc[key], token ]
                : [ token ]
        };
    }, {});
    return Object.keys(tokensObject).map((key) => {
        const grouped = tokensObject[key]
            .reduce((acc, token) => {
                if (acc.length > 0) {
                    const currentAcc = acc.filter((tkn, idx) => idx < acc.length - 1);
                    const lastEntry = [ ...acc[acc.length - 1], token ];
                    return [
                        ...currentAcc,
                        lastEntry,
                        ...(token.type === 'closeBrace'|| token.type === 'closeBraceSemicolon' ? [[]] : [])
                    ];
                }
                return [[ token ]];
            }, []);
        return grouped;
    });
}

function cleanTokens(tokens) {
    return tokens.reduce((acc, grouped) => {
        return [
        ...acc,
        ...grouped
            .filter((group) => group.length > 0)
            .map((group) =>
                group.map((token) => ({
                    ...token,
                    rule: group[0].rule
                })))
        ];
    }, []);
}

function sortTokens(tokens) {
    return [...tokens].sort((a, b) => {
        if (a[0].group === b[0].group) {
            return a[0].rule > b[0].rule ? 1 : -1;
        }
        return a[0].group > b[0].group ? 1 : -1;
    });
}

function parseRules(rules) {
    return rules
        .map((tokens) => {
            const {
                title,
                value: selector,
                level,
                group,
                rule
            } = tokens.find((token) => token.type === 'selector') || {};
            const properties = tokens
                .filter((token) => token.type === 'property')
                .reduce((acc, token) => ({
                    ...acc,
                    [token.key]: token.value
                }), {});
            return {
                ...(title && { title }),
                selector,
                properties,
                level,
                group,
                rule
            };
        });
}

function getActiveRules(rules) {
    return rules.map((rule, ruleIndex) => {
        const { level, group } = rule;
        if (level === 1) {
            return rule;
        }
        const activeRules = [
            ...rules
                .filter((otherRule, idx) => idx < ruleIndex
                    && otherRule.group === group
                    && otherRule.level < level),
            rule
        ];
        if (activeRules.length === 1) {
            return rule;
        }
        return {
            ...rule,
            activeRules
        }
    })
}

function getSingleSelector(selector) {
    return selector && selector.length === 1 && selector[0].length === 1 && selector[0][0] || {};
}

function assignPseudoSelector(rules) {
    const pseudoClassSelectors = rules.reduce((acc, rule) => {
        const { level, group, rule: ruleId, activeRules, selector, properties } = rule;
        if (!activeRules) {
            return acc;
        }
        if (getSingleSelector(selector).type === 'pseudoClassSelector'
        || getSingleSelector(selector).type === 'numberedPseudoClassSelector') {
            const { level: parentLevel, group: parentGroup, rule: parentRuleId } = activeRules[activeRules.length - 2];
            return {
                ...acc,
                [`${level}:${group}:${ruleId}`]: 'remove',
                [`${parentLevel}:${parentGroup}:${parentRuleId}`]: {
                    ...acc[`${parentLevel}:${parentGroup}:${parentRuleId}`],
                    [selector[0][0].value]: properties
                }
            };
        }
        return acc;
    }, {});
    return rules
        .filter((rule) => {
            const { level, group, rule: ruleId } = rule;
            return pseudoClassSelectors[`${level}:${group}:${ruleId}`] !== 'remove';
        })
        .map((rule) => {
            const { level, group, properties, rule: ruleId } = rule;
            if (pseudoClassSelectors[`${level}:${group}:${ruleId}`]) {
                return {
                    ...rule,
                    properties: {
                        ...properties,
                        ...pseudoClassSelectors[`${level}:${group}:${ruleId}`]
                    }
                }
            }
            return rule;
        });
}

function assignLayer(rules) {
    return rules.map((rule) => {
        const { activeRules } = rule;
        if (!activeRules) {
            return rule;
        }
        const layerSelector = (activeRules.find(({ selector }) => getSingleSelector(selector).type === 'typeNameSelector' ) || {}).selector;
        const layer = getSingleSelector(layerSelector).value;
        return {
            ...rule,
            layer,
            activeRules: activeRules.filter(({ selector }) => getSingleSelector(selector).type !== 'typeNameSelector')
        }
    });
}

function combineRules(rules) {
    return rules.map((rule) => {
        const { activeRules, layer } = rule;
        if (!activeRules) {
            const { selector, properties, title } = rule;
            return {
                ...(title && { title }),
                ...(layer && { layer }),
                selector,
                properties
            };
        }
        const selector = activeRules
            .map((rule) => rule.selector)
            .reduce((previous, current) => {
                let combinations = [];
                previous.forEach((startRule) => {
                    current.forEach((endRule) => {
                        combinations.push([ ...startRule, ...endRule ]);
                    });
                });
                return combinations;
            });
        const properties = activeRules
            .map((rule) => rule.properties)
            .reduce((previous, current) => ({
                ...previous,
                ...current
            }));
        const title = activeRules
            .map((rule) => rule.title)
            .reduce((acc, ruleTitle) => [
                ...acc,
                ...(ruleTitle && [ ruleTitle ] || [])
            ], [])
            .join(', ');
        return {
            ...(title && { title }),
            ...(layer && { layer }),
            selector,
            properties
        };
    });
}

function getScaleDenominator(rules) {
    const getScaleSelectors = (selector) => {
        return selector.reduce((acc, or, idx) => {
            const minScaleSelectors = or.filter(({ type }) => type === 'minScaleSelector');
            const maxScaleSelectors = or.filter(({ type }) => type === 'maxScaleSelector');
            const scales = [
                minScaleSelectors[minScaleSelectors.length - 1],
                maxScaleSelectors[maxScaleSelectors.length - 1]
            ];
            const key =  `${scales?.[0]?.value || ''}${scales?.[1]?.value || ''}` || 'noScale';
            if (acc[key]) {
                return {
                    ...acc,
                    [key]: {
                        selectorIndex: [ ...acc[key].selectorIndex, idx ],
                        scales
                    }
                };
            }
            return {
                ...acc,
                [key]: {
                    selectorIndex: [ idx ],
                    scales
                }
            };
        }, {});
    }
    return rules.reduce((acc, rule) => {
        const scaleSelectors = getScaleSelectors(rule.selector);
        const selector = rule.selector.map((or) => or
            .filter(({ type }) => !(type === 'minScaleSelector' || type === 'maxScaleSelector')));
        const types = selector.map((or) => or.map(and => and.type));
        const flatTypes = types.reduce((previous, current) => [ ...previous, ...current ]);
        return [
            ...acc,
            ...Object.keys(scaleSelectors)
                .map((key) => {
                    const { selectorIndex = [], scales } = scaleSelectors[key];
                    const minScale = scales[0]?.expression;
                    const maxScale = scales[1]?.expression;
                    const isRootSelector = flatTypes.length === 1 && flatTypes[0] === 'allSelector';
                    return {
                        ...rule,
                        selector: isRootSelector
                            ? '*'
                            : [
                                'any',
                                ...selector
                                    .filter((or, idx) => selectorIndex.indexOf(idx) !== -1)
                                    .map((or)  => ['all', ...or.map((and) => and?.expression)])
                            ],
                        ...(minScale && { 'min-scale': minScale }),
                        ...(maxScale && { 'max-scale': maxScale })
                    };
                })
        ];
    }, []);
}

function removeEmptyProperties(rules) {
    return rules.filter(({ properties }) => Object.keys(properties).length > 0);
}

function getPseudoSelectorByIndex(selector, idx) {
    return Object.keys(selector).reduce((acc, key) => ({
        ...acc,
        [key]: selector[key][idx] === undefined
            ? selector[key][0]
            : selector[key][idx]
    }), {});
}

function splitProperties(rules) {
    let group = 0;
    return rules
        .reduce((newRules, rule) => {
            group++;
            const propertiesKeys = Object.keys(rule?.properties);
            const maxCountOfValues = Math.max.apply(null,
                propertiesKeys
                    .filter((key) => !key.match(new RegExp(`(?:${PSEUDO_CLASS_SELECTOR}|${NUMBERED_PSEUDO_CLASS_SELECTOR})`)))
                    .map((key) => rule?.properties?.[key]?.length)
                    .filter(value => value));
            const range = Object.keys([...new Array(maxCountOfValues)]);
            const split = range
                .map((idx) => {
                    return propertiesKeys.reduce((acc, key) => {
                        if (key.match(new RegExp(PSEUDO_CLASS_SELECTOR))) {
                            return {
                                ...acc,
                                [key]: getPseudoSelectorByIndex(rule?.properties?.[key], idx)
                            };
                        }
                        if (key.match(new RegExp(NUMBERED_PSEUDO_CLASS_SELECTOR))) {
                            const numberedPseudoClassSelector = key.match(new RegExp(`:nth\\-((?:${CLASS_NAME}))\\((${NUMBER})\\)`));
                            const className = numberedPseudoClassSelector?.[1];
                            const nth = numberedPseudoClassSelector?.[2];
                            return {
                                ...acc,
                                ...(nth !== undefined && (parseFloat(nth) - 1) + '' === idx
                                    && { [`:${className}`]: getPseudoSelectorByIndex(rule?.properties?.[key], idx) })
                            };
                        }
                        const value = rule?.properties[key][idx] ?? rule?.properties[key][0];
                        return {
                            ...acc,
                            ...(value !== undefined && value !== null && { [key]: value })
                        };
                    }, {});
                });
            return [
                ...newRules,
                ...split.map((properties) => ({
                    ...rule,
                    properties,
                    group
                }))
            ];
        }, []);
}

export function read(styleSheet) {
    const tokens = pipe(
        tokenize,
        mapTokens
    )(styleSheet);
    const directive = tokens
        .filter(({ type }) => type === 'directive')
        .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});
    const rules = pipe(
        assignLevelGroupRuleIds,
        checkSelectorValidity,
        groupTokensByGroupLevelId,
        cleanTokens,
        sortTokens,
        parseRules,
        getActiveRules,
        assignPseudoSelector,
        assignLayer,
        combineRules,
        getScaleDenominator,
        removeEmptyProperties,
        splitProperties
    )(tokens);
    return {
        directive,
        rules
    };
}

function writeExpression(expression, options) {
    if (expression === undefined) {
        return undefined;
    }
    if (typeof expression === 'string' || expression instanceof String) {
        return `'${expression}'`;
    }
    if (!isNaN(expression)) {
        return expression;
    }
    const [ operator, ...args ] = expression;
    const operators = {
        '==': '=',
        '>': '>',
        '>=': '>=',
        '<': '<',
        '<=': '<=',
        '!=': '<>',
        'like': 'like',
        'ilike': 'ilike',
        'LIKE': 'like',
        'ILIKE': 'ilike'
    };
    switch (operator) {
        case '+':
        case '-':
        case '*':
        case '/':
            return `${writeExpression(args[0])} ${operator} ${writeExpression(args[1])}`;
        case 'any':
            return args.map((arg) => writeExpression(arg)).join(' or ');
        case 'all':
            return args.map((arg) => writeExpression(arg)).join(' and ');
        case 'isnull':
            return writeExpression(args[0]) + ' is null';
        case '>':
        case '<':
        case '>=':
        case '<=':
        case '!=':
        case '==':
        case 'like':
        case 'ilike':
            return writeExpression(args[0]) + ' ' + operators[operator] + ' ' + writeExpression(args[1]);
        case '!':
            return 	writeExpression(args[0], { prefix: 'not ' });
        case 'in':
            return writeExpression(args[0]) +
                ' ' +
                (options?.prefix || '') +
                'in (' + args
                    .filter((value, idx) => idx > 0)
                    .map(arg => writeExpression(arg))
                    .join('') +
                ')';
        case 'bool':
            return args[0];
        case 'literal':
            return args[0].map(arg => writeExpression(arg)).join(', ');
        case 'measure':
            return `${args[0]}${args[1] || ''}`;
        case 'recode':
        case 'categorize':
        case 'interpolate':
        case 'color-map-entry':
        case 'env':
            return `${operator}(${args.map(arg => writeExpression(arg)).join(', ')})`;
        case 'url':
        case 'symbol':
            return `${operator}('${args[0]}')`;
        case 'get':
            return args[0];
        case 'brace':
            return `[${args.map((arg) => writeExpression(arg))}]`;
        case 'array':
            return args.map((arg) => writeExpression(arg)).join(' ');
        case 'text':
            return args.map((arg) => writeExpression(arg)).join('');
        case 'hex':
            return args[0];
        default:
            return expression;
    }
}

function groupByRuleGroupId(rules) {
    let newRules = [];
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const lastGroup = newRules[newRules.length - 1] || {};
      const lastGroupId = lastGroup.group;
      if (lastGroupId !== undefined && lastGroupId === rule.group) {
        newRules[newRules.length - 1] = {
          ...lastGroup,
          properties: [
            ...(Array.isArray(lastGroup.properties)
                ? lastGroup.properties
                : [lastGroup.properties]),
            rule.properties
          ]
        };
      } else {
        newRules.push(rule);
      }
    }
    return newRules;
}

function writeValue(values, isPseudoSelector) {
    if (isPseudoSelector) {
        const propertiesGroups = Array.isArray(values)
            ? values
            : [ values ];
        const propertiesKeys = Object.keys(propertiesGroups[0]);
        return propertiesKeys.reduce((acc, key) => {
            return {
                ...acc,
                [key]: writeValue(propertiesGroups.map((properties) => properties[key]))
            };
        }, {});
    }
    const arrayValues = values.filter((value) => value !== undefined && value !== null);
    if (arrayValues.length === 1 || arrayValues.every((value, idx, arr) => value === arr[0])) {
        return arrayValues[0];
    }
    return arrayValues.join(', ');
}

function ensureAnyAllWrapperOnSelector(selector) {
    if (selector === '*') {
        return '*';
    }

    const [operator, ...others] = selector;
    if (operator !== 'any' && operator !== 'all') {
        return ['any', ['all', selector]];
    }
    if (operator === 'all') {
        return ['any', selector];
    }
    if (operator === 'any') {
        const ensureAndChildren = others.map(arg => {
            if (arg[0] !== 'all') {
                return ['all', arg];
            }
            return arg;
        });
        return ['any', ...ensureAndChildren];
    }

    return '*';
}

function writeExpressions(rules) {
    return (rules || []).map((rule) => {
        const minScale = rule?.['min-scale'] && writeExpression(rule['min-scale']);
        const maxScale = rule?.['max-scale'] && writeExpression(rule['max-scale']);
        const propertiesGroups = Array.isArray(rule.properties)
            ? rule.properties
            : [ rule.properties ];
        const propertiesKeys = Object.keys(propertiesGroups[0]);
        const selector = ensureAnyAllWrapperOnSelector(rule.selector);
        return {
            ...(rule?.title && { title: `/* @title ${rule.title} */`}),
            ...(rule?.layer && { layer: rule.layer }),
            selector: selector?.[0] === 'any'
                ? selector
                    .filter((or, idx) => idx > 0)
                    .map(or => [
                        ...or
                            .filter((and, idx) => idx > 0)
                            .map(and => '[' + writeExpression(and) + ']'),
                        ...(minScale && ['[' + minScale + ']'] || []),
                        ...(maxScale && ['[' +maxScale + ']'] || [])
                    ])
                : selector,
            properties: propertiesKeys
                .reduce((acc, key) => {
                    if (key.match(new RegExp(`(?:${PSEUDO_CLASS_SELECTOR}|${NUMBERED_PSEUDO_CLASS_SELECTOR})`))) {
                        return {
                            ...acc,
                            [key]: writeValue(propertiesGroups.map((properties) => Object.keys(properties[key])
                                .reduce((_acc, _key) => ({
                                    ..._acc,
                                    [_key]: writeExpression(properties[key][_key])
                                }), {})), true)
                        };
                    }
                    return {
                        ...acc,
                        [key]: writeValue(propertiesGroups.map((properties) => writeExpression(properties[key])))
                    };
                }, {})
        };
    });
}

function groupByLayer(rules) {
    return rules
        .map((rule) => rule.layer)
        .reduce((acc, layer, idx) => {
            if (layer === undefined) {
                return [
                    ...acc,
                    rules[idx]
                ]
            }
            const lastLayer = acc[acc.length - 1]?.layer;
            if (lastLayer !== undefined && lastLayer === layer) {
                return [
                    ...acc.filter((l, ruleIndex) => ruleIndex < acc.length - 1),
                    {
                        layer,
                        rules: [
                            ...acc[acc.length - 1].rules,
                            rules[idx]
                        ]
                    }
                ]
            }
            return [
                ...acc,
                {
                    layer,
                    rules: [rules[idx]]
                }
            ]
        }, []);
}

function writeRule(rule, options) {
    const baseTab = options?.baseTab || '';
    const tab = options?.tab || '  ';
    const title = rule?.title && rule?.title + '\n' || '';
    const selector = rule?.selector
    ? (rule.selector === '*' && '*' || rule.selector.map(or => baseTab + or.join('\n')).join(',\n'))
    : '';
    const properties = Object.keys(rule?.properties)
        .reduce((acc, key) => {
            if (key.match(new RegExp(`(?:${PSEUDO_CLASS_SELECTOR}|${NUMBERED_PSEUDO_CLASS_SELECTOR})`))) {
                const pseudoProperties = Object.keys(rule.properties[key])
                    .reduce((_acc, _key) => 
                        _acc + 
                        baseTab + tab + tab + _key + ': ' + rule.properties[key][_key] + ';\n'
                    , '');
                return acc +
                    baseTab + tab + key + ' {\n' +
                        pseudoProperties +
                    baseTab + tab + '};\n';
            }
            return acc +
                baseTab + tab + key + ': ' + rule.properties[key] + ';\n';
        }, '');
    return baseTab + title +
        selector + ' {\n' +
        properties +
        baseTab + '}\n';
}

function writeRules(rules) {
    const tab = '  ';
    return rules.reduce((acc, rule) => {
        if (rule.layer && rule.rules) {
            return acc +
            rule.layer + ' {\n' +
                rule.rules.map(nestedRule => writeRule(nestedRule, { tab, baseTab: tab })).join('') +
            '}\n';
        }
        return acc + writeRule(rule, { tab });
    }, '');
}

export function write(styleJSON) {
    const directive = Object.keys(styleJSON?.directive)
        .reduce((acc, key) => {
            return acc + key + ' \'' + styleJSON.directive[key] + '\';\n';
        }, '');
    const rules = pipe(
        groupByRuleGroupId,
        writeExpressions,
        groupByLayer,
        writeRules
    )(styleJSON?.rules);
    return directive + '\n' + rules;
}

export default {
    read,
    write
};
