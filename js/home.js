/**
 * Created by @VanSoftware on 12/01/2019.
 */

let G_codeInput = null;

let G_Tables = [];
let G_Tree = [];
let G_Syntax = [];
let G_ProtectedKeywords = [];
let G_Binder = null;

let G_Constants = [];




let G_Actions = [];

$(function() {
    init();
});

function init(){
    Structure.initPrimary(PAGE_IDENTIFIER_HOME,null);

    G_codeInput = new TextInput({
        ID : "EDITOR",
        parent : $(".binder-editor-container"),
        label : "NOLabel",
        placeholder : "Start writing Binder code here...",
        danger : INPUT_DANGER_BIG,
        area: true
    });

    G_Binder = new Binder();

    (G_Binder.init())
        .then(() => BinderTable.init())
        .then(()=>  BinderAction.init())
        .then(()=>  BinderSyntax.init())
        .then(()=>  Structure.initCover())
        .then(()=>  Structure.initActionsCover())
        .then(() => getSaved())
        .then(()=> handle() )
        .catch((err) => {
        console.error(err);
    });





}

function handle(){

    return new Promise((resolve, reject) => {
        console.log(G_Tables);
        console.log(G_Syntax);



        $("#buttonBind").unbind().on("click",function(){
            G_Binder.parse(G_codeInput.getValueFromElement(),$(".binder-preview-container span"));
        });

        G_Binder.parse(G_codeInput.getValueFromElement(),$(".binder-preview-container span"),false);


        $("#buttonSave").unbind().on("click",function(){
            window.localStorage.setItem("BinderBase", G_codeInput.getValueFromElement());
            showAlert("Base saved in memory.",ALERT_TYPE_SUCCESS,1400);
        });

        $("#buttonRestore").unbind().on("click",function(){
            window.localStorage.setItem("BinderBase", G_codeInput.getValueFromElement());
            getSaved(true);
        });

    });
}

function getSaved(restore = false){
    return new Promise((resolve, reject) => {
        if(window.localStorage.getItem("BinderBase") === null || restore){

            $.ajax({
                url : "data/base.txt",
                dataType: "text",
                success : function (data) {
                    window.localStorage.setItem("BinderBase", data);
                    G_codeInput.element.val(data);
                    if(restore){
                        showAlert("Base restored from file.",ALERT_TYPE_SUCCESS,1400);
                        $("#buttonBind").click();
                    }
                    resolve();
                },
                fail : function(e){
                    console.log(e);
                    resolve();
                }
            });
        }else{
            console.log("from memory");
            G_codeInput.element.val(window.localStorage.getItem("BinderBase"));
            resolve();
        }
    });
}
