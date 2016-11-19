(function() {
    angular
        .module('app')
        .factory('lexical', lexical);


    function lexical() {
        const Re = {
            // [ LITERALS ]
            STRING_DELIMITER                : /(")/,
            NUMBER_START                    : /\s[-\d\.]/,
            FLOAT                           : /((-\d*\.\d+)|(-?\d+\.\d+))$/,
            INTEGER                         : /((0)|(-?[1-9]\d*))$/,
            BOOLEAN                         : /\b(WIN|FAIL)[\s,]/,

            // [ VARIABLE DECLARATION ]
            DECLARATION_DELIMITER           : /\b(I HAS A)[\s,]/,

            // [ VARIABLE INITIALIZATION ]
            INITIALIZATION_DELIMITER        : /\b(ITZ)[\s,]/,

            // [ ASSIGNMENT OPERATOR ]
            ASSIGNMENT_OPERATOR             : /\b(R)[\s,]/,

            // [ IDENTTIFIER ]
            IDENTIFIER                      : /\b([a-zA-Z]\w*)[\s,]/,

            // [ DATA TYPES ]
            DATA_TYPE                       : /\b(YARN|NUMBR|NUMBAR|TROOF|NOOB)[\s,]/,

            // [ GENERAL DELIMITERS ]
            CODE_DELIMITER_START            : /\b(HAI)/,
            CODE_DELIMITER_END              : /\b(KTHXBYE)/,
            STATEMENT_DELIMITER             : /([\n,])$/,

            // [ COMMENTS ]
            LINE_COMMENT_DELIMITER          : /\b(BTW)/,
            BLOCK_COMMENT_DELIMITER_START   : /\b(OBTW)/,
            BLOCK_COMMENT_DELIMITER_END     : /([\s\S]*)\b(TLDR)\s*\n/,

            // [ IO ]
            INPUT                           : /\b(GIMMEH)[\s,]/,
            OUTPUT                          : /\b(VISIBLE)[\s,]/,

            // [ BREAK ]
            BREAK_DELIMITER                 : /\b(GTFO)[\s,]/,

            // [ LOOPS ]
            LOOP_DELIMITER_START            : /\b(IM IN YR)[\s,]/,
            LOOP_DELIMITER_END              : /\b(IM OUTTA YR)[\s,]/,
            LOOP_CONDITION                  : /\b(TIL|WILE)[\s,]/,

            // [ INCREMENT DECREMENT OPERATOR ]
            INCREMENT_OPERATOR              : /\b(UPPIN)[\s,]/,
            DECREMENT_OPERATOR              : /\b(NERFIN)[\s,]/,

            // [ FUNCTIONS ]
            FUNCTION_DELIMITER_START        : /\b(HOW IZ I)[\s,]/,
            FUCNTION_ARGUMENT_DELIMITER     : /\b(YR)[\s,]/,
            FUNCTION_DELIMITER_END          : /\b(IF U SAY SO)[\s,]/,
            FUNCTION_CALL                   : /\b(I IZ)[\s,]/,

            // [ RETURN OPERATOR ]
            RETURN_OPERATOR                 : /\b(FOUND YR)[\s,]/,

            // [ PARAMETER DELIMITER ]
            PARAMETER_DELIMITER             : /\b(AN)[\s,]/
        };

        return service = {
            analyze: analyze,
        };


        function analyze(text) {
            var tokens = [];
            var symbols = [];
            var chars = text.split('');
            var input = '';
            var exec = null;
            for (let i = 0; i < chars.length; i++) {
                input += chars[i];
                console.log(format(input));

                // [ DECLARATION_DELIMITER ]
                if (exec = (Re.DECLARATION_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'declaration delimiter');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        console.log(format(input));
                    } 
                    if (exec = (Re.IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'variable identifier');
                        pushSymbol(exec[1], 'NOOB');
                    }
                    input = '';
                    i--;
                    continue;
                }

                // [ INITIALIZATION_DELIMITER ]
                if (exec = (Re.INITIALIZATION_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'initialization delimiter');
                    i--;
                    continue;
                }

                // [ ASSIGNMENT OPERATOR ]
                if (exec = (Re.ASSIGNMENT_OPERATOR.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'assignment operator');
                    i--;
                    continue;
                }

                // [ INCREMENT OPERATOR ]
                if (exec = (Re.INCREMENT_OPERATOR.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'increment operator');
                    i--;
                    continue;
                }

                // [ DECREMENT OPERATOR ]
                if (exec = (Re.DECREMENT_OPERATOR.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'decrement operator');
                    i--;
                    continue;
                }

                // [ BREAK ]
                if (exec = (Re.BREAK_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'break delimiter');
                    i--;
                    continue;
                }

                // [ LOOP DELIMITER START ]
                if (exec = (Re.LOOP_DELIMITER_START.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'loop delimiter start');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        console.log(format(input));
                    } 
                    if (exec = (Re.IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'loop identifier');
                    }
                    input = '';
                    i--;
                    continue;
                }

                // [ LOOP CONDITION ]
                if (exec = (Re.LOOP_CONDITION.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'loop condition');
                    i--;
                    continue;
                }

                // [ LOOP DELIMITER END ]
                if (exec = (Re.LOOP_DELIMITER_END.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'loop delimiter end');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        console.log(format(input));
                    } 
                    if (exec = (Re.IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'loop identifier');
                    }
                    input = '';
                    i--;
                    continue;
                }


                // [ DATA TYPES ]
                if (exec = (Re.DATA_TYPE.exec(input))) {
                    checkTrash(input, exec[1]);
                    switch (exec[1]) {
                        case "YARN"     : pushToken(exec[1], 'string data type');           break;
                        case "NUMBR"    : pushToken(exec[1], 'integer data type');          break;
                        case "NUMBAR"   : pushToken(exec[1], 'floating-point data type');   break;
                        case "TROOF"    : pushToken(exec[1], 'boolean data type');          break;
                        case "NOOB"     : pushToken(exec[1], 'untyped data type');          break;
                    }
                    i--;
                    continue;
                }

                // [ INPUT ]
                if (exec = (Re.INPUT.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'input delimiter');
                    i--;
                    continue;
                }

                // [ OUTPUT ]
                if (exec = (Re.OUTPUT.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'output delimiter');
                    i--;
                    continue;
                }

                // [ BLOCK COMMENT ]
                if (exec = (Re.BLOCK_COMMENT_DELIMITER_START.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'block comment delimiter');
                    while(!(exec = (Re.BLOCK_COMMENT_DELIMITER_END.exec(input))) && i < chars.length) {
                        input += chars[++i];
                        console.log(format(input));
                    }
                    i--;
                    pushToken(exec[1], 'block comment');
                    pushToken(exec[2], 'block comment delimiter');
                    continue;

                }


                // [ LINE COMMENT ]
                if (exec = (Re.LINE_COMMENT_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'line comment delimiter');
                    while (!(exec = (/(.*)\n/).exec(input)) && i < chars.length) {
                        input += chars[++i];
                        console.log(format(input));
                    }
                    i--;
                    pushToken(exec[1], 'line comment');
                    continue;
                }

                // [ BOOLEAN ]
                if (exec = (Re.BOOLEAN.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'boolean literal');
                    i--;
                    continue;
                }

                // [ NUMBER FLOAT ]
                if (exec = (Re.NUMBER_START.exec(input))) {
                    while (!/[\s,]/.test(chars[++i]) && i < chars.length) {
                        input += chars[i];
                        console.log(format(input));
                    }
                    i--;
                    // [ FLOAT ]
                    if (exec = (Re.FLOAT.exec(input))) {
                        checkTrash(input, exec[1]);
                        pushToken(exec[1], 'floating-point literal');
                        continue;
                    }

                    if (exec = (Re.INTEGER.exec(input))) {
                        checkTrash(input, exec[1]);
                        pushToken(exec[1], 'integer literal');
                        continue;
                    }
                }

                // [ STRING ]
                if (exec = (Re.STRING_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'string delimiter');
                    while (!(exec = (/(.*)(")[\s,]/.exec(input))) && i < chars.length) {
                        input += chars[++i]; 
                        console.log(format(input));
                    }
                    i--;
                    pushToken(exec[1], 'string literal');
                    pushToken(exec[2], 'string delimiter');
                    continue;
                }

                // [ PAREMTER DELIMITER ]
                if (exec = (Re.PARAMETER_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'parameter delimiter');
                    i--;
                    continue;
                }

                // [ FUNCTION CALL ]
                if (exec = (Re.FUNCTION_CALL.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'function call delimiter');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        console.log(format(input));
                    } 
                    if (exec = (Re.IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'function identifier');
                    }
                    input = '';
                    i--;
                    continue;
                }

                // [ RETURN OPERATOR ]
                if (exec = (Re.RETURN_OPERATOR.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'return operator');
                    i--;
                    continue;
                }

                // [ FUNCTION DELIMITER START ]
                if (exec = (Re.FUNCTION_DELIMITER_START.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'function delimiter start');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        console.log(format(input));
                    } 
                    if (exec = (Re.IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'function identifier');
                        pushSymbol(exec[1], 'function');
                    }
                    input = '';
                    i--;
                    continue;
                }

                // [ FUNCTION ARGUMENT DELIMITER ]
                if (exec = (Re.FUCNTION_ARGUMENT_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'function argument delimiter');
                    i--;
                    continue;
                }

                // [ FUNCTION DELIMITER END ]
                if (exec = (Re.FUNCTION_DELIMITER_END.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'function delimiter end');
                    i--;
                    continue;
                }

                // [ CODE DELIMITER START ]
                if (exec = (Re.CODE_DELIMITER_START.exec(input))) {
                    pushToken(exec[1], 'code delimiter');
                    continue;
                }

                // [ CODE DELIMITER END ]
                if (exec = (Re.CODE_DELIMITER_END.exec(input))) {
                    pushToken(exec[1], 'code delimiter');
                    continue;
                }

                // [ STATEMENT DELIMITER ]
                if (exec = (Re.STATEMENT_DELIMITER.exec(input))) {
                    checkTrash(input, exec[1]);
                    pushToken(exec[1], 'statement delimiter');
                    continue;
                }
            }


            // [ CHECKS FOR KNOWN VARIABLES ]
            for (token of tokens) {
                if (token.classification === 'UNEXPECTED') {
                    for (symbol of symbols) {
                        if (symbol.identifier === token.lexeme) {
                            if (symbol.type === 'function') {
                                token.classification = 'function variable';
                            } else {
                                token.classification = 'variable identifier';
                            }
                        }
                    }
                }
            }


            return {
                tokens: tokens,
                symbols: symbols
            };

           function pushToken(lexeme, classification) {
                console.log('Push token: ' + format(lexeme) + ' : ' +format(classification));
                tokens.push({
                    lexeme          : lexeme,
                    classification  : classification
                });
                input = '';
            }

            function pushSymbol(identifier, type) {
                console.log('Push symbol: '+format(identifier) + ' : ' + format(type));
                symbols.push({
                    identifier  : identifier,
                    type        : type,
                    value       : ''
                });
            }

            function checkTrash(input, exec) {
                var darest = input.substr(0, input.search(exec));
                var strings = darest.split(/\s+/);
                for (string of strings) {
                    if (!/^\s*$/.test(string)) {
                        pushToken(string, 'UNEXPECTED');
                    }
                }
            }   

            function format(string) {
                return '['+string+']';
            }

        }
    }


})();
