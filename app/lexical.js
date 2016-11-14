(function() {
    angular
        .module('app')
        .controller('lexicalController', lexicalController);

    function lexicalController($scope) {
        var vm = this;
        vm.file = null;
        vm.text = "";

        vm.loadFile = loadFile;

        function loadFile() {
            var reader = new FileReader();
            reader.onload = function() {
                vm.text = reader.result;
                $scope.$apply();
            }
            reader.readAsText(vm.file);
        }

    }
})();
