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
                            symbol.value = evaluateMath(line.slice(3), symbols);
                            var string = symbol.value.toString();
                            if (/\.\d+$/.test(string))
                                symbol.type = 'NUMBAR';
                            else if (/^\d+$/.test(string))
                                symbol.type = 'NUMBR';
                            else if (/^(WIN|FAIL)$/.test(string))
                                symbol.type = 'TROOF';
                            else if (/^".*"$/)
                                symbol.type = 'YARN';
                            else 
                                symbol.type = 'NOOB';
                        }
                    }
                }
            }
			if(line[0].classification === 'output delimiter'){
				if(line[1].classification === 'string delimiter')
					terminal.push(line.slice(2));
				else{
					var value = evaluateMath(line.slice(1),symbols); 
					terminal.push(value);
				}
			}
			if(line[0].classification === 'variable identifier'){
				// <var> R <expression>
				if(line.length > 2){
					for(symbol of symbols){
						if(symbol.identifier === line[0].lexeme){
							symbol.value = evaluateMath(line.slice(2),symbols);
							break;
						}
					}			
				}
			}
        }

        function evaluateMath(tokens, symbols) {
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
                    case 'variable identifier':
                        for (symbol of symbols) {
                            if (symbol.identifier === tokens[i].lexeme) {
                                stack.push({
                                    lexeme: symbol.value,
                                    classification: 'integer literal'
                                });
                                break;
                            }
                        }
                        break;
                    default:
                        stack.push(tokens[i]);
                }
            } 
            var result = stack.pop().lexeme;
            if (result === '"') {
                result = result.concat(stack.pop().lexeme, stack.pop().lexeme);
            }
            return result;
        }

    }
})();
