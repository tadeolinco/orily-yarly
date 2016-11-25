(function() {
    'use strict';

    angular
        .module('app')
        .factory('semantic', semantic);

    function semantic() {

        return service = {
            analyze: analyze
        };

        function analyze(line, terminal, symbols) {
            if (line[0].classification === 'declaration delimiter') {
                if (line.length > 3) { // initialization 
                    for (symbol of symbols) {
                        if (symbol.identifier === line[1].lexeme) {
                            symbol.value = line[3].lexeme;
                            break;
                        }
                    }
                }
            }
        }
    }
})();