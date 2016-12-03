(function() {
    angular
        .module('app')
        .factory('lexer', lexer);


    function lexer() {
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
            CODE_DELIMITER_START            : /\b(HAI)[\s,]/,
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

			// [ CONTROL FLOW ]
            CONDITIONAL_DELIMITER_START     : /\b(O RLY\?)[\s,]/,
			CONDITIONAL_IF_DELIMITER        : /\b(YA RLY)[\s,]/,
            CONDITIONAL_ELSE_IF_DELIMITER   : /\b(MEBBE)[\s,]/,
            CONDITIONAL_ELSE_DELIMITER      : /\b(NO WAI)[\s,]/,

            SWITCH_DELIMITER                : /\b(WTF\?)[\s,]/,
            CASE_DELIMITER                  : /\b(OMG)[\s,]/,
            DEFAULT_CASE_DELIMITER          : /\b(OMGWTF)[\s,]/,
			
            CONDITIONAL_DELIMITER_END      : /\b(OIC)[\s,]/,
            
            // [ LOOPS ]
            LOOP_DELIMITER_START            : /\b(IM IN YR)[\s,]/,
            LOOP_DELIMITER_END              : /\b(IM OUTTA YR)[\s,]/,
            LOOP_CONDITION                  : /\b(TIL|WILE)[\s,]/,

            // [ INCREMENT DECREMENT OPERATOR ]
            INCREMENT_OPERATOR              : /\b(UPPIN)[\s,]/,
            DECREMENT_OPERATOR              : /\b(NERFIN)[\s,]/,

            // [ FUNCTIONS ]
            FUNCTION_DELIMITER_START        : /\b(HOW IZ I)[\s,]/,
            FUNCTION_ARGUMENT_DELIMITER     : /\b(YR)[\s,]/,
            FUNCTION_DELIMITER_END          : /\b(IF U SAY SO)[\s,]/,
            FUNCTION_CALL                   : /\b(I IZ)[\s,]/,

            // [ OPERATORS ]
            BOOLEAN_OPERATOR                : /\b(BOTH OF|EITHER OF|WON OF|NOT|ALL OF|ANY OF|BOTH SAEM|DIFFRINT)[\s,]/,
            CONCATENATION                   : /\b(SMOOSH)[\s,]/,
            CASTING                         : /\b(MAEK|IS NOW A)[\s,]/,
            MATH_OPERATOR                   : /\b(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF)[\s,]/,
            INFINITE_ARITY_DELIMITER        : /\b(MKAY)[\s,]/,

            // [ RETURN OPERATOR ]
            RETURN_OPERATOR                 : /\b(FOUND YR)[\s,]/,

            // [ PARAMETER DELIMITER ]
            PARAMETER_DELIMITER             : /\b(AN)[\s,]/
        };

        return service = {
            analyze: analyze,
        };


        function analyze(text, tokens, symbols) {
            var chars = text.split('');
            var input = '';
            var exec = null;
            pushSymbol('IT', 'NOOB');
            for (let i = 0; i < chars.length; i++) {
                input += chars[i];
                //console.log(format(input));

                // [ DECLARATION_DELIMITER ]
                if (exec = (Re.DECLARATION_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'declaration delimiter');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
                    } 
                    if (exec = (Re.IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'variable identifier');
                        pushSymbol(exec[1], 'NOOB');
                    }
                    input = '';
                    i--;
                    continue;
                }

                // [ CASTING ]
                if (exec = (Re.CASTING.exec(input))) {
                    checkTrash(exec);
                    switch (exec[1]) {
                        case "MAEK"     : pushToken(exec[1], 'casting operator');               break;
                        case "IS NOW A" : pushToken(exec[1], 'casting assigment delimiter');    break;
                    }
                    i--;
                    continue;
                }

                // [ INITIALIZATION_DELIMITER ]
                if (exec = (Re.INITIALIZATION_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'initialization delimiter');
                    i--;
                    continue;
                }

                // [ CONCATENATION]
                if (exec = (Re.CONCATENATION.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'concatenation operation');
                    i--;
                    continue;
                }

                // [ BOOLEAN OPERATORS ]
                if (exec = (Re.BOOLEAN_OPERATOR.exec(input))) {
                    checkTrash(exec);
                    switch (exec[1]) {
                        case "BOTH OF"      : pushToken(exec[1], 'AND operation');                break;
                        case "EITHER OF"    : pushToken(exec[1], 'OR operation');                 break;
                        case "WON OF"       : pushToken(exec[1], 'XOR operation');                break;
                        case "NOT"          : pushToken(exec[1], 'unary negation operation');     break;
                        case "ALL OF"       : pushToken(exec[1], 'infinite arity AND');           break;
                        case "ANY OF"       : pushToken(exec[1], 'infinite arity OR');            break;
                        case "BOTH SAEM"    : pushToken(exec[1], 'binary equality operation');    break;
                        case "DIFFRINT"     : pushToken(exec[1], 'binary inequality operation');  break;
                    }
                    i--;
                    continue;
                }

                // [ MATHEMATICAL OPERATORS]
                if (exec = (Re.MATH_OPERATOR.exec(input))) {
                    checkTrash(exec);
                    switch (exec[1]) {
                        case "SUM OF"       : pushToken(exec[1], 'addition operation');           break;
                        case "DIFF OF"      : pushToken(exec[1], 'subtraction operation');        break;
                        case "PRODUKT OF"   : pushToken(exec[1], 'multiplication operation');     break;
                        case "QUOSHUNT OF"  : pushToken(exec[1], 'division operation');           break;
                        case "MOD OF"       : pushToken(exec[1], 'modulo operation');             break;
                        case "BIGGR OF"     : pushToken(exec[1], 'maximum operation');            break;
                        case "SMALLR OF"    : pushToken(exec[1], 'minimum operation');            break;
                    }
                    i--;
                    continue;
                }

                // [ INFINITE ARITY DELIMITER ]
                if (exec = (Re.INFINITE_ARITY_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'infinite arity delimiter');
                    i--;
                    continue;
                }

                // [ ASSIGNMENT OPERATOR ]
                if (exec = (Re.ASSIGNMENT_OPERATOR.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'assignment operator');
                    i--;
                    continue;
                }

                // [ INCREMENT OPERATOR ]
                if (exec = (Re.INCREMENT_OPERATOR.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'increment operator');
                    i--;
                    continue;
                }

                // [ DECREMENT OPERATOR ]
                if (exec = (Re.DECREMENT_OPERATOR.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'decrement operator');
                    i--;
                    continue;
                }

                // [ BREAK ]
                if (exec = (Re.BREAK_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'break delimiter');
                    i--;
                    continue;
                }
				
				// [ CONDITIONAL IF DELIMITER ]
				if(exec=(Re.CONDITIONAL_IF_DELIMITER.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'conditional if delimiter');
					i--;
					continue;
				}
				
                // [ CONDITIONAL ELSE IF DELIMITER ]
				if(exec=(Re.CONDITIONAL_ELSE_IF_DELIMITER.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'conditional else if delimiter');
					i--;
					continue;
				}

                // [ CONDITIONAL ELSE DELIMITER ]
				if(exec=(Re.CONDITIONAL_ELSE_DELIMITER.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'conditional else delimiter');
					i--;
					continue;
				}

				// [ CONDITIONAL DELIMITER ]
				if(exec=(Re.CONDITIONAL_DELIMITER_START.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'conditional delimiter');
					i--;
					continue;
				}

				// [ CASE DELIMITER ]
				if(exec=(Re.CASE_DELIMITER.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'case delimiter');
					i--;
					continue;
				}

                // [ DEFAULT_CASE_DELIMITER ]
				if(exec=(Re.DEFAULT_CASE_DELIMITER.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'default case delimiter');
					i--;
					continue;
				}
				
				// [ CONDITONAL DELIMITER END ]
				if(exec=(Re.CONDITIONAL_DELIMITER_END.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'conditional delimiter end');
					i--;
					continue;
				}
				
				// [ SWITCH DELIMITER ]
				if(exec=(Re.SWITCH_DELIMITER.exec(input))){
					checkTrash(exec);
					pushToken(exec[1], 'switch delimiter');
					i--;
					continue;
				}
				
                // [ LOOP DELIMITER START ]
                if (exec = (Re.LOOP_DELIMITER_START.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'loop delimiter start');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
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
                    checkTrash(exec);
                    pushToken(exec[1], 'loop condition');
                    i--;
                    continue;
                }

                // [ LOOP DELIMITER END ]
                if (exec = (Re.LOOP_DELIMITER_END.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'loop delimiter end');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
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
                    checkTrash(exec);
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
                    checkTrash(exec);
                    pushToken(exec[1], 'input delimiter');
                    i--;
                    continue;
                }

                // [ OUTPUT ]
                if (exec = (Re.OUTPUT.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'output delimiter');
                    i--;
                    continue;
                }

                // [ BLOCK COMMENT ]
                if (exec = (Re.BLOCK_COMMENT_DELIMITER_START.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'block comment delimiter');
                    while(!(exec = (Re.BLOCK_COMMENT_DELIMITER_END.exec(input))) && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
                    }
                    i--;
                    if (exec) {
                        pushToken(exec[1], 'block comment');
                        pushToken(exec[2], 'block comment delimiter');
                    }
                    continue;

                }


                // [ LINE COMMENT ]
                if (exec = (Re.LINE_COMMENT_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'line comment delimiter');
                    while (!(exec = (/(.*)\n/).exec(input)) && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
                    }
                    i--;
                    if (exec) {
                        pushToken(exec[1], 'line comment');
                    }
                    continue;
                }

                // [ BOOLEAN ]
                if (exec = (Re.BOOLEAN.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'boolean literal');
                    i--;
                    continue;
                }

                // [ NUMBER FLOAT ]
                if (exec = (Re.NUMBER_START.exec(input))) {
                    while (!/[\s,]/.test(chars[++i]) && i < chars.length) {
                        input += chars[i];
                        //console.log(format(input));
                    }
                    i--;
                    // [ FLOAT ]
                    if (exec = (Re.FLOAT.exec(input))) {
                        checkTrash(exec);
                        pushToken(exec[1], 'floating-point literal');
                        continue;
                    }

                    if (exec = (Re.INTEGER.exec(input))) {
                        checkTrash(exec);
                        pushToken(exec[1], 'integer literal');
                        continue;
                    }
                }

                // [ STRING ]
                if (exec = (Re.STRING_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'string delimiter');
                    while (!(exec = (/(.*)(")[\s,]/.exec(input))) && i < chars.length) {
                        input += chars[++i]; 
                        //console.log(format(input));
                    }
                    i--;
                    if (exec) {
                        pushToken(exec[1], 'string literal');
                        pushToken(exec[2], 'string delimiter');
                    }
                    continue;
                }

                // [ PAREMTER DELIMITER ]
                if (exec = (Re.PARAMETER_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'parameter delimiter');
                    i--;
                    continue;
                }

                // [ FUNCTION CALL ]
                if (exec = (Re.FUNCTION_CALL.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'function call delimiter');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
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
                    checkTrash(exec);
                    pushToken(exec[1], 'return operator');
                    i--;
                    continue;
                }

                // [ FUNCTION DELIMITER START ]
                if (exec = (Re.FUNCTION_DELIMITER_START.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'function delimiter start');
                    i--;
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
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
                if (exec = (Re.FUNCTION_ARGUMENT_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'function argument delimiter');
                    while (!/[\n,]/.test(chars[i])
                            && !/\b(.+)[\s,]/.test(input)
                            && i < chars.length) {
                        input += chars[++i];
                        //console.log(format(input));
                    } 
                    if (exec = (Re.IDENTIFIER.exec(input))) {
                        pushToken(exec[1], 'variable identifier');
                        pushSymbol(exec[1], 'NOOB');
                    }
                    input = '';
                    i--;
                    continue;
                }

                // [ FUNCTION DELIMITER END ]
                if (exec = (Re.FUNCTION_DELIMITER_END.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'function delimiter end');
                    i--;
                    continue;
                }

                // [ CODE DELIMITER START ]
                if (exec = (Re.CODE_DELIMITER_START.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'code delimiter start');
                    i--;
                    continue;
                }

                // [ CODE DELIMITER END ]
                if (exec = (Re.CODE_DELIMITER_END.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'code delimiter end');
                    i--;
                    continue;
                }

                // [ STATEMENT DELIMITER ]
                if (exec = (Re.STATEMENT_DELIMITER.exec(input))) {
                    checkTrash(exec);
                    pushToken(exec[1], 'statement delimiter');
                    continue;
                }
            }



           function pushToken(lexeme, classification) {
                //console.log('Push token: ' + format(lexeme) + ' : ' +format(classification));
                tokens.push({
                    lexeme          : lexeme,
                    classification  : classification
                });
                input = '';
            }

            function pushSymbol(identifier, type) {
                //console.log('Push symbol: '+format(identifier) + ' : ' + format(type));
                symbols.push({
                    identifier  : identifier,
                    type        : type,
                    value       : ''
                });
            }

            function checkTrash(exec) {
                var darest = exec.input.substring(0, exec.input.length-exec[0].length);
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