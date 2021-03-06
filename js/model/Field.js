/**
 * Created by @VanSoftware on 18/06/2018.
 */

function STANDARD_FIELDS(){
    let o = {};
    //o[FIELD_ID]  =  {icon: "title", label : "First Name"};

    return o;
}



class Field{

    /**
     *
     * @returns {Array}
     * children will store inherited {Field}s which will be children of the parent {Field}
     */
    get children() {
        return this._children;
    }
    /**
     *
     * @param {Array} value
     *
     */
    set children(value) {
        this._children = value;
    }

    get primary() {
        return this._primary;
    }

    set primary(value) {
        this._primary = value;
    }
    get el() {
        return this._el;
    }

    set el(value) {
        this._el = value;
    }
    constructor(elID, identifier, printInParent = null, label = null){
        if(printInParent !== null && printInParent.length > 0) printInParent.append(this.standardPrint(identifier, elID,label));
        this.el = $("#"+elID);
        this.primary = null;
        this.children = [];


        return this;
    }

    standardPrint(identifier, contentID, label = null){

        let EF = STANDARD_FIELDS();

        label = EF.hasOwnProperty(identifier) && EF[identifier].hasOwnProperty("label")  ? EF[identifier].label : ((label === null) ?  identifier : label);
        let icon = EF.hasOwnProperty(identifier) && EF[identifier].hasOwnProperty("icon")  ? EF[identifier].icon : "short_text";
        return '<div class="contentContainer" data-id="'+identifier+'"><i class="material-icons" style="display: none">'+icon+'</i><p class="contentLabel">'+label+'</p><span id="'+contentID+'"></span></div>';
    }


}

Field.prototype.setVal = function(value, setPrimary = true, sanitize = false){
    if(sanitize !== false){ value = (value !== null && value !== undefined) ? value : ((typeof sanitize === "string" || typeof sanitize === "number") ? sanitize :  "-") }
    if(setPrimary) this.primary = value;
    this.el.val(value);
    return this;
};

Field.prototype.setText = function(value, setPrimary = true, sanitize = false){
    if(sanitize !== false){ value = (value !== null && value !== undefined) ? value : ((typeof sanitize === "string" || typeof sanitize === "number") ? sanitize :  "-") }
    if(setPrimary) this.primary = value;
    this.el.text(value);
    return this;
};


Field.prototype.setHTML = function(value){
    this.el.html(value);
    return this;
};

Field.prototype.hideIcon = function(){
    if(this.el === null) return this;
    let iconElement = this.el.siblings("i");
    if(iconElement.length > 0) iconElement.hide();
    return this;
};
Field.prototype.showIcon = function(){
    let iconElement = this.el.siblings("i");
    if(iconElement.length > 0) iconElement.show();
    return this;
};


Field.prototype.hideLabel = function(){
    if(this.el === null) return this;
    let labelElement = this.el.siblings(".contentLabel");
    if(labelElement.length > 0) labelElement.hide();
    return this;
};
Field.prototype.showLabel = function(){
    let labelElement = this.el.siblings(".contentLabel");
    if(labelElement.length > 0) labelElement.show();
    return this;
};


/**
 * ----------------------------------------------------------------------
 *
 *
 * Example of fields
 *
 *
 * ----------------------------------------------------------------------


 new Field("eNoteCount",EMPLOYEE_KEY_NOTE_COUNT).setText(e.noteCount,true,"0"),
 new Field("eBirthday", EMPLOYEE_KEY_BIRTHDAY, $("#aboutMain")).setText(e.getParsedDate(e.birthday)).showIcon(),

 *
 * ----------------------------------------------------------------------
 */

