(function() {
    angular
        .module('app')
        .factory('parser', parser);

    function parser() {



        return service = {
            analyze: analyze
        };

        function analyze(tokens, symbols) {
            updateVariables(tokens, symbols);
            var t = tokens.slice(0);
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
        
        function literal(line, i) { // i = 1;
            if (string(line, i))                            return true;
            if (expect('boolean literal', line[i]))         return true;
            if (expect('floating-point literal', line[i]))  return true;
            if (expect('integer literal'))                  return true;
            return false;
        }

        function string(line ,i) {
            if (expect('string delimiter', line[i])
            && expect('string literal', line[i+1])
            && expect('string delimiter', line[i+2])) return true;
            return false;
        }

        function arithmeticOperation(line, i) {
            if (expression(line, i+1))
        }

        /* Checks if type meets expectations */
        function expect(expected, token){
            if (expected == token.classification)
                return true; 
            else 
                return false;
        }

        function expression(line, i){
            if (literal(line, i))               return true;
            if (concatenation(line, i))         return true;
            if (functionCall(line, i))          return true;
            if (variable(line, i))              return true;
            if (conditionalExpression(line, i)) return true;
            if (arithmeticOperation(line, i))   return true;
            if (castingOperator(line, i))       return true;
            return false; 
        }

        /* Iterates throughout statement array and checks legality */
        function statementLegality(line){
            var i = 0;

            if (expect('input delimiter',line[i])){
                expression(line, i+1);
                return true;
            }


            else {
                return false;
            }
        }
    }
})();
