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

        function loadFile() {
            var reader = new FileReader();
            reader.onload = function() {
                vm.text = reader.result;
                vm.tokens = [];
                $scope.$apply();
                analyze();
            }
            reader.readAsText(vm.file);
        }

        function openFile() {
            $('#file').click();
        }


        function pushToken(input, type) {
            vm.tokens.push({
                input: input,
                type: type
            });
        }

        function analyze() {
            var chars = vm.text.split('');
            var input = '';
            for (let i=0; i < chars.length; i++) {
                input += chars[i];
                

                // [STRING] check
                if (input === "'" || input === '"') {           // initial string delimiter
                    var delimiter = input;                      // saves which one was used
                    pushToken(input, 'string delimiter')        // pushes to vm.token
                    input = '';                                 // clear input string
                    while(chars[++i] !== delimiter) {           // get all chars until another delimiter
                        input += chars[i];                      
                        console.log(input);
                    }   
                    pushToken(input, 'string literal');         // push string literal
                    pushToken(chars[i], 'string delimiter');    // push ending delimiter
                    input = '';                                 // clear again
                    continue;                                   // get next lexeme
                }
                     
            }
            console.log(vm.tokens);
            $scope.$apply();
        }



    }
})();
