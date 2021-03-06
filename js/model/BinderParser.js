/**
 * Created by @VanSoftware on 13/01/2019.
 */


class BinderParser{

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
    get stack() {
        return this._stack;
    }

    set stack(value) {
        this._stack = value;
    }
    get pathFound() {
        return this._pathFound;
    }

    set pathFound(value) {
        this._pathFound = value;
    }
    get limit() {
        return this._limit;
    }

    set limit(value) {
        this._limit = value;
    }
    get i_token() {
        return this._i_token;
    }

    set i_token(value) {
        this._i_token = value;
    }
    get i_index() {
        return this._i_index;
    }

    set i_index(value) {
        this._i_index = value;
    }
    get tokens() {
        return this._tokens;
    }

    set tokens(value) {
        this._tokens = value;
    }
    get command() {
        return this._command;
    }

    set command(value) {
        this._command = value;
    }
    get tree() {
        return this._tree;
    }

    set tree(value) {
        this._tree = value;
    }

    constructor(command = null){
        if(command === null) return;

        this.i_token = 0;
        this.i_index = -1;

        this.pathFound = false;
        this.stack = [];


        this.tree = [];
        this.command = command;
        this.tokens = SyntaxUtil.tokenizeCommand(command);
        this.limit = 100; //fail-safe



        if(this.tokens !== null && this.tokens.length > 0) {


            try{
                this.lowLevelCheck();
                this.generateAST(this.tree);
                console.log(this.tree);


                this.highLevelCheck(this.tree);

                this.compute();

                console.log("%c Success: " + "Command parsed successfully: "+this.command, "color: green; font-weight:600");
                console.log("%c Final Value: "+this.value, "color: green; font-weight:600")
            }
            catch (error){
                console.error("Error: This command could not be checked and parsed: "+"%c"+this.command, "font-weight:600");
                console.error(error.toString());

                throw error;
            }



        }




    }


    lowLevelCheck(){

        if(this.tokens === null || this.tokens.length < 2) throw new Error("There aren't enough elements in the command.");
        if(this.tokens[0] !== "do") throw new Error("Any command should start with the keyword \"do\" over an \"on\" domain, so it returns a single value.");
       // if(this.tokens.length > 2 && this.tokens[2] !== "on") throw new Error("Any command should start with the keyword \"do\" over an \"on\" domain, so it returns a single value.");

    }

    highLevelCheck(node){

        if(node.type === "program") {
            if(isEmpty(node.domain) || node.domain.length !== 1) throw new Error("Program domain should be a single-valued.");
            this.highLevelCheck(node.domain[0]);
        }
        else if(node.type === "on"){
            if(isEmpty(node.domain) || node.domain.length !== node.domain_count || node.domain.length !== 1) throw new Error("\"On\" was declared wrong.");
            if(node.domain[0].type !== "column")  if(!node.closed) throw new Error("\"On\" is using a complex statement, but it is missing its closing bracket.");
            this.highLevelCheck(node.domain[0]);
        }
        else if(node.type === "between"){
            if(isEmpty(node.domain) || node.domain.length !== node.domain_count || node.domain.length < 2) throw new Error("\"Between\" was declared wrong. It needs to have at least 2 columns.");
            if(!node.closed) throw new Error("\"On\"  is missing its closing bracket.");
            for(let i = 0; i < node.domain.length; i++){
                this.highLevelCheck(node.domain[i]);
            }
        }
        else if(node.type === "column"){
            if(isEmpty(node.domain) || node.domain.length === 0) {
                node.col_type = (node.value.indexOf(".") === -1) ? "constant" : "table_column"
            }
            else if(node.domain.length > 0){
                node.col_type = "call";
                for(let i = 0; i < node.domain.length; i++){
                    this.highLevelCheck(node.domain[i]);
                }
            }
        }
        else throw new Error("Unknown node: "+ JSON.stringify(node));

    }




    compute(){
        let node = this.tree.domain[0];
        if(node.type === "on")  this.value  = this.computeOn(node);
        else if(node.type === "between")  {
            this.value  = this.computeBetween(node);
            BinderAction.callAction("enum", this.value);
        }
        else throw new Error("Unknown node encountered in compute().");
    }

    computeOn(node){

        if(node.domain[0].type === "column"){
            if(node.domain[0].col_type === "constant"){
                if(!SyntaxUtil.isConstant(node.domain[0].value)) throw new Error("Use of undeclared constant: "+node.domain[0].value);
                else  throw new Error("Sum needs to be done on a table column.");
            }
            else if(node.domain[0].col_type === "table_column"){
                let values = this.extractArrayFromTableColumn(node.domain[0].value, node);
                return BinderAction.callAction(node.action, values);
            }
            else if (node.domain[0].col_type === "call"){

                let values = this.extractCallResult(node, 0);
                return  BinderAction.callAction(node.action, values);

            }
        }
        else if (node.domain[0].type === "between"){
            let values = this.computeBetween(node.domain[0]);
            return BinderAction.callAction(node.action, values);
        }
    }

    computeBetween(node){
        let matrix = [];
        let maxSize = 1;
        let result = [];
        /**
         * As some tables might not have equal sizes, we find the biggest one and we'll add 0 values to the others
         */

        for(let i = 0; i < node.domain.length; i++) { if (node.domain[i].col_type === "table_column") { let values = this.extractArrayFromTableColumn(node.domain[i].value, node); if(maxSize < values.length) maxSize = values.length; } }
        if(maxSize === 0) maxSize = 1;

        for(let i = 0; i < node.domain.length; i++){
            if(node.domain[i].col_type === "constant"){
                if(!SyntaxUtil.isConstant(node.domain[i].value)) throw new Error("Undeclared constant used in function call");
                let column = []; for(let r = 0; r < maxSize; r++) column.push(G_Constants[node.domain[i].value]);
                matrix.push(column);
            }
            else if(node.domain[i].col_type === "table_column"){
                let column = this.extractArrayFromTableColumn(node.domain[i].value, node);
                if(column.length < maxSize) for(let extra = column.length; extra < maxSize; extra++) column.push(0);
                matrix.push(column);
            }
            else if (node.domain[i].col_type === "call"){
                let column = this.extractCallResult(node, i);
                if(column.length < maxSize) for(let extra = column.length; extra < maxSize; extra++) column.push(0);
                matrix.push(column);
            }
            else if (node.domain[i].type === "on"){
                let value = this.computeOn(node.domain[i]);
                let column = []; for(let r = 0; r < maxSize; r++) column.push(value);
                matrix.push(column);
            }
        }

        console.log(matrix);
        let reversed = [];
        for(let j = 0; j < matrix[0].length; j++){
            reversed.push([]);
            for(let i = 0; i < matrix.length; i++) {
                    reversed[reversed.length - 1].push(matrix[i][j]);
                }
        }


        for(let i = 0; i < reversed.length; i++){
            result.push(BinderAction.callAction(node.action, reversed[i]));
        }

        return result;

    }






    generateAST(parent){
        if(--this.limit < 0) return; //fail-safe to break any infinite loop

        /**
         * If the tree is null, than we can start to set it up
         */

        if(this.tree === null || this.tree.length === 0) {
            this.tree = {
                type: "program",
                ID: ++this.i_index,
                domain: []
            };

            this.i_token = 0;
            this.limit = 100;


            this.generateAST(this.tree);



        }

        /**
         * If the tree is all set up and we still have tokens to read, we start the 'show'
         */


        if(this.i_token < this.tokens.length){

            if(this.tokens[this.i_token] === "do"){
                if(this.tokens[this.i_token+2] === "on"){
                    let action = this.tokens[this.i_token+1];
                    parent.domain.push(
                        {
                            type : "on",
                            ID: ++this.i_index,
                            action : action,
                            domain_count : 1, //expected 1 array
                            domain: []
                        }
                    );
                    this.i_token+= !SyntaxUtil.isProtectedKeyword(this.tokens[this.i_token + 3]) && ! [",","(",")","."].includes(this.tokens[this.i_token + 3]) ? 3 : 4; //go over do, action, on and (
                    this.generateAST(parent.domain[parent.domain.length - 1]);
                }
                else if (this.tokens[this.i_token+2] === "between"){
                    let action = this.tokens[this.i_token+1];
                    parent.domain.push(
                        {
                            type : "between",
                            ID: ++this.i_index,
                            action : action,
                            domain_count : SyntaxUtil.countParametersBetweenBrackets(this.i_token+3,this.tokens),
                            domain: [] //expected *domain_count* arrays
                        }
                    );
                    this.i_token+=4; //go over do, action, between and (
                   // for(let pi = 0; pi < parent.domain[0].domain_count; pi++){
                        this.generateAST(parent.domain[0]);
                   // }
                }
            }
            else if(this.tokens[this.i_token] === ")"){
                if(parent === null) throw new Error("Closing bracket does not have a scope at position "+this.i_token+".");
                parent.closed = this.i_token;
                this.i_token++;
                let grandparent = this.findParent(parent.ID);
                if(grandparent === null) {
                    throw new Error("Parent not found.");
                }
                this.generateAST(grandparent);
            }
            else if(this.tokens[this.i_token] === ","){
                this.i_token++;
                this.generateAST(parent);
            }
            else if(this.tokens[this.i_token] === "("){
                this.i_token++;
                if(this.tokens[this.i_token] === "do") this.generateAST(parent);
                else  this.generateAST(parent.domain[parent.domain.length - 1]);
            }
            else if(![",",".","(",")"].includes(this.tokens[this.i_token])){
                //column

                parent.domain.push(
                    {
                        type : "column",
                        ID: ++ this.i_index,
                        value: this.tokens[this.i_token],
                        domain : []
                    }
                );

                this.i_token+=1;

                this.generateAST(parent);

            }


        }


    }
    findParent(childID){
        let parent = {node : null}; //use a trick --> objects are passed by "reference"
        this.findParentRec(childID, this.tree, parent);
        return parent.node;
    }
    findParentRec(childID, node, parent){
        if(!isEmpty(node) && !isEmpty(node.domain) && node.domain.length > 0)
            for(let i = 0; i < node.domain.length && parent.node === null;i++){
                if(node.domain[i].ID === childID) { parent.node = node; } //FOUND
                else this.findParentRec(childID, node.domain[i],parent);
            }
    }



    extractCallResult(node, i){
        let self = this;

        let columns = [];
        for(let e = 0; e < node.domain[i].domain.length; e++){
            if(node.domain[i].domain[e].col_type === "column") columns = [node.domain[i].domain[e]].concat(columns);
            else columns.push(node.domain[i].domain[e]);
        }
        if(columns.length !== 2) throw new Error("A call needs to be done with 2 elements.");


        if(!SyntaxUtil.isConstant(columns[0].value)) throw new Error("Undeclared constant used in function call");

        let values = this.extractArrayFromTableColumn(columns[1].value, node);
        values = BinderFunction.callFunction(node.domain[i].value, values, G_Constants[columns[0].value]);
        return values;
    }






    extractArrayFromTableColumn(node_value, node ){
        let self = this;

        let name_tokens = node_value.split(".");
        if(name_tokens.length !==  2) throw new Error("Table column needs to be declared as table.column: "+node.domain[0].value);
        if(!BinderTable.isColumnInTableAvailable(name_tokens[0],name_tokens[1]))  throw new Error("Use of undeclared table or column: "+node.domain[0].value);

        let table = BinderTable.getTableByName(name_tokens[0]);
        let column = BinderTable.getColumnInTableByName(name_tokens[0],name_tokens[1]);


        let values = [];

        for(let r = 0; r < table.data.length; r++) {
            for (let c = 0; c < table.data[r].cells.length; c++) {
                if(table.data[r].cells[c].column.name === column.name)  values.push(table.data[r].cells[c].value);
            }
        }

        return values;
    }


}