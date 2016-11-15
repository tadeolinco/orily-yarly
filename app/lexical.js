(function() {
    angular
        .module('app')
        .controller('lexicalController', lexicalController);

    function lexicalController($scope) {
        var vm = this;
        vm.file = null;
        vm.text = "";
        vm.tokens = [];
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
            CODE_DELIMITER                  : /(HAI|KTHXBYE)$/
        });




        function analyze() {
            vm.tokens = [];
            var chars = vm.text.split('');
            var input = '';
            var exec = null;
            for (let i=0; i < chars.length; i++) {
                input += chars[i];
                console.log(input);
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
                if (Re.CODE_DELIMITER.exec(input)) {
                    pushToken(input, 'code delimiter');
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
                if (Re.LINE_COMMENT_DELIMITER.exec(input)) {
                    pushToken(input, 'line comment delimiter');
                    input = '';
                    while(!/\n/.exec(chars[++i]) && i < chars.length) {
                        input += chars[i];
                        console.log(chars[i]);
                    }                        
                    pushToken(input, 'line comment');
                    input = '';
                    continue;
                }
            }
            if (vm.tokens[vm.tokens.length-1].type !== 'code delimiter' || vm.tokens[0] !== 'code delimiter') {
                return { error: 'error code delimiter' }
            } 
            return { success: 'Success in analyzing ' }
        }


        function loadFile() {
            var reader = new FileReader();
            reader.onload = function() {
                vm.text = reader.result;
                vm.tokens = [];
                analyze();
                console.log(vm.tokens);
                $scope.$apply();
            }
            reader.readAsText(vm.file);
        }

        function openFile() {
            $('#file').click();
        }


        function pushToken(input, type) {
            console.log('Pushed token [' + input +' : ' + type+ ']');
            vm.tokens.push({
                input: input,
                type: type
            });
        }

    }
})();
