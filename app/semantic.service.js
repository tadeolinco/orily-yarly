(function() {
    'use strict';

    angular
        .module('app')
        .factory('semantic', semantic);

    function semantic() {
        const ERROR = 'ERROR PARSING STRING';
        var printNewline = true;

        return service = {
            analyze: analyze,
            changeType: changeType
        };

        function analyze(line, terminal, symbols, input) {
            if (!line.length) return;
                
            else if (line[0].classification === 'declaration delimiter') {
                if (line.length > 3) { // initialization 
                    for (let symbol of symbols) {
                        if (symbol.identifier === line[1].lexeme) {
                            var result = evaluate(line.slice(3), symbols, terminal);
                            if (result !== ERROR) {
                                symbol.value = result[0].lexeme;
                                symbol.type = changeType(result[0].classification)
                                if (result.length === 3) {
                                    symbol.value += result[1].lexeme + result[2].lexeme;
                                    symbol.type = changeType(result[1].classification);
                                }

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
                        if (token.classification === 'newline supress')
                            continue;
                        if (exec = (/"(.*)"/.exec(token.lexeme)))
                            string = exec[1] + string;
                        else if (token.lexeme !== '"')
                            string = token.lexeme + string;
                    }
                    if (printNewline) {
                        terminal.push(string);
                    } else {
                        if (!terminal.length)
                            terminal.push(string)
                        else
                            terminal[terminal.length-1] += string;
                        printNewline = true;
                    }

                    if (line[line.length-1].classification === 'newline supress') {
                        printNewline = false;
                    }
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
                                symbol.type = changeType(result[0].classification);
                                if (result.length === 3) {
                                    symbol.value += result[1].lexeme + result[2].lexeme;
                                    symbol.type = changeType(result[1].classification);
                                }
                            } else {
                                return ERROR;
                            }
                            break;
                        }
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
                    case 'immediate casting operation':
                        var token = checkString(stack.pop(), stack);                    
                        var dataType = checkString(stack.pop(), stack);
                        switch (dataType.classification) {
                            case 'untyped data type':
                                return ERROR;
                            case 'string data type':
                                var lexeme = token.lexeme.toString();
                                switch (token.classification) {
                                    case 'boolean literal':
                                        return ERROR;
                                    case 'integer literal':
                                    case 'floating-point literal':
                                        lexeme = '"'+lexeme+'"';
                                        break;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'string literal'
                                });
                                break;
                            
                            case 'boolean data type':
                                var lexeme = 'WIN';
                                switch (token.classification) {
                                    case 'string literal':
                                        if (token.lexeme.length == 2)
                                            lexeme = 'FAIL';
                                        break;
                                    case 'integer literal':
                                    case 'floating-point literal':
                                        if (token.lexeme === 0)
                                            lexeme = 'FAIL';
                                        break;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'boolean literal'
                                });
                                break;

                            case 'integer data type':
                                var lexeme = token.lexeme;
                                switch (token.classification) {
                                    case 'floating-point literal':
                                        lexeme = parseInt(token.lexeme);
                                        break;
                                    case 'string literal':
                                        var string = token.lexeme.split('"')[1];
                                        if (!isNaN(string))
                                            lexeme = parseInt(string);
                                        else
                                            lexeme = 0;
                                        break;
                                    case 'boolean literal':
                                        if (token.lexeme === 'WIN')
                                            lexeme = 1;
                                        else
                                            lexeme = 0;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'integer literal'
                                });
                                break;
                            case 'floating-point data type':
                                var lexeme = token.lexeme;
                                switch (token.classification) {
                                    case 'string literal':
                                        var string = token.lexeme.split('"')[1];
                                        if (!isNaN(string))
                                            lexeme = parseFloat(string);
                                        else
                                            lexeme = 0.0;
                                        break;
                                    case 'boolean literal':
                                        if (token.lexeme === 'WIN')
                                            lexeme = 1.0;
                                        else
                                            lexeme = 0.0;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'floating-point literal'
                                });
                                break;
                            
                        }

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
                    case 'concatenation operation':
                        var exec = null;
                        var lexeme = '';
                        var classification = 'string literal';
                        while (stack.length) {
                            var string = castToString(checkString(stack.pop(), stack));
                            if (!string) return ERROR;
                            if (exec = (/"(.*)"/.exec(string.lexeme))) {
                                lexeme += exec[1];
                            } else {
                                lexeme += string.lexeme;
                            }
                        }
                        lexeme = '"' + lexeme + '"';
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

        function changeType(classification) {
            // var string = symbol.value.toString();
            // if (/\.\d+$/.test(string))
            //     return 'NUMBAR';
            // else if (/^\d+$/.test(string))
            //     return 'NUMBR';
            // else if (/^(WIN|FAIL)$/.test(string))
            //     return 'TROOF';
            // else if (/^".*"$/)
            //     return 'YARN';
            // else 
            //     return 'NOOB';
            switch (classification) {
                case 'string literal':
                    return 'YARN';
                case 'integer literal':
                    return 'NUMBR';
                case 'floating-point literal':
                    return 'NUMBAR';
                case 'boolean literal':
                    return 'TROOF';
                default:
                    return 'NOOB';
            }
        }

        function castToString(token) {
            var lexeme = token.lexeme.toString();
            var classification = 'string literal';
            if (token.classification === 'NOOB')
                return false;
            return {
                lexeme: lexeme,
                classification: classification
            };
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
