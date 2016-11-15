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
                if (input === "'" || input === '"') {
                    var delimiter = input;
                    pushToken(input, 'string delimiter')
                    input = '';
                    while(chars[++i] !== delimiter) {
                        input += chars[i];
                        console.log(input);
                    }
                    pushToken(input, 'string');
                    if (chars[i] === delimiter)
                        pushToken(chars[i], 'string delimiter');
                    continue;
                }    
                //
                     
            }
            console.log(vm.tokens);
            $scope.$apply();
        }



    }
})();
