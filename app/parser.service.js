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
    }

})();
