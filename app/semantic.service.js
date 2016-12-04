(function() {
    'use strict';

    angular
        .module('app')
        .factory('semantic', semantic);

    function semantic() {
        const ERROR = 'ERROR PARSING STRING';
        var printNewline = true;
        var startFlag = null;
        var endFlag = null;
        var startingFlag = null;
        var endingFlag = null;

        return service = {
            analyze: analyze,
            changeType: changeType,
            restart: restart
        };

        function restart(){
            startFlag = null;
            endFlag = null;
        }

        function analyze(line, terminal, symbols, input) {
            
            if (!line.length) return;
           
            else if(line[0].classification === 'code delimiter start' 
                || line[0].classification === 'code delimiter end' 
                || line[0].classification === 'line comment delimiter'){
                return;
            }

            else if (startFlag != null) {

                // Checks if classification is as indicated in startFlag

                if (line[0].classification === startFlag[0]) {
                    
                    // In case of 'OIC'
                    if (line.length == 1) {
                       startFlag = null;
                       return;
                    } 

                    // Retrieves if case literal
                    var result = evaluate(line.slice(1),symbols, terminal);
                    var actualValue = result[0].lexeme;
                    // Case if retrieved is string
                    if (result.length === 3) {
                        actualValue += result[1].lexeme + result[2].lexeme;
                    }
                    // Compares startFlag literal to true literal
                    if (startFlag[1] == actualValue){
                        startFlag = null;
                        return;
                    }
                } 
                else if (line[0].classification === 'default case delimiter' 
                    && startFlag[0] !== 'conditional delimiter end') {                    
                    startFlag = null;
                    return;
                }
                return;
            }

            
            else if (line[0].classification === 'declaration delimiter') {
                if (line.length > 3) { // initialization 
                    for (let symbol of symbols) {
                        if (symbol.identifier === line[1].lexeme) {
                            var result = evaluate(line.slice(3), symbols, terminal);
                            if (result !== ERROR) {
                                symbol.value = result[0].lexeme;
                                symbol.type = changeType(result[0].classification)
                                if (result.length === 3) {
                                    symbol.value += result[1].lexeme + result[2].lexeme;
                                    symbol.type = changeType(result[1].classification);
                                }

                            } else {
                                return ERROR;
                            }
                            break;
                        }
                    }
                }
            }

            else if (line[0].classification === 'input delimiter') {
                for (let symbol of symbols) {
                    if (symbol.identifier === line[1].lexeme) {
                        input.flag = true;
                        input.symbol = symbol.identifier;    
                        setTimeout(function() {
                            $('#userInput').focus();
                        }, 1);          
                        break;
                    }
                }
            }

			else if (line[0].classification === 'output delimiter') {
                var exec = null;
                var string = '';
				var result = evaluate(line.slice(1), symbols, terminal);
                if (result !== ERROR) {
                    for (let token of result) {
                        if (token.classification === 'newline supress')
                            continue;
                        if (exec = (/"(.*)"/.exec(token.lexeme)))
                            string = exec[1] + string;
                        else if (token.lexeme !== '"') {
                            if (token.classification === 'floating-point literal') {
                                token.lexeme = (+token.lexeme).toFixed(2);
                            }
                            string = token.lexeme + string;
                        }
                    }
                    if (!terminal.newline) {
                        terminal.newline = true;
                    }
                    string = string.replace(/:\)/g, '\n');
                    string = string.replace(/:>/g, '\t');
                    string = string.replace(/:o/g, '');
                    string = string.replace(/:"/g, '\"');
                    string = string.replace(/::/g, ':');
                    terminal.line.push(string);
                    // if (printNewline) {
                    //     terminal.line.push(string);
                    // } else { 
                    //     if (!terminal.line.length)
                    //         terminal.line.push(string)
                    //     else
                    //         terminal.line[terminal.line.length-1] += string;
                    //     printNewline = true;
                    // }

                    if (line[line.length-1].classification === 'newline supress') {
                        terminal.newline = false;
                    }
                } else {
                    return ERROR;
                }
			}



			else if (line[0].classification === 'variable identifier'){
				// <var> R <expression>
				if(line.length > 2){
                    if (line[1].classification === 'assignment operator') {
                        for(let symbol of symbols){
                            if (symbol.identifier === line[0].lexeme) {
                                var result = evaluate(line.slice(2), symbols, terminal);
                                if (result !== ERROR) {
                                    symbol.value = result[0].lexeme;
                                    symbol.type = changeType(result[0].classification);
                                    if (result.length === 3) {
                                        symbol.value += result[1].lexeme + result[2].lexeme;
                                        symbol.type = changeType(result[1].classification);
                                    }
                                } else {
                                    return ERROR;
                                }
                                break;
                            }
                        }
                    }
                    else if (line[1].classification === 'casting assignment delimiter') {
                        for (let symbol of symbols) {
                            if (symbol.identifier === line[0].lexeme) {
                                var dataType = line[2];
                                
                                switch (dataType.classification) {
                                    case 'untyped data type':
                                        return ERROR;
                                    case 'string data type':
                                        switch (symbol.type) {
                                            case 'TROOF':
                                            case 'NOOB':
                                                return ERROR;
                                            case 'NUMBR':
                                            case 'NUMBAR':
                                                symbol.value = '"'+symbol.value+'"';
                                                break;
                                        }
                                        symbol.type = 'YARN';
                                        break;
                                    case 'boolean data type':
                                        var value = 'WIN';
                                        switch (symbol.type) {
                                            case 'NOOB':
                                                return ERROR;
                                            case 'YARN':
                                                if (symbol.value.length == 2)
                                                    value = 'FAIL';
                                                break;
                                            case 'NUMBR':
                                            case 'NUMBAR':
                                                if (symbol.value === 0) {
                                                    value = 'FAIL';
                                                }
                                                break;
                                            case 'TROOF':
                                                if (symbol.value === 'FAIL')
                                                    value = 'FAIL';
                                                break;
                                        }
                                        symbol.value = value;
                                        symbol.type = 'TROOF';
                                        break;
                                    case 'integer data type':
                                        var value = symbol.value;
                                        switch (symbol.type) {
                                            case 'NOOB':
                                                return ERROR;
                                            case 'NUMBAR':
                                                value = parseInt(symbol.value);
                                                break;
                                            case 'YARN':
                                                var string = symbol.value.split('"')[1];
                                                if (string && !isNaN(string)) {
                                                    value = parseInt(string);
                                                } else {
                                                    value = 0;
                                                }
                                                break;
                                            case 'TROOF':
                                                if (symbol.value === 'WIN')
                                                    value = 1;
                                                else
                                                    value = 0;
                                        }
                                        symbol.value = value;
                                        symbol.type = 'NUMBR';
                                        break;
                                    case 'floating-point data type':
                                        var value = symbol.value;
                                        switch (symbol.type) {
                                            case 'NOOB':
                                                return ERROR;
                                            case 'NUMBR':
                                                value = parseFloat(symbol.value);
                                                break;
                                            case 'YARN':
                                                var string = symbol.value.split('"')[1];
                                                if (!isNaN(string))
                                                    value = parseFloat(string);
                                                else
                                                    value = 0.0;
                                                break;
                                            case 'TROOF':
                                                if (symbol.value === 'WIN')
                                                    value = 1.0;
                                                else
                                                    value = 0.0;
                                        }
                                        symbol.value = value;
                                        symbol.type = 'NUMBAR';
                                }
                            }
                        }
                    }
				}
                if(line.length === 1){
                    var found = false;
                    for(let symbol of symbols){
                        if(symbol.identifier === line[0].lexeme){
                            symbols[0].value = symbol.value ;
                            symbols[0].type = symbol.type;
                            found = true;
                            break;                          
                        }
                    }
                    if (!found) {
                        return ERROR;
                    }
                }
			}

            else if (line[0].classification === 'switch delimiter'){
                startFlag = ['case delimiter', symbols[0].value];
                endFlag = ['conditional delimiter end', 'break delimiter'];                
            }

            else if (endFlag != null) {
                for (let end of endFlag) {
                    if (end === line[0].classification) {
                        if (end != 'conditional delimiter end') {
                            startFlag = ['conditional delimiter end'];
                        }
                            endFlag = null;
                    }
                }
            }
            else{
                var result = evaluate(line,symbols,terminal);
                if (result != ERROR) {
                    symbols[0].value = result[0].lexeme;
                    symbols[0].type = changeType(result[0].classification);
                    if (result.length === 3) {
                        symbols[0].value += result[1].lexeme + result[2].lexeme;
                        symbols[0].type = changeType(result[1].classification);
                    }
                } else {
                    return ERROR;
                }
            }
        }

        function evaluate(tokens, symbols, terminal) {
            var stack = [];
            for (let i=tokens.length-1; i>=0; i--) {
                switch(tokens[i].classification) {
                    case 'parameter delimiter':
                        break;
                    case 'infinite arity delimiter':
                        break;
                    case 'addition operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = token1.lexeme + token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'subtraction operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = token1.lexeme - token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'multiplication operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = token1.lexeme * token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'division operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = token1.lexeme / token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'modulo operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = token1.lexeme % token2.lexeme;
                        var classification = 'integer literal';
                        if (token1.classification === 'floating-point literal' ||
                        token2.classification === 'floating-point literal') {
                            classification = 'floating-point literal';
                        }
                        console.log({
                            lexeme: lexeme,
                            classification: classification
                        });
                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'maximum operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = (token1.lexeme > token2.lexeme)? token1.lexeme : token2.lexeme;
                        var classification = 'integer literal';
                        if (lexeme % 1 !== 0) classification = 'floating-point literal';

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'minimum operation':
                        var token1 = castToNumber(checkString(stack.pop(), stack));
                        var token2 = castToNumber(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = (token1.lexeme < token2.lexeme)? token1.lexeme : token2.lexeme;
                        var classification = 'integer literal';
                        if (lexeme % 1 !== 0) classification = 'floating-point literal';

                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        });
                        break;
                    case 'binary equality operation':
                        var token1 = checkString(stack.pop(), stack);
                        var token2 = checkString(stack.pop(), stack);
                        
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = 'FAIL';
                        console.log(token1)
                        console.log(token2);
                        if (token1.lexeme == token2.lexeme 
                        && token1.classification === token2.classification) 
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'binary inequality operation':
                        var token1 = checkString(stack.pop(), stack);
                        var token2 = checkString(stack.pop(), stack);
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = 'WIN';
                        if (token1.lexeme == token2.lexeme 
                        && token1.classification === token2.classification)
                            lexeme = 'FAIL';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'AND operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        var token2 = castToBool(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = 'WIN';
                        
                        if (token1.lexeme !== token2.lexeme)
                            lexeme = 'FAIL';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'OR operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        var token2 = castToBool(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = 'FAIL';
                        
                        if (token1.lexeme === 'WIN')
                            lexeme = 'WIN';
                        if (token2.lexeme === 'WIN')
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'XOR operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        var token2 = castToBool(checkString(stack.pop(), stack));
                        if (!token1 || !token2) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        castFromNil(token2, terminal);
                        var lexeme = 'FAIL';
                        
                        if (token1.lexeme === 'WIN' && token2.lexeme === 'FAIL')
                            lexeme = 'WIN';
                        if (token2.lexeme === 'WIN' && token1.lexeme === 'FAIL')
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'immediate casting operation':
                        var token = checkString(stack.pop(), stack);                    
                        var dataType = checkString(stack.pop(), stack);
                        castFromNil(token, terminal);
                        switch (dataType.classification) {
                            case 'untyped data type':
                                return ERROR;
                            case 'string data type':
                                var lexeme = token.lexeme.toString();
                                switch (token.classification) {
                                    case 'boolean literal':
                                        return ERROR;
                                    case 'integer literal':
                                    case 'floating-point literal':
                                        lexeme = '"'+lexeme+'"';
                                        break;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'string literal'
                                });
                                break;
                            
                            case 'boolean data type':
                                var lexeme = 'WIN';
                                switch (token.classification) {
                                    case 'string literal':
                                        if (token.lexeme.length == 2)
                                            lexeme = 'FAIL';
                                        break;
                                    case 'integer literal':
                                    case 'floating-point literal':
                                        if (token.lexeme === 0)
                                            lexeme = 'FAIL';
                                        break;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'boolean literal'
                                });
                                break;

                            case 'integer data type':
                                var lexeme = token.lexeme;
                                switch (token.classification) {
                                    case 'floating-point literal':
                                        lexeme = parseInt(token.lexeme);
                                        break;
                                    case 'string literal':
                                        var string = token.lexeme.split('"')[1];
                                        if (string && !isNaN(string))
                                            lexeme = parseInt(string);
                                        else
                                            lexeme = 0;
                                        break;
                                    case 'boolean literal':
                                        if (token.lexeme === 'WIN')
                                            lexeme = 1;
                                        else
                                            lexeme = 0;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'integer literal'
                                });
                                break;
                            case 'floating-point data type':
                                var lexeme = token.lexeme;
                                switch (token.classification) {
                                    case 'string literal':
                                        var string = token.lexeme.split('"')[1];
                                        if (!isNaN(string))
                                            lexeme = parseFloat(string);
                                        else
                                            lexeme = 0.0;
                                        break;
                                    case 'boolean literal':
                                        if (token.lexeme === 'WIN')
                                            lexeme = 1.0;
                                        else
                                            lexeme = 0.0;
                                }
                                stack.push({
                                    lexeme: lexeme,
                                    classification: 'floating-point literal'
                                });
                                break;
                            
                        }

                        break;
                    case 'unary negation operation':
                        var token1 = castToBool(checkString(stack.pop(), stack));
                        if (!token1) {
                            return ERROR;
                        }
                        castFromNil(token1, terminal);
                        var lexeme = 'FAIL';
                        if (token1.lexeme === 'FAIL')
                            lexeme = 'WIN';
                        var classification = 'boolean literal';

                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'concatenation operation':
                        var exec = null;
                        var lexeme = '';
                        var classification = 'string literal';
                        while (stack.length) {
                            var string = castToString(checkString(stack.pop(), stack));
                            if (!string) return ERROR;
                            if (exec = (/"(.*)"/.exec(string.lexeme))) {
                                lexeme += exec[1];
                            } else {
                                lexeme += string.lexeme;
                            }
                        }
                        lexeme = '"' + lexeme + '"';
                        stack.push({
                            lexeme: lexeme, 
                            classification: classification
                        });
                        break;
                    case 'variable identifier':
                        for (let symbol of symbols) {
                            if (symbol.identifier === tokens[i].lexeme) {
                                stack.push(getToken(symbol));
                                break;
                            }
                        }
                        break;
                    case 'infinite arity AND':
                        var lexeme = 'WIN';
                        var classification = 'boolean literal';
                        while (stack.length) {
                            var token = castToBool(checkString(stack.pop(), stack));
                            if (!token) {
                                return ERROR;
                            }
                            if (token.lexeme === 'FAIL'){
                                lexeme = 'FAIL';
                            }
                        }
                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        })
                        break;
                    case 'infinite arity OR':
                        var lexeme = 'FAIL';
                        var classification = 'boolean literal';
                        while (stack.length) {
                            var token = castToBool(checkString(stack.pop(), stack));
                            if (!token) {
                                return ERROR;
                            }
                            if (token.lexeme === 'WIN'){
                                lexeme = 'WIN';
                            }
                        }
                        stack.push({
                            lexeme: lexeme,
                            classification: classification
                        })
                        break;
                    default:
                        stack.push(tokens[i]);
                }
            } 
            return stack;
        }

        function getToken(symbol) {
            var lexeme = symbol.value , classification;
            switch (symbol.type) {
                case 'YARN':
                    classification =  'string literal';
                    break;
                case 'NUMBR':
                    classification =  'integer literal';
                    break;
                case 'NUMBAR': 
                    classification =  'floating-point literal';
                    break;
                case 'TROOF': 
                    classification =  'boolean literal';
                    break;
            }
            return {
                lexeme: lexeme,
                classification: classification
            };

        }

        function changeType(classification) {
            switch (classification) {
                case 'string literal':
                    return 'YARN';
                case 'integer literal':
                    return 'NUMBR';
                case 'floating-point literal':
                    return 'NUMBAR';
                case 'boolean literal':
                    return 'TROOF';
                default:
                    return 'NOOB';
            }
        }

        function castToString(token) {
            var lexeme = token.lexeme.toString();
            var classification = 'string literal';
            if (token.classification === 'NOOB')
                return false;
            return {
                lexeme: lexeme,
                classification: classification
            };
        }

        function castToBool(token) {
            var lexeme = 'WIN';
            var classification = 'boolean literal';

            if (token.classification !== 'boolean literal')
                return false;
            
            if (token.lexeme === 'FAIL')
                lexeme = 'FAIL';

            return {
                lexeme: lexeme,
                classification: classification
            };
        }

        
        function castIT(symbol){
            var trulalu = 'WIN';
            var falselalu = 'FAIL';
            var type = 'TROOF'

            if (symbol.type === 'NOOB')
                return false;

            if(symbol.type === 'NUMBR' || symbol.type === 'NUMBAR'){
                if(symbol.value == 0)
                    symbol.value=falselalu;
                else
                    symbol.value= trulalu;
            }
            else if(symbol.type === 'YARN'){
                var str = symbol.value;
                if(str.replace(/"/g,"") == ""){
                    symbol.value=falselalu;
                }
                else
                    symbol.value=trulalu;
            }
            symbol.type=type;
        }

        function castToNumber(token) {
            var lexeme = +token.lexeme;
            var classification = 'integer literal';

            if (token.classification === 'boolean literal' 
            || token.classification === 'NOOB')
                return false;
            
            if (token.classification === 'string literal') {
                var splitted = token.lexeme.split('"');
                if (!isNaN(splitted[1])) {
                    lexeme = +splitted[1];
                } else {
                    return false;
                }
            }
            
            if (token.classification === 'floating-point literal')
                classification = 'floating-point literal';

            return {
                lexeme: lexeme,
                classification: classification
            };
        }

        function checkString(token, stack) {
            var lexeme = token.lexeme;
            var classification = token.classification;
            if (token.lexeme === '"') {
                lexeme = lexeme + stack.pop().lexeme + stack.pop().lexeme;
                classification = 'string literal';
            }
            return {
                lexeme: lexeme,
                classification: classification
            };
        }

        function castFromNil(token, terminal) {
            if (token && token.classification === 'NOOB') {
                terminal.line.push('Cannot implicitly cast from nil');
            }
        }

    }
})();
