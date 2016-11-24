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
                    console.log(line);
                    console.log(statementLegality(line));
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
            if (literal(line))               return true;
            //if (concatenation(line))         return true;
            //if (functionCall(line))          return true;
            //if (variable(line))              return true;
            //if (conditionalExpression(line)) return true;
            if (arithmeticExpression(line))   return true;
            //if (castingOperator(line))       return true;
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
            length = 0;
            if (expect('input delimiter',line)){
                expression(line);
                return true;
            }

            length = 0;
            if (expression(line)) {
                return true;
            }

            return false;
        }
    }
})();
