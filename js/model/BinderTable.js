/**
 * Created by @VanSoftware on 12/01/2019.
 */

const COLUMN_TYPE_INTEGER = "integer";
const COLUMN_TYPE_STRING = "string";


class BinderTable{
    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }
    get columns() {
        return this._columns;
    }

    set columns(value) {
        this._columns = value;
    }
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
    get ID() {
        return this._ID;
    }

    set ID(value) {
        this._ID = value;
    }


    constructor(object){
        if(isEmpty(object)) { console.error("Empty object when creating Table"); return; }

        let self = this;
        this.ID = ClassHelper.isDataSetInObject("ID",object) ? ClassHelper.getValue(object, "ID") : new Date().getUTCMilliseconds();
        this.name =  ClassHelper.getValue(object, "name");
        this.columns = ClassHelper.parseArrayElementWithClass( ClassHelper.getArray(object,"columns"),function(element,position){
            return new BinderTableColumn(element);
        });
        this.data = ClassHelper.parseArrayElementWithClass(ClassHelper.getArray(object,"data"),function(row,position){
            return new BinderTableRow(row,self.columns);
        });

    }


    static isTableAvailable(table_name, array = G_Tables){
        for(let i = 0; i < array.length; i++) if(array[i].name === table_name) return true;
        return false;
    }

    static isColumnInTableAvailable(table_name, table_column, array = G_Tables){
        if(!this.isTableAvailable(table_name,array)) return false;
        let table = null;
        for(let i = 0; i < array.length; i++) if(array[i].name === table_name) {table = array[i]; break;}
        if(table === null) return;

        for(let i = 0; i < table.columns.length; i++){
            if(table.columns[i].name === table_column) return true;
        }

        return false;

    }

    static getTableByName(table_name, array = G_Tables){
        for(let i = 0; i < array.length; i++) if(array[i].name === table_name) {return array[i];}
        return null;
    }
    static getColumnInTableByName(table_name, column_name, array = G_Tables){
        let table = this.getTableByName(table_name,array);
        for(let i = 0; i < table.columns.length ;i++){
            if(table.columns[i].name === column_name)
                return table.columns[i];
        }
        return null;
    }

    static init(array = G_Tables){
        return new Promise((resolve, reject) => {


            $.getJSON("data/tables.json", function(tables) {
                for(let i =  0; i < tables.length; i++) array.push(new BinderTable(tables[i]));
                resolve();

            });



        });
    }

}

class BinderTableColumn{
    get info() {
        return this._info;
    }

    set info(value) {
        this._info = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }
    constructor(object){
        if(isEmpty(object)) {return; }
        this.name =  ClassHelper.getValue(object, "name");
        this.type = ClassHelper.getValue(object,"type");
        this.info = ClassHelper.sanitize(ClassHelper.getValue(object,"info"),"");

    }
}

class BinderTableRow{
    /**
     *
     * @returns {Array.<BinderTableCell>}
     */
    get cells() {
        return this._cells;
    }

    /**
     *
     * @param {Array.<BinderTableCell>} value
     */
    set cells(value) {
        this._cells = value;
    }

    /**
     *
     * @param {Object} row
     * @param {Array.<BinderTableColumn>} columns
     */

    constructor(row, columns){
        if(isEmpty(row)|| isEmpty(columns)) { return; }

        this.cells = [];

        for(let i =0; i < columns.length; i++){
            let column = columns[i];


            let cell = new BinderTableCell();
            cell.column = column;


            switch (column.type){
                case COLUMN_TYPE_INTEGER :
                    cell.value = ClassHelper.isDataSetInObject(column.name,row) ? parseInt(ClassHelper.getValue(row, column.name)) : null;
                    break;
                case COLUMN_TYPE_STRING :
                    cell.value = ClassHelper.isDataSetInObject(column.name,row) ? ClassHelper.getValue(row, column.name) : null;
                    break;
                default: break;
            }

            this.cells.push(cell);

        }





    }
}

class BinderTableCell{
    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }
    get column() {
        return this._column;
    }

    set column(value) {
        this._column = value;
    }

    constructor(object){
        if(object === null) return;
        this.column =  new BinderTableColumn(ClassHelper.getValue(object, "column"));
        this.value = ClassHelper.getValue(object, "value");

    }
}









