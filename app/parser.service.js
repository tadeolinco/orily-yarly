(function() {
    angular
        .module('app')
        .factory('parser', parser);

    function parser(semantic) {
        var column = 0;
        var row = 0;
        var totalTokens = 0;
        const ERROR = 'ERROR PARSING STRING';

        return service = {
            analyze: analyze
        };

        function analyze(tokens, symbols, terminal, input) {
            if (!input.flag) {
                column = 0;
                row = 0;
                totalTokens = 0;
                updateVariables(tokens, symbols);
                parseLine(totalTokens, tokens, terminal, symbols, input);           
            } else {
                input.flag = false;
                for (let symbol of symbols) {
                    if (symbol.identifier === input.symbol) {
                        symbol.value = '"'+terminal[terminal.length-1]+'"';
                        symbol.type = 'YARN';
                        break;
                    }
                }
                console.log('total tokens: ' + totalTokens);
                console.log('length of tokens: ' +tokens.length)
                parseLine(totalTokens, tokens, terminal, symbols, input); 
            }
        }

        function updateVariables(tokens, symbols) {
            for (symbol of symbols) {
                var found = false;
                for (let i=tokens.length-1; i>=0; i--) {
                    if ((tokens[i].classification === 'declaration delimiter'
                    || tokens[i].classification === 'function delimiter start') 
                    && tokens[i+1]
                    && tokens[i+1].lexeme === symbol.identifier) {
                        i++;
                        found = true;
                        
                        for (let j=i; j<tokens.length; j++) {
                            if (tokens[j].lexeme === symbol.identifier
                            && tokens[j].classification === 'UNEXPECTED') {
                                
                                if (symbol.type === 'function') {
                                    tokens[j].classification = 'function identifier';
                                } else {
                                    tokens[j].classification = 'variable identifier';
                                }

                            }
                        }
                    }
                    if (found) break;
                }
            }
            for (token of tokens) {
                if (token.lexeme === 'IT')
                    token.classification = 'variable identifier';
            }
           
        }
        
        function parseLine(start, tokens, terminal, symbols, input){
            var line = [];
            for (let i=start; i<tokens.length; i++){
                // console.log('token index: [' + i + ']');
                totalTokens++;
                if (tokens[i].classification != 'statement delimiter') {
                    line.push(tokens[i]);
                } else {
                    if (!statementLegality(line)) {
                        terminal.push('UNEXPECTED TOKEN: '+line[column].lexeme);
                        break;
                    }  
                    row++;
                    console.log(row + ': LINE DONE!');
                    var result = semantic.analyze(line, terminal, symbols, input);
                    if (result === ERROR) {
                        terminal.push(ERROR);
                        break;
                    }
                    if (line.length && line[0].classification == 'input delimiter') {
                        line = [];
                        break;
                    }
                    line = []; 
                }
            }
            // if (line.length) {
            //     if (!statementLegality(line)) {
            //             terminal.push('UNEXPECTED TOKEN: '+line[column].lexeme);
            //     } else {
            //         row++;
            //         console.log(row + ': LINE DONE!');
            //         var result = semantic.analyze(line, terminal, symbols, input);
            //         if (result === ERROR) {
            //             terminal.push(ERROR);
            //         }
            //         line = []; 
            //     }
            // }
        }

        /* Checks if type meets expectations */
        function expect(expected, line){
            if (column === line.length) return false;
            if (expected == line[column].classification) {
                console.log(column + '[GOT] '+line[column].classification);
                column++;
                return true; 
            } else {
                return false;
            } 
        }

        // 
        function expression(line){
            console.log(column+'[checking] expression');
            if (literal(line))                           return true;
            if (expect('variable identifier', line))     return true;
            if (concatenation(line))                     return true;
            //if (functionCall(line))          return true;
            if (conditionalExpression(line))             return true;
            if (arithmeticExpression(line))              return true;
            //if (castingOperator(line))       return true;
            return false; 
        }

        function literal(line) { // i = 1;
            console.log(column+'[checking] literal');
            if (string(line))                               return true;
            if (expect('boolean literal', line))            return true;
            if (expect('floating-point literal', line))     return true;
            if (expect('integer literal', line))            return true;
            return false;
        }

        function string(line) {
            if (expect('string delimiter', line)
            && expect('string literal', line)
            && expect('string delimiter', line)) return true;
            return false;
        }

        /* CHECK IN SEMANTIC FOR VALUE OF EXPRESSION */
        function concatenation(line) {
            console.log(column+'[checking] concatenation operation');
            if (expect('concatenation operation', line)
                && expression(line)
                && expressionInfiniteArity(line)) return true;
            return false;
        }

        function binaryConditionalExpression(line) {
            console.log(column+'[checking] binaryConditionalExpression');
            if (expect('AND operation', line)) return true;
            if (expect('OR operation', line)) return true;
            if (expect('XOR operation', line)) return true;
            if (expect('binary equality operation', line)) return true;
            if (expect('binary inequality operation', line)) return true;
            return false;
        }

        function multipleConditionalExpression(line) {
            console.log(column+'[checking] multipleConditionalExpression');
            if (expect('infinite arity AND', line)) return true;
            if (expect('infinite arity OR', line)) return true;
            return false;
        }

        function expressionInfiniteArity(line) {
            console.log(column+'[checking] expressionInfiniteArity');
            var currentIndex = column;
            if (expect('parameter delimiter', line) 
                && expression(line)
                && expressionInfiniteArity(line)) {
                return true;
            }
            if (currentIndex === column) 
                return true;
            else 
                return false;
        }

        function conditionalExpression(line) {
            console.log(column+'[checking] conditionalExpression');
             // Checks for unary operation 
            if (expect('unary negation operation', line)
                && expression(line))                        return true;
            if (binaryConditionalExpression(line)
                && expression(line) 
                && expect('parameter delimiter', line)
                && expression(line))                        return true;
            if (multipleConditionalExpression(line) 
                && expression(line)
                && expressionInfiniteArity(line)
                && expect('infinite arity delimiter', line))        return true;
            return false;
        }

        function arithmeticExpression(line) {
            console.log(column+'[checking] arithmeticExpression');
            if (mathOperation(line)
            && expression(line)
            && expect('parameter delimiter', line)
            && expression(line)) return true;
            return false;
        }

        function mathOperation(line) {
            console.log(column+'[checking] mathOperation');
            if (expect('addition operation', line)) return true;
            if (expect('subtraction operation', line)) return true;
            if (expect('multiplication operation', line)) return true;
            if (expect('division operation', line)) return true;
            if (expect('modulo operation', line)) return true;
            if (expect('maximum operation', line)) return true;
            if (expect('minimum operation', line)) return true;
            return false;
        }

        /* Iterates throughout statement array and checks legality */
        function statementLegality(line){
            /* HAI */
            if (!line.length) return true;

            column = 0;
            if (expect('code delimiter start', line)) {
                return true;
            }

            /* KTHXBYE */
            column = 0;
            if (expect('code delimiter end', line)) {
                return true;
            }

            column = 0;
            if (expect('variable identifier', line)
                && expect('assignment operator', line)){
                    if (expression(line)) 
                        return true;
                    return false;
            }

            /* VISIBLE */
            column = 0;
            if (expect('output delimiter',line)){
                expression(line);
                return true;
            }

            /* GIMMEH */
            column = 0;
            if (expect('input delimiter', line)){
                if (expect('variable identifier', line))
                    return true;
                else 
                    return false;
            }

            /* LINE COMMENT */
            column=0;
            if(expect('line comment delimiter',line)){
            	return true;
            }
            /* VARIABLE DECLARATION */
            column = 0;
            if (expect('declaration delimiter', line)){
                if (expect('variable identifier', line)){
                    if (expect('initialization delimiter', line)){
                        if (expression(line)) return true;
                        else return false;
                    }
                    return true;
                }
                return false;
            }

            /* Checks if expression */
            column = 0;
            if (expression(line)) {
                return true;
            }

            /* IF  */
            column = 0;
            if (expect('conditional delimiter', line)){
                return true;
            }

            column = 0;
            if (expect('conditional if delimiter', line)){
                return true;
            }

            column = 0;
            if (expect('conditional else if delimiter', line)){
                return true;
            }

            column = 0;
            if (expect('conditional else delimiter', line)){
                return true;
            }

            /* SWITCH */
            column = 0;
            if (expect('switch delimiter', line)){
                return true;
            }

            column = 0;
            if (expect('case delimiter', line)){
                return true;
            }

            column = 0;
            if (expect('default delimiter', line)){
                return true;
            }

            column = 0;
            if (expect('conditional delimiter end', line)){
                return true;
            }

            /* Line does not meet anything */
            return false;
  
        }
    }
})();
