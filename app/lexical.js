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
            //STRING_DELIMITER                : /^"/,
            //NUMBER_START                    : /^[-\d\.]/,
            //FLOAT                           : /^((-\d*\.\d+)|(-?\d+\.\d+))$/,
            //INTEGER                         : /^((0)|(-?[1-9]\d*))$/,
            //WHITESPACE                      : /\s/, 
            //LINE_COMMENT_DELIMITER          : /\s(BTW)$/,
            //BLOCK_COMMENT_DELIMITER_START   : /(OBTW)$/,
            //BLOCK_COMMENT_DELIMITER_END     : /([\S\s]*\n[\S\s]*)(TLDR)$/, 
            //CODE_DELIMITER                  : /((HAI)\s+)|((KTHXBYE))$/,
            //VARIABLE_IDENTIFIER             : /([a-zA-Z][a-zA-Z_]*)$/,
            //OUTPUT                          : /(VISIBLE)\s+/,
            //INPUT                           : /(GIMMEH)\s+/,
            //PARAMETER_DELIMITER             : /(AN)\s+/,

            // CONTROL FLOW
            CONDITIONAL_BLOCK               : /(YA RLY|NO WAI|MEBBE)\s+/,
            CONDITIONAL_DELIMITER           : /(O RLY\?)\s+/,
            COMPARISON_BLOCK                : /(OMG|OMGWTF)\s+/,

            CONTROL_FLOW_DELIMITER_END      : /(OIC)\s+/,
            SWITCH_DELIMITER                : /(WTF\?)\s+/,

            // DATA TYPE
            //BOOLEAN                         : /(WIN|FAIL)\s+/,
            //DATA_TYPE                       : /(YARN|NUMBR|NUMBAR|TROOF|NOOB)\s+/,

            // LOOPS
            //LOOP_DELIMITER_START            : /(IM IN YR)\s+/,
            //LOOP_DELIMITER_END              : /(IM OUTTA YR)\s+/,
            //LOOP_EVALUATION                 : /(TIL|WILE)\s+/,
            
            // FUNCTION
            //RETURN_W_VALUE                  : /(FOUND YR)\s+/,
            //RETURN_W_O_VALUE                : /(GTFO)\s+/,
            /*FUNCTION_CALL                   : /(I IZ)\s+/,
            FUNCTION_DELIMITER_START        : /(HOW IZ I)\s+/,
            FUNCTION_DELIMITER_END          : /(IF U SAY SO)\s+/,
            FUNCTION_ARGUMENT_SEPARATOR     : /(YR)\s+/,*/


            // OPERATOR
            BOOLEAN_OPERATOR                : /(BOTH OF|EITHER OF|WON OF|NOT|ALL OF|ANY OF|BOTH SAEM|DIFFRINT)\s+/,
            CONCATENATION                   : /(SMOOSH)\s+/,
            CASTING_IMPLICIT                : /(MAEK)\s+/,
            CASTING_EXPLICIT                : /(IS NOW A)\s+/,
            MATH_OPERATOR                   : /(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF)\s+/,
            //UNARY_OPERATOR                  : /(NERFIN|UPPIN)\s+/,

            // VARIABLE DECLARATION
            /*ASSIGNMENT_OPERATOR             : /\b(R|ITZ)\b\s+/,
            DECLARATION_DELIMITER           : /\b(I HAS A)\b\s+/,*/
        });
    }
})();
