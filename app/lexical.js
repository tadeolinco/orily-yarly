(function() {
    angular
        .module('app')
        .controller('lexicalController', lexicalController);

    function lexicalController($scope) {
        var vm = this;
        
        vm.file = null;
        vm.text = "";
        vm.tokens = [];
        vm.symbols = [];
        vm.results = null;

        vm.initialize = initialize;
        vm.loadFile = loadFile;
        vm.openFile = openFile;

        /* LEXEMES */
        const Re = Object.freeze({
            STRING_DELIMITER                : /^"/,
            NUMBER_START                    : /^[-\d\.]/,
            FLOAT                           : /^((-\d*\.\d+)|(-?\d+\.\d+))$/,
            INTEGER                         : /^((0)|(-?[1-9]\d*))$/,
            WHITESPACE                      : /\s/, 
            LINE_COMMENT_DELIMITER          : /\s(BTW)$/,
            BLOCK_COMMENT_DELIMITER_START   : /(OBTW)$/,
            BLOCK_COMMENT_DELIMITER_END     : /([\S\s]*\n[\S\s]*)(TLDR)$/, 
            CODE_DELIMITER                  : /((HAI)\s+)|((KTHXBYE))$/,
            VARIABLE_IDENTIFIER             : /([a-zA-Z][a-zA-Z_]*)\b/,
            OUTPUT                          : /(VISIBLE)\s+/,
            INPUT                           : /(GIMMEH)\s+/,
            PARAMETER_DELIMITER             : /(AN)\s+/,

            // CONTROL FLOW
            CONDITIONAL_BLOCK               : /(YA RLY|NO WAI|MEBBE)\s+/,
            CONDITIONAL_DELIMITER           : /(O RLY\?)\s+/,
            COMPARISON_BLOCK                : /(OMG|OMGWTF)\s+/,

            CONTROL_FLOW_DELIMITER_END      : /(OIC)\s+/,
            SWITCH_DELIMITER                : /(WTF\?)\s+/,

            // DATA TYPE
            BOOLEAN                         : /(WIN|FAIL)\s+/,
            DATA_TYPE                       : /(YARN|NUMBR|NUMBAR|TROOF|NOOB)\s+/,

            // LOOPS
            LOOP_DELIMITER_START            : /(IM IN YR)\s+/,
            LOOP_DELIMITER_END              : /(IM OUTTA YR)\s+/,
            LOOP_EVALUATION                 : /(TIL|WILE)\s+/,
            
            // FUNCTION
            RETURN_W_VALUE                  : /(FOUND YR)\s+/,
            RETURN_W_O_VALUE                : /(GTFO)\s+/,
            FUNCTION_CALL                   : /(I IZ)\s+/,
            FUNCTION_DELIMITER_START        : /(HOW IZ I)\s+/,
            FUNCTION_DELIMITER_END          : /(IF U SAY SO)\s+/,
            FUNCTION_ARGUMENT_SEPARATOR     : /(YR)\s+/,


            // OPERATOR
            BOOLEAN_OPERATOR                : /(BOTH OF|EITHER OF|WON OF|NOT|ALL OF|ANY OF|BOTH SAEM|DIFFRINT)\s+/,
            CONCATENATION                   : /(SMOOSH)\s+/,
            CASTING_IMPLICIT                : /(MAEK)\s+/,
            CASTING_EXPLICIT                : /(IS NOW A)\s+/,
            MATH_OPERATOR                   : /(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF)\s+/,
            UNARY_OPERATOR                  : /(NERFIN|UPPIN)\s+/,

            // VARIABLE DECLARATION
            ASSIGNMENT_OPERATOR             : /(\bR\b|ITZ)\s+/,
            DECLARATION_DELIMITER           : /(I HAS A)\s+/,
        });




        function analyze() {
            vm.symbols = [];
            vm.tokens = [];
            var chars = vm.text.split('');
            var input = '';
            var exec = null;
            //pushSymbol('IT', 'NOOB');
            for (let i=0; i < chars.length; i++) {
                console.log('['+input+']');
                if (input === '' && Re.WHITESPACE.test(chars[i])) {
                    continue;
                }
                input += chars[i];

                // [ STRING ]
                if (Re.STRING_DELIMITER.exec(chars[i])) {        // initial string delimiter
                    input = '';
                    pushToken(chars[i], 'string delimiter')     // pushes to vm.token
                    while(chars[++i] !== '"' && i < chars.length) {  // get all chars until another delimiter
                        input += chars[i];
                    }   
                    if (i == chars.length) {
                        return { error: 'String not ended' }
                    }
                    pushToken(input, 'string literal');         // push string literal
                    pushToken(chars[i], 'string delimiter');    // push ending delimiter
                    input = '';                                 // clear input string
                    continue;                                   // get next lexeme
                }

                // [ INTEGER ] [ FLOAT ]
                if (Re.NUMBER_START.exec(chars[i])) {
                    input = '';
                    do {
                        input += chars[i];
                    } while(/[\d\.]/.exec(chars[++i]) && i < chars.length)

                    if (Re.WHITESPACE.exec(chars[i])) {
                        // [ INTEGER ]
                        if (Re.INTEGER.exec(input)) {
                            pushToken(input, 'integer literal');
                            input = ''
                            
                            continue;
                        }

                        // [ FLOAT ]
                        if (Re.FLOAT.exec(input)) {
                            pushToken(input, 'floating-point literal');
                            input = '';
                            
                            continue;
                        }
                    }
                    input = '';
                }

                // [ BOOLEAN ]
                if (exec = (Re.BOOLEAN.exec(input))) {
                    pushToken(exec[1], 'boolean literal');
                    input = '';
                    
                    continue;
                }

                // [ DATA TYPE ]
                if (exec = (Re.DATA_TYPE.exec(input))) {
                    pushToken(exec[1], 'data type');
                    input = '';
                    
                    continue;
                }

                // [ CODE DELIMITER ]
                if (exec = (Re.CODE_DELIMITER.exec(input))) {
                    if (exec[2])
                        pushToken(exec[2], 'code delimiter');
                    if (exec[4])
                        pushToken(exec[4], 'code delimiter');
                    input = '';
                    
                    continue;
                }


                // [ BLOCK COMMENT ]
                if (exec = Re.BLOCK_COMMENT_DELIMITER_START.exec(input)) {
                    //if (/\s*\n\s*OBTW$/.exec(input)) {
                        pushToken(exec[1], 'block comment delimiter');
                        input = '';
                        while(!(exec = Re.BLOCK_COMMENT_DELIMITER_END.exec(input)) && i < chars.length) {
                            input += chars[++i]
                        }
                        if (!exec) {
                            return { error: 'Block comment not ended' };
                        }
                        pushToken(exec[1], 'block comment');
                        pushToken(exec[2], 'block comment delimiter');
                        input = '';
                        
                        continue;
                   /* } else {
                        return { error: 'Block comment delimiter must be placed on different line' }
                    }*/
                }

                // [ LINE COMMENT ]
                if (exec = (Re.LINE_COMMENT_DELIMITER.exec(input))) {
                    pushToken(exec[1], 'line comment delimiter');
                    input = '';
                    while(!/\n/.exec(chars[++i]) && i < chars.length) {
                        input += chars[i];
                    }                        
                    pushToken(input, 'line comment');
                    input = '';
                    
                    continue;
                }

                // [ VISIBLE ]
                if (exec = (Re.OUTPUT.exec(input))) {
                    pushToken(exec[1], 'output keyword');
                    input = '';
                    
                    continue;
                }

                // [ GIMMEH ]
                if (exec = (Re.INPUT.exec(input))) {
                    pushToken(exec[1], 'input keyword');
                    input = '';
                    
                    continue;
                }

                // [ MATH OPERATOR ]
                if (exec = (Re.MATH_OPERATOR.exec(input))) {
                    pushToken(exec[1], 'math operator');
                    input = '';
                    
                    continue;
                }


                // [ BOOLEAN OPERATOR ]
                if (exec = (Re.BOOLEAN_OPERATOR.exec(input))) {
                    pushToken(exec[1], 'boolean operator');
                    input = '';
                    
                    continue;
                }

                // [ CONDITIONAL BLOCK ]
                if (exec = (Re.CONDITIONAL_BLOCK.exec(input))) {
                    pushToken(exec[1], 'conditional block');
                    input = '';
                    
                    continue;
                }

                // [ CONDITIONAL DELIMITER ]

                if (exec = (Re.CONDITIONAL_DELIMITER.exec(input))) {
                    pushToken(exec[1], 'conditional delimiter');
                    input = '';
                    
                    continue;
                }

                // [ COMPARISON BLOCK ]
                if (exec = (Re.COMPARISON_BLOCK.exec(input))) {
                    pushToken(exec[1], 'comparison block');
                    input = '';
                    
                    continue;
                }

                // [ CONCATENATION ]
                if (exec = (Re.CONCATENATION.exec(input))) {
                    pushToken(exec[1], 'concatenation');
                    input = '';
                    
                    continue;
                }

                // [ CASTING ]
                if (exec = (Re.CASTING_EXPLICIT.exec(input))) {
                    pushToken(exec[1], 'explicit casting');
                    input = '';
                    
                    continue;
                }
                if (exec = (Re.CASTING_IMPLICIT.exec(input))) {
                    pushToken(exec[1], 'implicit casting');
                    input = '';
                    
                    continue;
                }

                // [ UNARY OPERATOR ]
                if (exec = (Re.UNARY_OPERATOR.exec(input))) {
                    pushToken(exec[1], 'unary operator');
                    input = '';
                    
                    continue;
                }

                // [ CONTROL FLOW DELIMITER END ]
                if (exec = (Re.CONTROL_FLOW_DELIMITER_END.exec(input))) {
                    pushToken(exec[1], 'control flow delimiter end');
                    input = '';
                    
                    continue;
                }

                // [ SWITCH DELIMITER ]
                if (exec = (Re.SWITCH_DELIMITER.exec(input))) {
                    pushToken(exec[1], 'switch delimiter');
                    input = '';
                    
                    continue;
                }

                // [ PARAMETER DELIMITER ]
                if (exec = (Re.PARAMETER_DELIMITER.exec(input))) {
                    pushToken(exec[1], 'parameter delimiter');
                    input = '';
                    
                    continue;
                }


                // [ LOOP DELIMITER START ]
                if (exec = (Re.LOOP_DELIMITER_START.exec(input))) {
                    pushToken(exec[1], 'loop delimiter start');
                    input = '';
                    while(Re.WHITESPACE.test(chars[i])) {
                        i++;
                    }
                    do {
                        input += chars[i];
                    }
                    while (!Re.WHITESPACE.test(chars[++i]) && i < chars.length)
                    if (exec = (Re.VARIABLE_IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'loop label');
                        input = '';
                        i--;
                    } else {
                        return { error: 'Invalid loop label name: ['+ input +']'}
                    }
                    
                    continue;
                }

                // [ LOOP DELIMITER END ]
                if (exec = (Re.LOOP_DELIMITER_END.exec(input))) {
                    pushToken(exec[1], 'loop delimiter end');
                    input = '';
                    while(Re.WHITESPACE.test(chars[i])) {
                        i++;
                    }
                    do {
                        input += chars[i];
                        console.log(input);
                    }
                    while (!Re.WHITESPACE.test(chars[++i]) && i < chars.length)
                    var found = false;
                    for (token of vm.tokens) {
                        if (token.lexeme === input && token.classification === 'loop label') {
                            pushToken(input, 'loop label');
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        input = '';
                        continue;
                    } else {
                        return { error: 'Loop label does not exist: ['+input+']'};
                    }
                }

                // [ LOOP EVALUATION ]
                if (exec = (Re.LOOP_EVALUATION.exec(input))) {
                    pushToken(exec[1], 'loop evaluation');
                    input = '';
                    
                    continue;
                }

                if (exec = (Re.RETURN_W_VALUE.exec(input))) {
                    pushToken(exec[1], 'return delimiter');
                    input = '';
                    
                    continue;
                }

                if (exec = (Re.RETURN_W_O_VALUE.exec(input))) {
                    pushToken(exec[1], 'return delimiter');
                    input = '';
                    
                    continue;
                }

                // [ FUNCTION DECLARATION ]
                if (exec = (Re.FUNCTION_DELIMITER_START.exec(input))) {
                    pushToken(exec[1], 'function declaration');
                    input = '';
                    while(Re.WHITESPACE.test(chars[i])) {
                        i++;
                    }
                    do {
                        input += chars[i];
                    } while (!Re.WHITESPACE.test(chars[++i])  && i < chars.length)
                    if (exec = (Re.VARIABLE_IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'function identifier');
                        pushSymbol(exec[1], 'function');
                        input = '';
                        i--;
                    } else {
                        return { error: 'Invalid function identifier name: ['+ input +']'}
                    }
                    
                    continue;
                }

                // [ FUNCTION DECLARATION END ]
                if (exec = (Re.FUNCTION_DELIMITER_END.exec(input))) {
                    pushToken(exec[1], 'function declaration end');
                    input = '';
                    
                    continue;
                }

                // [ FUNCTION CALL ]
                if (exec = (Re.FUNCTION_CALL.exec(input))) {
                    pushToken(exec[1], 'function call delimiter');
                    input = '';
                    while(Re.WHITESPACE.test(chars[i])) {
                        i++;
                    }
                    do {
                        input += chars[i];
                    }
                    while (!Re.WHITESPACE.test(chars[++i]) && i < chars.length)
                    if (exec = (Re.VARIABLE_IDENTIFIER.exec(input))) {
                        for (symbol of vm.symbols) {
                            if (symbol.identifier === exec[1]) {
                                pushToken(exec[1], 'function identifier');
                            }
                        }
                    } else {
                        return { error: 'Invalid function identifier name: ['+ input +']'}
                    }
                    
                    continue;
                }         

                // [ FUNCTION ARGUMENT SEPARATOR ]  
                if (exec = (Re.FUNCTION_ARGUMENT_SEPARATOR.exec(input))) {
                    pushToken(exec[1], 'function argument delimiter');
                    input = '';
                    while(Re.WHITESPACE.test(chars[i])) {
                        i++;
                    }
                    do {
                        input += chars[i];
                    } while (!Re.WHITESPACE.test(chars[++i]) && i < chars.length)
                    if (exec = (Re.VARIABLE_IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'variable identifier');
                        var found = false;
                        for (symbol of vm.symbols) {
                            if (symbol.identifier === exec[1]) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            pushSymbol(exec[1], 'NOOB');
                        }
                        input = '';
                        i--;
                    } else {
                        return { error: 'invalid variable identifier name: '+ input }
                    }
                    continue;
                }

                // [ VARIABLE DECLARATION ]
                if (exec = (Re.DECLARATION_DELIMITER.exec(input))) {
                    pushToken(exec[1], 'declaration delimiter');
                    input = '';
                    while(Re.WHITESPACE.test(chars[i])) {
                        i++;
                    }
                    do {
                        input += chars[i];
                    } while (!Re.WHITESPACE.test(chars[++i]) && i < chars.length)
                    if (exec = (Re.VARIABLE_IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'variable identifier');
                        var found = false;
                        for (symbol of vm.symbols) {
                            if (symbol.identifier === exec[1]) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            pushSymbol(exec[1], 'NOOB');
                        }
                        input = '';
                        i--;
                    } else {
                        return { error: 'invalid variable identifier name: '+ input }
                    }
                    
                    continue;
                }

                // [ VARIABLE ASSIGNMENT ]
                if (exec = (Re.ASSIGNMENT_OPERATOR.exec(input))) {
                    pushToken(exec[1], 'assignment operator');
                    input = '';
                    
                    continue;
                }
                // [ KNOWN VARIABLE IDENTIFIERS ]
                if (exec = (Re.VARIABLE_IDENTIFIER).exec(input)) {
					var input1= input;
					var exec1 = null;
					input1+= chars[i+1]; //double check if preceding is space
					if(exec1= (Re.VARIABLE_IDENTIFIER).exec(input1)){	
						//console.log('['+exec[1]+']');
						var found = false;
						for (symbol of vm.symbols) {
							if (symbol.identifier == exec1[1]) {
								pushToken(exec1[1], 'variable identifier');
								input = input1;
								input = '';
								i++;
								break;
							}
						}
						if (found) {
							continue;
						}
					}
                }
            }
            if (vm.tokens.length < 2) {
                return { error: 'No code delimiter' }
            } else if  (vm.tokens[vm.tokens.length-1].classification !== 'code delimiter' || vm.tokens[0].classification !== 'code delimiter') {
                return { error: 'No code delimiter' }
            }
            return { success: 'Success in analyzing ' }
        }
        function initialize() {
            vm.tokens = [];
            vm.symbols = [];
            vm.results = analyze();
            if (vm.results.error) {
                console.log('ERROR: '+vm.results.error);
                $('#ERROR').modal('show');
            } else {
                console.log('SUCCESS');
            }
            console.log('\n\nTOKENS:')
            console.log(vm.tokens);
            console.log('SYMBOLS:')
            console.log(vm.symbols);
            $scope.$apply();
        }

        function loadFile() {
            var reader = new FileReader();
            reader.onload = function() {
                vm.text = reader.result;
                initialize();
            }
            reader.readAsText(vm.file);
        }

        function openFile() {
            $('#file').click();
        }


        function pushToken(input, classification) {
            console.log('Pushed token [' + input +':' + classification+ ']');
            vm.tokens.push({
                lexeme: input,
                classification: classification
            });
        }

        function pushSymbol(input, type) {
            console.log('Pushed symbol ['+input+']');
            vm.symbols.push({
                identifier: input,
                type: type,
                value: ''
            });
        }

    }
})();
