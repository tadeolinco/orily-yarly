(function() {
    angular
        .module('app')
        .factory('parser', parser);

    function parser() {
        var length=0;


        return service = {
            analyze: analyze
        };

        function analyze(tokens, symbols) {
            updateVariables(tokens, symbols);
            var t = tokens.slice(0);
            parseLine(tokens);           
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
    
        function parseLine(tokens){
            var line = [];
            for (token of tokens){
                if (token.classification != 'statement delimiter')
                    line.push(token);
                else {
                    console.log(statementLegality(line));
                    line = []; 
                }
            }
            if (line.length) {
                console.log(statementLegality(line));
                line = []; 
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
            if (literal(line))                         return true;
            //if (concatenation(line))         return true;
            //if (functionCall(line))          return true;
            //if (conditionalExpression(line)) return true;
            if (arithmeticExpression(line))   return true;
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

            length = 0;
            /* KTHXBYE */
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

            /* Line does not meet anything */
            return false;
  
        }
    }
})();
