(function() {
    angular
        .module('app')
        .controller('lolController', lolController);

    function lolController($scope, lexer, parser) {
        var vm = this;

        vm.file = null;
        vm.text = "";
        vm.tokens = [];
        vm.symbols = [];
        vm.terminal = [];
        vm.input = {flag:false, value:""};

        vm.execute = execute;
        vm.loadFile = loadFile;
        vm.openFile = openFile;
        vm.submit = submit;

        /* SETUP FILE READER */
        var reader = new FileReader();
        reader.onload = function() {
            vm.text = reader.result;
            $scope.$apply();
        }

        function execute() {
            vm.tokens = [];
            vm.symbols = [];
            vm.terminal = [];
            vm.input = {flag:false, value:""};
            lexer.analyze(vm.text, vm.tokens, vm.symbols);
            parser.analyze(vm.tokens, vm.symbols, vm.terminal, vm.input);
            console.log(vm.tokens);
            console.log(vm.symbols);
            console.log(vm.input.flag);
        }

        function loadFile() {
            reader.readAsText(vm.file);
        }
        
        function openFile() {
            $('#file').click();
        }

        function submit() {
            console.log(vm.input.value);
            vm.terminal.push(vm.input.value);
            vm.input.value = "";
            vm.input.flag = false;
        }

    }

})();
