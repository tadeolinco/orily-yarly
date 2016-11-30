(function() {
    angular
        .module('app')
        .factory('parser', parser);

    function parser(semantic) {
        var length=0;


        return service = {
            analyze: analyze
        };

        function analyze(tokens, symbols, terminal, input) {
            updateVariables(tokens, symbols);
            parseLine(tokens, terminal, symbols, input);           
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
           
        }
    
        function parseLine(tokens, terminal, symbols, input){
            var line = [];
            for (token of tokens){
                if (token.classification != 'statement delimiter')
                    line.push(token);
                else {
                    if (!statementLegality(line)) {
                        terminal.push('UNEXPECTED TOKEN');
                        break;
                    }
                    semantic.analyze(line, terminal, symbols, input);
                    line = []; 
                }
            }
            if (line.length) {
                if (!statementLegality(line)) {
                        terminal.push('UNEXPECTED TOKEN');
                } else {
                    semantic.analyze(line, terminal, symbols, input);
                    line = []; 
                }
            }
        }

        /* Checks if type meets expectations */
        function expect(expected, line){
            if (length === line.length) return false;
            if (expected == line[length].classification) {
                console.log('[GOT] '+line[length].classification);
                length++;
                return true; 
            } else {
                return false;
            } 
        }


        function expression(line){
            console.log(length+'[checking] expression');
            if (literal(line))                           return true;
            if (concatenation(line))                     return true;
            //if (functionCall(line))          return true;
            if (conditionalExpression(line))             return true;
            if (arithmeticExpression(line))              return true;
            //if (castingOperator(line))       return true;
            if (expect('variable identifier', line))     return true;
            return false; 
        }

        function literal(line) { // i = 1;
            console.log(length+'[checking] literal');
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

        /* Requires function string to check if concatenation is legal */
        function concatenation(line) {
            console.log(length+'[checking] concatenation');
            if (string(line)
                && expect('parameter delimiter', line)
                && string(line)) return true;
            return false;
        }

        function binaryConditionalExpression(line) {
            console.log(length+'[checking] binaryConditionalExpression');
            if (expect('AND operation', line)) return true;
            if (expect('OR operation', line)) return true;
            if (expect('XOR operation', line)) return true;
            if (expect('binary equality operation', line)) return true;
            if (expect('binary inequality operation', line)) return true;
            return false;
        }

        function multipleConditionalExpression(line) {
            console.log(length+'[checking] multipleConditionalExpression');
            if (expect('infinite arity AND', line)) return true;
            if (expect('infinite arity OR', line)) return true;
            return false;
        }

        function conditionalExpressionInfiniteArity(line) {
            console.log(length+'[checking] conditionalExpressionInfiniteArity');
            if (expect('parameter delimiter', line) 
                && expression(line)) {
                conditionalExpressionInfiniteArity(line);
                return true;
            }
            return false;
        }

        function conditionalExpression(line) {
            console.log(length+'[checking] conditionalExpression');
             // Checks for unary operation 
            if (expect('unary negation operation', line)
                && expression(line))                        return true;
            if (binaryConditionalExpression(line)
                && expression(line) 
                && expect('parameter delimiter', line)
                && expression(line))                        return true;
            if (multipleConditionalExpression(line) 
                && expression(line)
                && conditionalExpressionInfiniteArity(line)
                && expect('infinite arity delimiter', line))        return true;
            return false;
        }

        function arithmeticExpression(line) {
            console.log(length+'[checking] arithmeticExpression');
            if (mathOperation(line)
            && expression(line)
            && expect('parameter delimiter', line)
            && expression(line)) return true;
            return false;
        }

        function mathOperation(line) {
            console.log(length+'[checking] mathOperation');
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
            length = 0;
            if (expect('code delimiter start', line)) {
                return true;
            }

            /* KTHXBYE */
            length = 0;
            if (expect('code delimiter end', line)) {
                return true;
            }

            /* VISIBLE */
            length = 0;
            if (expect('output delimiter',line)){
                expression(line);
                return true;
            }

            /* GIMMEH */
            length = 0;
            if (expect('input delimiter', line)){
                if (expect('variable identifier', line))
                    return true;
                else 
                    return false;
            }

            /* VARIABLE DECLARATION */
            length = 0;
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
            length = 0;
            if (expression(line)) {
                return true;
            }

            /* IF  */
            length = 0;
            if (expect('conditional delimiter', line)){
                return true;
            }

            length = 0;
            if (expect('conditional if delimiter', line)){
                return true;
            }

            length = 0;
            if (expect('conditional else if delimiter', line)){
                return true;
            }

            length = 0;
            if (expect('conditional else delimiter', line)){
                return true;
            }

            /* SWITCH */
            length = 0;
            if (expect('switch delimiter', line)){
                return true;
            }

            length = 0;
            if (expect('case delimiter', line)){
                return true;
            }

            length = 0;
            if (expect('default delimiter', line)){
                return true;
            }

            length = 0;
            if (expect('conditional delimiter end', line)){
                return true;
            }

            /* Line does not meet anything */
            return false;
  
        }
    }
})();
