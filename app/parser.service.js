(function() {
    angular
        .module('app')
        .factory('parser', parser);

    function parser() {



        return service = {
            analyze: analyze
        };

        function analyze(tokens, symbols) {
            
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
    

    }

})();
