(function() {
    angular
        .module('app')
        .controller('lolController', lolController);

    function lolController($scope, lexical) {
        var vm = this;

        vm.file = null;
        vm.text = "";
        vm.tokens = [];
        vm.symbols = [];

        vm.execute = execute;
        vm.loadFile = loadFile;
        vm.openFile = openFile;

        /* SETUP FILE READER */
        var reader = new FileReader();
        reader.onload = function() {
            vm.text = reader.result;
            $scope.$apply();
        }

        function execute() {
            var results = lexical.analyze(vm.text);
            vm.tokens = results.tokens;
            vm.symbols = results.symbols;
        }

        function loadFile() {
            reader.readAsText(vm.file);
        }
        
        function openFile() {
            $('#file').click();
        }

    }

})();
