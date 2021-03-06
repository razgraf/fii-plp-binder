/**
 * Created by @VanSoftware on 13/01/2019.
 */


let source_syntax = {
    "instruction": {
        "syntax" : ["\"do\" action domain"],
        "return" : ["integer","string","array"],
    },
    "action" : {
        "syntax" : ["@"], //@ is a flag --> look for a typed parameter (such as the name of the action/action)
        "return" : ["string"]
    },
    "domain" : {
        "syntax" : [
            "\"between\" \"(\" columns \")\"",
            "\"on\" column ",
        ],
        "return" : ["integer","string","array"]
    },
    "columns" : {
        "syntax" : [
            "column \",\" column",
            "column \",\" column \",\" column",
            "column \",\" column \",\" column \",\" column"
        ],
        "return" : ["matrix"]
    },
    "column" : {
        "syntax" : [
            "table_column",
            "call", //col_action(value, col_name) --> max(10000, price) or ceil_multiplier(value,frequency)
            "constant",
            "\"(\" instruction \")\" "
        ],
        "return" : ["array","const"]
    },
    "table_column" : {
        "syntax" : [ "@\".\"@"], //table.column -->  @1 = table, @2 = column
        "return" : ["string"]
    },
    "constant" : {
        "syntax" : ["@"], //@ is a flag --> look for a previously declared constant
        "return" : ["string","int"]
    },
    "call" : {
        "syntax" : ["@\"(\" @ \",\" @ \")\""], //@ is a flag --> look for a previously declared constant
        "return" : ["array"]
    }
};


class BinderSyntax{


    constructor(){

    }


    static init(array = G_Syntax){

        let self = this;

        return new Promise((resolve, reject) => {
            $.getJSON("data/syntax.json", function(S) {

                for (let key in S) {
                    if (S.hasOwnProperty(key)) {
                        array.push(new BinderSyntaxElement(S[key],key));
                    }
                }

                self.updateSyntaxElementLink();

                resolve();

            });

        });







    }


    static updateSyntaxElementLink(array = G_Syntax){
        for(let i = 0; i < array.length; i++){
            /**
             * Now that we have every syntax case, we can start linking the calls from inside the syntax with the position of that inner syntax
             * This way we can build a recursive analyzer for each case
             */
            if(array[i].objects !== null && array[i].objects.length > 0 )
                for(let j = 0; j < array[i].objects.length; j++ ){
                    if( array[i].objects[j].type === "element"){
                        let link = SyntaxUtil.findSyntaxElementPosition(array[i].objects[j].value);
                        if(link !== -1) array[i].objects[j].link = link;
                        else throw new Error("Syntax element not defined: "+array[i].objects[j].value);
                    }

                }
        }
    }
}



class BinderSyntaxElement{
    get sets() {
        return this._sets;
    }

    set sets(value) {
        this._sets = value;
    }
    get return_type() {
        return this._return_type;
    }

    set return_type(value) {
        this._return_type = value;
    }

    get syntax() {
        return this._syntax;
    }

    set syntax(value) {
        this._syntax = value;
    }
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get objects() {
        return this._objects;
    }

    set objects(value) {
        this._objects = value;
    }

    constructor(object, name){
        if(object === null || name === null) return;
        let self = this;

        this.name = name;
        this.objects = [];
        this.syntax = ClassHelper.getArray(object, "syntax");
        this.return_type = ClassHelper.getArray(object, "return");
        this.sets = this.syntax.length;

        for(let i = 0; i < this.syntax.length; i++){
            /**
             * Take each line of the syntax and parse it //TODO don't forget to give it an importance based on order
             */
            try {
                this.parseSyntaxCase(this.syntax[i],i);
            }
            catch (error){
                console.error(error);
            }
        }
    }

    /**
     *
     * @param {String} string
     * @param {int} s_index
     */
    parseSyntaxCase(string,s_index){



        string = String(string);


        for(let i = 0; i < string.length; i++){

            if(string[i] === " ") {continue;}
            else if(string[i] === "\""){

                let startQuote = i;
                let endQuote = (string.substring(startQuote+1)).indexOf("\"")  + (startQuote+1);

                if(endQuote === -1) {
                    throw new Error("End quote not found after position "+i+" in syntax: "+ string);
                }

                let keyword = string.substring(startQuote+1, endQuote);
                i = endQuote;


                if([".","(",")",","].includes(keyword)) {
                    this.objects.push({
                        s_index: s_index,
                        type: "punctuation",
                        value: keyword
                    });
                }
                else {
                    this.objects.push({
                        s_index: s_index,
                        type: "keyword",
                        value: keyword
                    });
                    let pNew = true; for(let pi = 0; pi < G_ProtectedKeywords.length; pi++)if(G_ProtectedKeywords[pi] === keyword) pNew = false; if(pNew) G_ProtectedKeywords.push(keyword);
                }
            }
            else if(string[i] === "@"){
                this.objects.push({
                    s_index : s_index ,
                    type : "variable",
                    value : string[i]
                });
            }
            else {
                let start = i;
                let end = SyntaxUtil.indexOfNextSymbol(string,i+1);

                if(end === -1) end = string.length;  //we've reached the end of the road
                let element = string.substring(start, end);

                this.objects.push({
                    s_index : s_index,
                    type : "element",
                    value : element
                });

                i = end;

            }
        }


    }


}