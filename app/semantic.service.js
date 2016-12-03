(function() {
    'use strict';

    angular
        .module('app')
        .factory('semantic', semantic);

    function semantic() {
        const ERROR = 'ERROR PARSING STRING';
        var startFlag = null;
        var endFlag = null;

        return service = {
            analyze: analyze,
            changeType: changeType
        };

        function analyze(line, terminal, symbols, input) {
            
            if (!line.length) return;
            else if(line[0].classification === 'code delimiter start' || line[0].classification === 'code delimiter end' || line[0].classification === 'line comment delimiter'){
                return;
            }
            else if (endFlag!=null) {
                for (end in endFlag) {
                    if (end === line[0].classification) {
                        if (end != 'conditional delimiter end') {
                            startFlag = 'conditional delimiter end';
                            endFlag = null;
                            break;
                        }
                    break;
                    }
                }
                return;
            }

            else if (startFlag!=null) {
                if (line[0].classification === startFlag[0]) {
                    startFlag = null;
                } else {
                    return;
                }
            }

            else if (line[0].classification === 'declaration delimiter') {
                if (line.length > 3) { // initialization 
                    for (let symbol of symbols) {
                        if (symbol.identifier === line[1].lexeme) {
                            var result = evaluate(line.slice(3), symbols, terminal);
                            if (result !== ERROR) {
                                symbol.value = result[0].lexeme;
                                if (result.length === 3) {
                                    symbol.value += result[1].lexeme + result[2].lexeme;
                                }
                                symbol.type = changeType(symbol);
                            } else {
                                return ERROR;
                            }
                            break;
                        }
                    }
                }
            }

            else if (line[0].classification === 'input delimiter') {
                for (let symbol of symbols) {
                    if (symbol.identifier === line[1].lexeme) {
                        input.flag = true;
                        input.symbol = symbol.identifier;                        
                        break;
                    }
                }
            }

			else if (line[0].classification === 'output delimiter') {
                var exec = null;
                var string = '';
				var result = evaluate(line.slice(1), symbols, terminal);
                if (result !== ERROR) {
                    for (let token of result) {
                        if (exec = (/"(.*)"/.exec(token.lexeme)))
                            string = exec[1] + string;
                        else if (token.lexeme !== '"')
                            string = token.lexeme + string;
                    }
                    terminal.push(string);   
                } else {
                    return ERROR;
                }
			}



			else if (line[0].classification === 'variable identifier'){
				// <var> R <expression>
				if(line.length > 2){
					for(let symbol of symbols){
						if (symbol.identifier === line[0].lexeme) {
                            var result = evaluate(line.slice(2), symbols, terminal);
                            if (result !== ERROR) {
                                symbol.value = result[0].lexeme;
                                if (result.length === 3) {
                                    symbol.value += result[1].lexeme + result[2].lexeme;
                                }
                                symbol.type = changeType(symbol);
                            } else {
                                return ERROR;
                            }
                            break;
                        }
					}			
				}
			}

            /*else if (line[0].classification ==== 'switch delimiter'){
                startFlag = ['case delimiter', symbols[0].value];
                endFlag = ['break delimiter','conditional delimiter end'];                
            }*/
            else{
                for(let symbol of symbols){
                    if (symbol.identifier === 'IT'){
                        var result = evaluate(line,symbols,terminal);
                         if (result !== ERROR) {
                            symbol.value = result[0].lexeme;
                            if (result.length === 3) {
                               symbol.value += result[1].lexeme + result[2].lexeme;
                            }
                            symbol.type = changeType(symbol);
                        } else {
                                return ERROR;
                        }
                        break;
                    }

                }
            }

        } 

        function evaluate(tokens, symbols, terminal) {
            var stack = [];
            for (let i=tokens.length-1; i>=0; i--) {
                switch(tokens[i].classification) {
                    case 'parameter delimiter':
                        break;
                    case 'infinite arity delimiter':
                        break;
                    case 'addition operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = token1.lexeme + token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'subtraction operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = token1.lexeme - token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'multiplication operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = token1.lexeme * token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'division operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = token1.lexeme / token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'modulo operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = token1.lexeme % token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'maximum operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = (token1.lexeme > token2.lexeme)? token1.lexeme : token2.lexeme;
                        var classification = 'integer literal';
                        if (lexeme % 1 !== 0) classification = 'floating-point literal';

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'minimum operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = (token1.lexeme < token2.lexeme)? token1.lexeme : token2.lexeme;
                        var classification = 'integer literal';
                        if (lexeme % 1 !== 0) classification = 'floating-point literal';

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'binary equality operation':
                        var token1 = checkString(stack.pop(), stack);
                        var token2 = checkString(stack.pop(), stack);
                        
                        castFromNil(token1, token2, terminal);
                        var lexeme = 'FAIL';
                        if (token1.lexeme === token2.lexeme 
                        && token1.classification === token2.classification)
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'binary inequality operation':
                        var token1 = checkString(stack.pop(), stack);
                        var token2 = checkString(stack.pop(), stack);
                        castFromNil(token1, token2, terminal);
                        var lexeme = 'WIN';
                        if (token1.lexeme === token2.lexeme 
                        && token1.classification === token2.classification)
                            lexeme = 'FAIL';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'AND operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        var token2 = castToBool(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = 'WIN';
                        
                        if (token1.lexeme !== token2.lexeme)
                            lexeme = 'FAIL';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'OR operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        var token2 = castToBool(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = 'FAIL';
                        
                        if (token1.lexeme === 'WIN')
                            lexeme = 'WIN';
                        if (token2.lexeme === 'WIN')
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'XOR operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        var token2 = castToBool(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, token2, terminal);
                        var lexeme = 'FAIL';
                        
                        if (token1.lexeme === 'WIN' && token2.lexeme === 'FAIL')
                            lexeme = 'WIN';
                        if (token2.lexeme === 'WIN' && token1.lexeme === 'FAIL')
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'unary negation operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        if (!token1) {
                            return ERROR;
                        }
                        var token2 = { classification: '' };
                        castFromNil(token1, token2, terminal);
                        var lexeme = 'FAIL';
                        if (token1.lexeme === 'FAIL')
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'variable identifier':
                        for (let symbol of symbols) {
                            if (symbol.identifier === tokens[i].lexeme) {
                                stack.push(getToken(symbol));
                                break;
                            }
                        }
                        break;
                    case 'infinite arity AND':
                        var lexeme = 'WIN';
                        var classification = 'boolean literal';
                        while (stack.length) {
                            var token = castToBool(checkString(stack.pop(), stack));
                            if (!token) {
                                return ERROR;
                            }
                            if (token.lexeme === 'FAIL'){
                                lexeme = 'FAIL';
                            }
                        }
                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        })
                        break;
                    case 'infinite arity OR':
                        var lexeme = 'FAIL';
                        var classification = 'boolean literal';
                        while (stack.length) {
                            var token = castToBool(checkString(stack.pop(), stack));
                            if (!token) {
                                return ERROR;
                            }
                            if (token.lexeme === 'WIN'){
                                lexeme = 'WIN';
                            }
                        }
                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        })
                        break;
                    default:
                        stack.push(tokens[i]);
                        
                }
            } 
            return stack;
        }

        function getToken(symbol) {
            var lexeme = symbol.value , classification;
            switch (symbol.type) {
                case 'YARN':
                    classification =  'string literal';
                    break;
                case 'NUMBR': 
                    classification =  'integer literal';
                    break;
                case 'NUMBAR': 
                    classification =  'floating-point literal';
                    break;
                case 'TROOF': 
                    classification =  'boolean literal';
                    break;
            }
            return {
                lexeme: lexeme,
                classification: classification
            };

        }

        function changeType(symbol) {
            var string = symbol.value.toString();
            if (/\.\d+$/.test(string))
                return 'NUMBAR';
            else if (/^\d+$/.test(string))
                return 'NUMBR';
            else if (/^(WIN|FAIL)$/.test(string))
                return 'TROOF';
            else if (/^".*"$/)
                return 'YARN';
            else 
                return 'NOOB';
        }

        function castToBool(token) {
            var lexeme = 'WIN';
            var classification = 'boolean literal';

            if (token.classification !== 'boolean literal')
                return false;
            
            if (token.lexeme === 'FAIL')
                lexeme = 'FAIL';

            return {
                lexeme: lexeme,
                classification: classification
            };


        }

        function castToNumber(token) {
            var lexeme = +token.lexeme;
            var classification = 'integer literal';

            if (token.classification === 'boolean literal' 
            || token.classification === 'NOOB')
                return false;
            
            if (token.classification === 'string literal') {
                var splitted = token.lexeme.split('"');
                if (!isNaN(splitted[1])) {
                    lexeme = +splitted[1];
                } else {
                    return false;
                }
            }
            
            if (token.classification === 'floating-point literal')
                classification = 'floating-point literal';

            return {
                lexeme: lexeme,
                classification: classification
            };
        }

        function checkString(token, stack) {
            var lexeme = token.lexeme;
            var classification = token.classification;
            if (token.lexeme === '"') {
                lexeme = lexeme + stack.pop().lexeme + stack.pop().lexeme;
                classification = 'string literal';
            }
            return {
                lexeme: lexeme,
                classification: classification
            };
        }

        function castFromNil(token1, token2, terminal) {
            if (token1.classification === 'NOOB' || token2.classification === 'NOOB') {
                terminal.push('Cannot implicitly cast nil');
            }
        }

    }
})();
