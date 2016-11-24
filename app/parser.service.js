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
                       
        }
        

        function updateVariables(tokens, symbols) {
            for (symbol of symbols) {
                var found = false;
                for (let i=tokens.length-1; i>=0; i--) {
                    if (tokens[i].classification === 'declaration delimiter' 
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

        /* Checks if type meets expectations */
        function expect(expected, token){
            if (expected == token.classification)
                return true; 
            else 
                return false;
        }

        function expression(line, i){
            if (literal(line, i))                    return true;
            if (concatenation(line, i))              return true;
            if (functionCall(line, i))               return true;
            if (conditionalExpression(line, i))      return true;
            if (arithmeticOperation(line, i))        return true;
            if (castingOperator(line, i))            return true;
            if (expect('variable identifier', i))    return true;
            return false; 
        }

        function conditionalExpression(line, i){

        }

        /* Iterates throughout statement array and checks legality */
        function statementLegality(line){
            var i = 0;

            /* VISIBLE */
            if (expect('output delimiter',line[i])){
                expression(line, i+1);
                return true;
            }

            /* GIMMEH */
            if (expect('input delimiter', line[i])){
                if (expect('variable identifier', line[i+1]))
                    return true;
                else 
                    return false;
            }

            /* VARIABLE DECLARATION */
            if (expect('declaration delimiter', line[i])){
                if (expect('variable identifier', line[i+1])){
                    if (expect('initialization delimiter', line[i+2])){
                        if (expression(line, i+3)) return true;
                        else return false;
                    }
                    return true;
                }
                return false;
            }

            /* Checks if expression */
            if (expression(line, i)){
                return true;
            }

            /* Line does not meet anything */
            return false;
        }
    }

})();
