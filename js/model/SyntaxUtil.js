/**
 * Created by @VanSoftware on 13/01/2019.
 */




class SyntaxUtil{
    /**
     *
     * @param {String} string
     * @param {int} startingPosition
     * @returns {Object|null}
     */
    static getNextValidChar(string, startingPosition){
        if(startingPosition >= string.length - 1 || startingPosition < 0) return null;
        for(let i = startingPosition; i < string.length; i++){
            if(string[i] === " ") continue;
            return {
                char: string[i],
                position : i,
            };
        }

        return null;
    }
    static getPreviousValidChar(string, endingPosition){
        if(endingPosition >= string.length - 1 || endingPosition < 0) return null;
        for(let i = endingPosition; i >= 0; i--){
            if(string[i] === " ") continue;
            return {
                char: string[i],
                position : i,
            };
        }

        return null;
    }

    static indexOfNextSymbol(string, start = 0, symbols = [" ",",",".","(",")"] ){
        for(let i = start; i < string.length; i++){
            if(symbols.includes(string[i])) return i;
        }
        return -1;
    }
    static isSymbol(string){
        return [" ",",",".","(",")"].includes(string);
    }




    /**
     *
     * @param {String} elementName
     * @param array
     */
    static findSyntaxElementPosition(elementName, array = G_Syntax){
        for(let i = 0; i <array.length; i++ ){
            if(G_Syntax[i].name === elementName)
                return i;
        }
        return -1;
    }









    static countParametersBetweenBrackets(start, tokens){

        let sets = 0;
        let params = 0;

        for(let i = start; i < tokens.length; i++){
            if(tokens[i] === "(") sets++;
            else if(tokens[i] === ")") sets--;
            else {
                if (sets === 1 && tokens[i] === ",") {
                    params += (params === 0) ? 2 : 1;
                }
            }
        }

        return params;



    }


    static tokenizeCommand(command) {
        command = String(command);
        try {
            for (let i = 0; i < command.length; i++) {
                if ([",", "(", ")"].includes(command[i])) {
                    command = [command.slice(0, i), " ", command.slice(i, i + 1), " ", command.slice(i + 1)].join('');
                    i = i + 2;
                }
            }
            let tokens = command.split(/(\s+)/).filter(function (e) {
                return e.trim().length > 0;
            });
            return tokens !== null && tokens.length > 0 ? tokens : null;
        }
        catch (err){
            console.error("Tokenizer: "+ err.toString());
        }
    }


    static getElementCountArray(array){
        let count = 0;
        for(let i = 0; i < array.length; i++) if(!isEmpty(array[i]) && !isEmpty(array[i].type) && array[i].type === "element") count++;
        return count;
    }


    static isProtectedKeyword(string){
        return G_ProtectedKeywords.includes(string);
    }

    static isConstant(string){
        for(let key in G_Constants){
            if(G_Constants.hasOwnProperty(key))
                if(key === string) return true;
        }
        return false;
    }

}