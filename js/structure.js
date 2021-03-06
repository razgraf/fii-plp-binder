/**
 * Created by @VanSoftware on 10/06/2018.
 */

class Structure{

    /**
     *
     * @param {string} identifier
     * @param {(Array|Object|null)}  extra
     */
    static initPrimary(identifier, extra = null){

        let currentPage = null;
        let header = $("header");
        let side = $(".menu");
        let body = $("body");

        for(let i =0; i < PRIMARY_PAGES.length;i++) {
            if (identifier === PRIMARY_PAGES[i].identifier) currentPage = PRIMARY_PAGES[i];
        }
        if(currentPage === null) return;


        /**
         * HEADER MANAGEMENT
         */

        let headerContent = '<div class="toolbarContainer"> ' +
            '<div class="toolbarLogo"><img alt="Logo" src="image/logo_white.png"></div> ' +
            '<div class="toolbarMenu"> ' +
            '<div class="toolbarButtons"> ' +
            '<div class="buttonActions"><i class="material-icons">code</i><span>View Actions</span></div>'+
            '<div class="buttonTable"><i class="material-icons">grid_on</i><span>View Tables</span></div>'+
            '</div> ' +
            '</div> ' +
            '</div>';


        header.append(headerContent);






    }





    static initCover(tables = G_Tables){


        let body = $("body");
        let buttonOn = $("header .toolbarButtons").find(".buttonTable");

        let cover = body.find(".cover");

        if( !cover.hasClass("printed")){
            cover.addClass("printed");

            let print = ' <div class="cover-container"> ' +
                '<div class="cover-header"> ' +
                '<div class="cover-header-close"><i class="material-icons">close</i></div> ' +
                '<div class="cover-header-title"><i class="material-icons">grid_on</i><p>Tables</p></div> ' +
                '</div> ' +
                '<div class="cover-content"> ' +

                '</div> ' +
                '</div>';


            cover.append(print);


            for(let i = 0; i < tables.length; i++){

                let table_structure = '<div data-id="'+tables[i].ID+'" class="cover-item"> ' +
                    '<div class="cover-item-name"><p>name: <span></span></p></div> ' +
                    '<div class="cover-item-table"> ' +
                    '<table> ' +
                    '</table> ' +
                    '</div> ' +
                    '</div> ';

                cover.find(".cover-container > .cover-content").append(table_structure);


                let table_element = cover.find(".cover-item[data-id='"+tables[i].ID+"']");
                if(table_element.length > 0) {

                    table_element.find(".cover-item-name > p > span").text(tables[i].name);



                    let data = "";
                    for (let c = 0; c < tables[i].columns.length; c++) {
                        data+="<th data-tooltip='"+ (isEmpty(tables[i].columns[c].info)? tables[i].columns[c].name: tables[i].columns[c].info)+"'>"+tables[i].columns[c].name+"</th>"
                    }
                    table_element.find("table").append("<tr>"+data+"</tr>");



                    for (let row = 0; row < tables[i].data.length; row++) {
                        let data = "";
                        for(let cell = 0; cell < tables[i].data[row].cells.length; cell++){
                            data+="<td>"+tables[i].data[row].cells[cell].value+"</td>";
                        }

                        table_element.find("table").append("<tr>"+data+"</tr>");
                    }

                }





            }

        }

        $(".overlay").unbind().on("click",function(){cover.find(".cover-header-close").click();});
        buttonOn.unbind().on("click",function(){
            if( !body.hasClass("menu-visible"))
            {
                body.addClass("menu-visible");
                $(".overlay").fadeIn(300);
            }
        });
        cover.find(".cover-header-close").unbind().on("click",function(){
            if(body.hasClass("menu-visible")){
                body.removeClass("menu-visible");
                $(".overlay").fadeOut(300);
            }
        });






    }


    static initActionsCover(tables = G_Tables){


        let body = $("body");
        let buttonOn = $("header .toolbarButtons").find(".buttonActions");

        let cover = body.find(".cover-action");

        if( !cover.hasClass("printed")){
            cover.addClass("printed");

            let print = ' <div class="cover-container"> ' +
                '<div class="cover-header"> ' +
                '<div class="cover-header-close"><i class="material-icons">close</i></div> ' +
                '<div class="cover-header-title"><i class="material-icons">code</i><p>Actions & Function</p></div> ' +
                '</div> ' +
                '<div class="cover-content"> ' +
                '<div class="cover-content-section actions"> ' +
                '<div class="binder-section-title light"><p>Actions</p></div>'+
                '</div> ' +
                '<div class="cover-content-section functions"> ' +
                '<div class="binder-section-title light"><p>Function</p></div>'+
                '</div> ' +
                '</div> ' +
                '</div>';


            cover.append(print);
        }



        let parent_f = cover.find(".cover-content-section.functions");
        if(parent_f.length > 0){

            for(let i = 0; i < G_Functions.length;i++){
                let print_e =
                    '<div class="cover-content-function" data-id="'+i+'">' +
                    '<div class="cover-content-function-header">' +
                    '<p class="cover-content-function-header-name">f: <span class="tooltip-right"></span></p>'+
                    '<div class="toggle"><i class="material-icons">keyboard_arrow_down</i></div>' +
                    '</div>'+
                    '<div class="cover-content-function-body">' +
                    '<div class="cover-content-function-body-container">' +
                    '<span></span>' +
                    '</div>'+
                    '</div>'+
                    '</div>'
                parent_f.append(print_e);
                let element =  parent_f.find(".cover-content-function[data-id='"+i+"']");
                element.find(".cover-content-function-header-name span").attr("data-tooltip",ClassHelper.sanitize(G_Functions[i].info));
                element.find(".cover-content-function-header-name span").text(ClassHelper.sanitize(G_Functions[i].name));
                element.find(".cover-content-function-body .cover-content-function-body-container span").html( (BinderFunction.getFunction(G_Functions[i].name)).toString());
                element.find(".cover-content-function-header .toggle").unbind().on("click",function(){
                    element.toggleClass("show");
                });

            }



        }




        let parent_a = cover.find(".cover-content-section.actions");
        if(parent_a.length > 0){

            for(let i = 0; i < G_Actions.length;i++){
                let print_e =
                    '<div class="cover-content-function" data-id="'+i+'">' +
                    '<div class="cover-content-function-header">' +
                    '<p class="cover-content-function-header-name">f: <span></span></p>'+
                    '<div class="toggle"><i class="material-icons">keyboard_arrow_down</i></div>' +
                    '</div>'+
                    '<div class="cover-content-function-body">' +
                    '<div class="cover-content-function-body-container">' +
                    '<span></span>' +
                    '</div>'+
                    '</div>'+
                    '</div>'
                parent_a.append(print_e);
                let element =  parent_a.find(".cover-content-function[data-id='"+i+"']");
                element.find(".cover-content-function-header-name span").text(ClassHelper.sanitize(G_Actions[i].name));
                element.find(".cover-content-function-body .cover-content-function-body-container span").html( (G_Actions[i].action).toString());
                element.find(".cover-content-function-header .toggle").unbind().on("click",function(){
                    element.toggleClass("show");
                });

            }



        }




        $(".overlay-action").unbind().on("click",function(){cover.find(".cover-header-close").click();});
        buttonOn.unbind().on("click",function(){
            if( !body.hasClass("menu-action-visible"))
            {
                body.addClass("menu-action-visible");
                $(".overlay-action").fadeIn(300);
            }
        });
        cover.find(".cover-header-close").unbind().on("click",function(){
            if(body.hasClass("menu-action-visible")){
                body.removeClass("menu-action-visible");
                $(".overlay-action").fadeOut(300);
            }
        });






    }




}


