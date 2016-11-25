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
                            symbol.value = evaluateMath(line.slice(3));
                            break;
                        }
                    }
                }
            }
        }

        function evaluateMath(tokens) {
            var stack = [];
            for (let i=tokens.length-1; i>=0; i--) {
                switch(tokens[i].classification) {
                    case 'parameter delimiter':
                        break;
                    case 'addition operation':
                        stack.push({
                            lexeme: +stack.pop().lexeme + +stack.pop().lexeme,
                            classification: 'integer literal'
                        });
                        break;
                    case 'subtraction operation':
                        stack.push({
                            lexeme: +stack.pop().lexeme + +stack.pop().lexeme,
                            classification: 'integer literal'
                        });
                        break;
                    case 'multiplication operation':
                        stack.push({
                            lexeme: +stack.pop().lexeme + +stack.pop().lexeme,
                            classification: 'integer literal'
                        });
                        break;
                    case 'division operation':
                        stack.push({
                            lexeme: +stack.pop().lexeme + +stack.pop().lexeme,
                            classification: 'integer literal'
                        });
                        break;
                    case 'modulo operation':
                        stack.push({
                            lexeme: +stack.pop().lexeme + +stack.pop().lexeme,
                            classification: 'integer literal'
                        });
                        break;
                    case 'maximum operation':
                        var num1 = +stack.pop().lexeme;
                        var num2 = +stack.pop().lexeme;
                        var result = (num1 > num2)? num1 : num2;
                        stack.push({
                            lexeme: result,
                            classification: 'integer literal'
                        }); 
                        break;
                    case 'minimum operation':
                        var num1 = +stack.pop().lexeme;
                        var num2 = +stack.pop().lexeme;
                        var result = (num1 < num2)? num1 : num2;
                        stack.push({
                            lexeme: result,
                            classification: 'integer literal'
                        }); 
                        break;

                    default:
                        stack.push(tokens[i]);
                }
            } 
            return stack.pop().lexeme;
        }

    }
})();
