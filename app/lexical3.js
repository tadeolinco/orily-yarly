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
        RE_STRING                          = /((")(.*)("))/;
        RE_FLOAT                           = /((-\d*\.\d+)|(-?\d+\.\d+))/;
        RE_INTEGER                         = /((0)|(-?[1-9]\d*))/;
        RE_BOOLEAN                         = /(WIN|FAIL)/;
        RE_LITERAL                         = new RegExp(str(RE_STRING)+'|'+str(RE_FLOAT)+'|'+str(RE_INTEGER)+'|'+str(RE_BOOLEAN), 'g');
        RE_WHITESPACE                      = /\s/; 
        RE_LINE_COMMENT_DELIMITER          = /(BTW)$/;
        RE_BLOCK_COMMENT_DELIMITER_START   = /(OBTW)$/;
        RE_BLOCK_COMMENT_DELIMITER_END     = /([\S\s]*\n[\S\s]*)(TLDR)$/; 
        RE_CODE_DELIMITER                  = /((HAI)(?:\s+))|((?:\s+)(KTHXBYE))$/;
        RE_KEYWORD                         = /\s+((BOTH OF)|(EITHER OF)|(WON OF)|(NOT)|(ALL OF)|(ANY OF)|(BOTH SAEM)|(DIFFRINT)|(SMOOSH)|(MAEK)|(IS NOW A)|(A)|(YR)|(IM IN YR)|(IM OUTTA YR)|(I IZ)|(UPPIN)|(NERFIN)|(TIL)|(WILE)|(AN YR))\s+$/


        function analyze() {
            console.log(RE_LITERAL);
            vm.tokens = [];
            var lines = vm.text.split('\n');
            var input = '';
            var exec = null;
            for (line of lines) {
                console.log(RE_FLOAT.test(line));
                if ((exec = RE_LITERAL.exec(line))) {
                    console.log(exec);
                    var exec2 = exec;
                    // [ STRING ]
                    if ((exec = RE_STRING.exec(exec2[0]))) {
                        pushToken(exec[2], 'string delimiter');
                        pushToken(exec[3], 'string literal');
                        pushToken(exec[4], 'string delimiter');
                    }

                    // [ FLOAT ]
                    else if ((exec = RE_FLOAT.exec(exec2[0]))) {
                        pushToken(exec[0], 'floating-point literal');
                    }

                    // [ INTEGER ]
                    else if ((exec = RE_INTEGER.exec(exec2[0]))) {
                        pushToken(exec[0], 'integer literal');
                    }
                }


            }
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
            console.log('Push token [' + input +' : ' + type+ ']');
            vm.tokens.push({
                input: input,
                type: type
            });
        }

        function str(regex) {
            return regex.toString().split('/')[1];
        }

        function expect(regex, string) {

        }
    }
})();
