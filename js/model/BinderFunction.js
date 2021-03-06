/**
 * Created by @VanSoftware on 14/01/2019.
 */



const G_Functions = [
    {
        name: "multiplier_floor",
        info : "[array] This function will return a the floor-ed multiplier of the *column items* related to a certain *value*. For example, multiplier_floor(23, [12]) would return 1"
    },
    {
        name: "multiplier_ceil",
        info:  "[array] This function will return a the ceil-ed multiplier of the *column items* related to a certain *value*. For example, multiplier_floor(23, [12]) would return 2"
    },
    {
        name: "max",
        info : "[array] This function will return the max value between *column item* and the given *value*"
    },
    {
        name: "min",
        info : "[array] This function will return the min value between *column item* and the given *value*"
    }
];



class BinderFunction{



    static callFunction(function_name, column, value){

        switch (function_name){
            case "multiplier_floor" : return this.multiplier_floor(column,value);
            case "multiplier_ceil" : return this.multiplier_ceil(column,value);
            case "max" : return this.max(column,value);
            case "min" : return this.min(column,value);
            default: throw new Error("Function behaviour was not declared");
        }
    }


    static getFunction(function_name){
        switch (function_name){
            case "multiplier_floor" : return this.multiplier_floor;
            case "multiplier_ceil" : return this.multiplier_ceil;
            case "max" : return this.max;
            case "min" : return this.min;
            default: return null;
        }
    }

    static isFunctionDeclared(function_name){
        for(let i = 0; i < G_Functions.length; i++){
            if(G_Functions[i].name === function_name) return true;
        }
        return false;
    }


    static max(column, value ){

        for(let i = 0; i < column.length; i++){
            column[i] =  Math.max(column,value);
        }
        return column;

    }

    static min(column, value ){

        for(let i = 0; i < column.length; i++){
            column[i] =  Math.min(column,value);
        }
        return column;
    }



    static multiplier_ceil(column, value ){

        for(let i = 0; i < column.length; i++){
             column[i] =  value % column[i] === 0 ? Math.floor(value / column[i]) : Math.floor(value / column[i]) + 1;
        }
        return column;
    }

    static multiplier_floor(column, value){

        for(let i = 0; i < column.length; i++){
            column[i] =  value % column[i] === 0 ? Math.floor(value / column[i]) : Math.floor(value / column[i]) - 1;
        }
        return column;
    }




}