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

        vm.loadFile = loadFile;
        vm.openFile = openFile;

        /* LEXEMES */
        const Re = Object.freeze({
            STRING_DELIMITER                : /^"/,
            NUMBER_START                    : /^[-\d\.]/,
            FLOAT                           : /^((-\d*\.\d+)|(-?\d+\.\d+))$/,
            INTEGER                         : /^((0)|(-?[1-9]\d*))$/,
            WHITESPACE                      : /\s/, 
            LINE_COMMENT_DELIMITER          : /(BTW)$/,
            BLOCK_COMMENT_DELIMITER_START   : /(OBTW)$/,
            BLOCK_COMMENT_DELIMITER_END     : /([\S\s]*\n[\S\s]*)(TLDR)$/, 
            CODE_DELIMITER                  : /((HAI)\s+)|(\s+(KTHXBYE))$/,
            VARIABLE_IDENTIFIER             : /([a-zA-Z][a-zA-Z_]*)$/,
            INPUT                           : /\s(VISIBLE)\s+/,
            OUTPUT                          : /\s(GIMMEH)\s+/,
            PARAMETER_DELIMETER             : /\s(AN)\s+/,

            // CONTROL FLOW
            CONDITIONAL_BLOCK               : /\s(YA RLY|NO WAI|MEBBE)\s+/,
            CONDITIONAL_DELIMITER           : /\s(O RLY\?)\s+/,
            COMPARISON_BLOCK                : /\s(OMG|OMGWTF)\s+/,

            CONTROL_FLOW_DELIMITER_END      : /(OIC)\s+/,
            SWITCH_DELIMITER                : /(WTF\?)\s+/,

            // DATA TYPE
            BOOLEAN                         : /\s(WIN|FAIL)\s+/,
            DATA_TYPE                       : /\s(YARN|NUMBR|NUMBAR|TROOF|NOOB)\s/,

            // FUNCTION
            FUNCTION_CALL                   : /\s(I IZ)\s+/,
            FUNCTION_DELIMETER              : /\s(HOW IZ I|IF U SAY SO)\s+/,
            FUNCTION_ARGUMENT_SEPARATOR     : /\s(AN YR)\s+/,

            // LOOPS
            LOOP_DELIMETER                  : /\s(IM IN YR|IM OUTTA YR)\s+/,
            LOOP_EVALUATION                 : /\s(TIL|WILE)\s+/,

            // OPERATORS
            MATH_OPERATORS                  : /\s(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF)\s+/,
            BOOLEAN_OPERATORS               : /\s(BOTH OF|EITHER OF|WON OF|NOT|ALL OF|ANY OF|BOTH SAEM|DIFFRINT)\s+/,
            CONCATENATION                   : /\s(SMOOSH)\s+/,
            CASTING_IMPLICIT                : /\s(MAEK)\s+/,
            CASTING_EXPLICIT                : /\s(IS NOW A|R MAEK)\s+/,
            UNARY_OPERATORS                 : /\s(NERFIN|UPPIN)\s+/,

            // RETURN
            RETURN_W_VALUE                  : /\s(FOUND YR)\s+/,
            RETURN_W_O_VALUE                : /\s(GTFO)\s+/,

            // VARIABLE DECLARATION
            DECLARATION_DELIMITER           : /\s(I HAS A)\s+/,
            ASSIGNMENT_OPERATOR             : /\s(R|ITZ)\s+/
        });




        function analyze() {
            vm.tokens = [];
            var chars = vm.text.split('');
            var input = '';
            var exec = null;
            for (let i=0; i < chars.length; i++) {
                input += chars[i];
                console.log('input: '+input);
                console.log("start: "+chars[i]);

                // [ STRING ]
                if (Re.STRING_DELIMITER.exec(chars[i])) {        // initial string delimiter
                    input = '';
                    pushToken(chars[i], 'string delimiter')     // pushes to vm.token
                    while(chars[++i] !== '"' && i < chars.length) {  // get all chars until another delimiter
                        input += chars[i];
                        console.log(chars[i]);
                    }   
                    if (i == chars.length) {
                        return { error: 'string no delimiter' }
                    }
                    pushToken(input, 'string literal');         // push string literal
                    pushToken(chars[i], 'string delimiter');    // push ending delimiter
                    console.log(chars[i]);
                    input = '';                                 // clear input string
                    continue;                                   // get next lexeme
                }

                // [ INTEGER ] [ FLOAT ]
                if (Re.NUMBER_START.exec(chars[i])) {
                    input = '';
                    do {
                        input += chars[i];
                        console.log(chars[i]);
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
                    pushToken(exec[1], 'block comment delimiter');
                    input = '';
                    while(!(exec = Re.BLOCK_COMMENT_DELIMITER_END.exec(input)) && i < chars.length) {
                        input += chars[++i]
                        console.log(chars[i]);
                    }
                    if (!exec) {
                        return { error: 'block comment no delimiter' };
                    }
                    pushToken(exec[1], 'block comment');
                    pushToken(exec[2], 'block comment delimiter');
                    input = '';
                    continue;
                }

                // [ LINE COMMENT ]
                if (exec = (Re.LINE_COMMENT_DELIMITER.exec(input))) {
                    pushToken(exec[1], 'line comment delimiter');
                    input = '';
                    while(!/\n/.exec(chars[++i]) && i < chars.length) {
                        input += chars[i];
                        console.log(chars[i]);
                    }                        
                    pushToken(input, 'line comment');
                    input = '';
                    continue;
                }

                // [ VARIABLE DECLARATION ]
                if (exec = (Re.DECLARATION_DELIMITER.exec(input))) {
                    pushToken(exec[1], 'declaration delimiter');
                    input = '';
                    while (!Re.WHITESPACE.test(chars[++i])) {
                        input += chars[i];
                    } 
                    if (exec = (Re.VARIABLE_IDENTIFIER.exec(input))) {
                        pushToken(input, 'variable identifier');
                        pushSymbol(input);
                        input = '';
                    } else {
                        return { error: 'invalid variable indentifier name: '+ input }
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
                    for (symbol of vm.symbols) {
                        if (symbol.identifier == exec[1]) {
                            pushToken(input, 'variable identifier');
                            input = '';
                            continue;
                        }
                    }
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
                if (exec = (Re.MATH_OPERATORS.exec(input))) {
                    pushToken(exec[1], 'math operator');
                    input = '';
                    continue;
                }


                // [ BOOLEAN OPERATOR ]
                if (exec = (Re.BOOLEAN_OPERATORS.exec(input))) {
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

                // [ CONDITIONAL DELIMITER]

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

                if (exec = (Re.PARAMETER_DELIMETER.exec(input))) {
                    pushToken(exec[1], 'argument separator');
                    input = '';
                    continue;
                }
            }
            if (vm.tokens.length === 0 || vm.tokens[vm.tokens.length-1].classification !== 'code delimiter' || vm.tokens[0].classification !== 'code delimiter') {
                return { error: 'error code delimiter' }
            } 
            return { success: 'Success in analyzing ' }
        }


        function loadFile() {
            var reader = new FileReader();
            reader.onload = function() {
                vm.text = reader.result;
                vm.tokens = [];
                var results = analyze();
                if (results.error) {
                    console.log('ERROR: '+results.error);
                } else {
                    console.log('SUCCESS');
                }
                console.log('\n\nTOKENS:')
                console.log(vm.tokens);
                console.log('SYMBOLS:')
                console.log(vm.symbols);
                $scope.$apply();
            }
            reader.readAsText(vm.file);
        }

        function openFile() {
            $('#file').click();
        }


        function pushToken(input, classification) {
            console.log('Pushed token [' + input +' : ' + classification+ ']');
            vm.tokens.push({
                lexeme: input,
                classification: classification
            });
        }

        function pushSymbol(input) {
            console.log('Pushed symbol ['+input+']');
            vm.symbols.push({
                identifier: input,
            });
        }

    }
})();
