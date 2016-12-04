(function() {
    angular
        .module('app')
        .factory('parser', parser);

    function parser(semantic) {
    	var scope = [];
        var column = 0;
        var row = 0;
        var totalTokens = 0;
        const ERROR = 'ERROR PARSING STRING';

        return service = {
            analyze: analyze
        };

        function analyze(tokens, symbols, terminal, input, scope) {
            if (!input.flag) {
                column = 0;
                row = 0;
                totalTokens = 0;
                updateVariables(tokens, symbols);
                parseLine(totalTokens, tokens, terminal, symbols, input, scope);           
            } else {
                input.flag = false;
                for (let symbol of symbols) {
                    if (symbol.identifier === input.symbol) {
                        symbol.value = '"'+terminal.line[terminal.line.length-1]+'"';
                        symbol.type = 'YARN';
                        break;
                    }
                }
                console.log('total tokens: ' + totalTokens);
                console.log('length of tokens: ' +tokens.length)
                parseLine(totalTokens, tokens, terminal, symbols, input, scope); 
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
        
        function parseLine(start, tokens, terminal, symbols, input, scope){
            var line = [];
            if (start === 0) {
                if (tokens[0].classification !== 'code delimiter start')
                    return terminal.line.push('ERROR: EXPECTED "HAI" AT FIRST LINE');
                if (tokens[tokens.length-1].classification !== 'code delimiter end') {
                    return terminal.line.push('ERROR: EXPECTED "KTHXBYE" AT LAST LINE');
                }
            }
            for (let i=start; i<tokens.length; i++){
                totalTokens++;
                if (tokens[i].classification != 'statement delimiter') {
                    line.push(tokens[i]);
                } else {
                    if (line.length >= 2) {
                        if (line[line.length-1].classification === 'line comment'
                        && line[line.length-2].classification === 'line comment delimiter') {
                            line.pop();
                            line.pop();
                        }
                    }
                    if (!statementLegality(line, scope)) {
                        var error = 'ERROR: "';
                        for (let token of line) {
                            error += token.lexeme + ' ';
                        }
                        error += '" AT LINE: ' + row;
                        terminal.line.push(error);
                        break;
                    }  
                    row++;
                    console.log(row + ': LINE DONE!');
                    if (!checkScope(line, scope)) {
                        var error = 'ERROR: "';
                        for (let token of line) {
                            error += token.lexeme + ' ';
                        }
                        error += '" AT LINE: ' + row;
                        terminal.line.push(error);
                        break;
                    };
                    console.log(line);
                    var result = semantic.analyze(line, terminal, symbols, input);
                    if (result === ERROR) {
                        terminal.line.push(ERROR);
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
            //     if (!statementLegality(line, scope)) {
            //         terminal.line.push('UNEXPECTED TOKEN: "'+line[line.length-1].lexeme + '" AT LINE: ' + row);
            //     }  
            //     row++;
            //     console.log(row + ': LINE DONE!');
            //     if (!checkScope(line, scope)) {
            //         terminal.line.push('UNEXPECTED TOKEN: "'+line[line.length-1].lexeme + '" AT LINE: ' + row);
            //     };
            // }
            // if (scope.length) {
            //     terminal.line.push('ERROR: NOT PROPERLY TERMINATED');
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

        function dataType(line) {
            console.log(column+'[checking] data type');
            if (expect('string data type', line))       return true;
            if (expect('integer data type', line))       return true;
            if (expect('floating-point data type', line))       return true;
            if (expect('boolean data type', line))       return true;
            if (expect('untyped data type', line))       return true;
            return false;
        }

        
        function expression(line){
            console.log(column+'[checking] expression');
            if (literal(line))                          return true;
            if (expect('variable identifier', line))    return true;
            if (concatenation(line))                    return true;
            //if (functionCall(line))          return true;
            if (conditionalExpression(line))            return true;
            if (arithmeticExpression(line))             return true;
            if (dataType(line))                         return true;
            if (castingOperation(line))                 return true;
            return false; 
        }

        function castingOperation(line) {
            console.log(column+'[checking] castingOperation');
            if (expect('immediate casting operation', line)
            && expression(line)
            && dataType(line)) {
                return true;
            }
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

        function outputExpression(line) {
            console.log(column+'[checking] outputExpression');
            var result = expression(line);
            if (!result) {
                return true;
            }
            if (result) {
                return outputExpression(line);
            }
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

        function caseDelimiter(line) {
            console.log(column+'[checking] case');
            if (expect('case delimiter', line)
            && literal(line)) return true;
            return false;
        }

        function checkScope(line, scope) {
            if (!line[0]) return true;
            var currScope = peek(scope);
            switch (line[0].classification) {
                case 'conditional if delimiter':
                case 'conditional else if delimiter':
                case 'conditional else delimiter':
                    if (currScope == 'conditional delimiter')
                        return true;
                    break;
                case 'case delimiter':
                case 'break delimiter':
                    if (currScope == 'switch delimiter')
                        return true;
                    break;
                default:
                    return true;
            }


            return false;
        }

        /* Iterates throughout statement array and checks legality */
        function statementLegality(line, scope) {
            /* HAI */
            if (!line.length) return true;

            column = 0;
            if (expect('code delimiter start', line)) {
                scope.push('code delimiter start');
                return true;
            }

            /* KTHXBYE */
            column = 0;
            if (expect('code delimiter end', line)) {
                if (peek(scope) === 'code delimiter start')
                    scope.pop();
                return true;
            }
            column = 0;
            if (expect('variable identifier', line)
                && expect('assignment operator', line)){
                    if (expression(line)) 
                        return true;
                    return false;
            }
            column = 0;
            if (expect('variable identifier', line)
                && expect('casting assignment delimiter', line)) { 
                    if (dataType(line)) {
                        return true;
                    } else {
                        return false;
                    }
            }

            /* VISIBLE */
            column = 0;
            if (expect('output delimiter',line) 
                && outputExpression(line)) {
                return true;
            }

            /* VISIBLE NEWLINE SUPRESS */
            column = 0;
            if (expect('output delimiter',line)
                && expression(line)
                && expect('newline supress')) {
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
                scope.push('conditional delimiter');
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
            if (expect('switch delimiter', line)) {
                scope.push('switch delimiter');
                return true;
            }

            column = 0;
            if (caseDelimiter(line)) {
                return true;
            }

            column = 0;
            if (expect('conditional delimiter end', line)) {
                if (peek(scope) === 'conditional delimiter'
                || peek(scope) === 'switch delimiter');
                    scope.pop();
                return true;
            }

            column = 0;
            if (expect('default case delimiter', line)){
                return true;
            }

            column = 0;
            if (expect('block comment delimiter start', line)) {
                scope.push('block comment delimiter start');
                return true;    
            }

            column = 0;
            if (expect('block comment delimiter end', line)) {
                if (peek(scope) === 'block comment delimiter start');
                    //scope.pop();
                return true;
            }

            column = 0;
            if (expect('break delimiter', line)){
                return true;
            }

            /* Line does not meet anything */
            return false;
  
        }

        function peek(stack) {
            return stack[stack.length-1];
        }
    }
})();
