function interpretFacts(facts) {
    let interpretedFacts = {};
    for (let factId in facts) {
        let expressionTokens = facts[factId];
        interpretedFacts[factId] = {
            'variables': extractUsedVariables(expressionTokens),
            'evaluate': createFunctionFromFact(expressionTokens)
        };
    }
    return interpretedFacts;
}

function extractUsedVariables(expressionTokens, set) {
    if (set == undefined) {
        set = new Set();
    }
    for (let exTok of expressionTokens) {
        switch (exTok.type) {
            case 'variable':
                set.add(exTok.value);
                break;
            case 'subExpression':
                extractUsedVariables(exTok.value, set);
                break;
        }
    }
    return set;
}

const KeywordFunctions = {
    'and': vals => vals.every(v => !!v),
    'or': vals => vals.some(v => !!v),
    'xor': vals => 1 == (vals.map(v => !!v).reduce((sum, curr) => sum + curr, 0)),
    'implication': vals => {
            if (vals.length != 2) {
                throw new Error('Implication should have 2 arguments.')
            }
            if (!!vals[0] == true && !!vals[1] == false) {
                return false;
            }
            return true;
        }
}

function createFunctionFromFact(expressionTokens) {
    return function evaluate(variables, tokens) {
        if (tokens == undefined) {
            tokens = expressionTokens;
        }
        let currentLevelKeyword, currentLevelValues = [];
        for (let exTok of tokens) {
            switch (exTok.type) {
                case 'variable':
                    currentLevelValues.push(variables[exTok.value]);
                    break;
                case 'keyword':
                    if (currentLevelKeyword == undefined) {
                        currentLevelKeyword = exTok.value;
                    } else {
                        if (currentLevelKeyword == 'if' && exTok.value == 'then') {
                            currentLevelKeyword = 'implication';
                        } else if (currentLevelKeyword != exTok.value) {
                            throw new Error('Each level of expression has to have the same keyword!');
                        }
                    }
                    break;
                case 'subExpression':
                    currentLevelValues.push(evaluate(variables, exTok.value));
                    break;
            }
        }
        return KeywordFunctions[currentLevelKeyword](currentLevelValues);
    };
}