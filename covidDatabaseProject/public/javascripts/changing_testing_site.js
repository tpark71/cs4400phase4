function modify_droplist() {
    var droplist = document.querySelectorAll("li")
    var opt = document.getElementById("options")

    var indice = ['1', '2']

    for (var i = 0; i<opt.length; i++) {
        var opt_value = opt.options[i].value
        for (var j = 0; j<droplist.length; j++) {
            var droplist_value = droplist[j].id
            if (opt_value == droplist_value){
                opt.remove(i)
                i--
            }
        }
    }
}

function deleteSite(something) {
    var removed = document.getElementById(something)
    var new_node = document.createElement("option")
    new_node.setAttribute("value", something)
    var new_node_text = document.createTextNode(something)
    new_node.appendChild(new_node_text)

    document.getElementById(something).remove();
    var opt = document.getElementById("options")
    opt.appendChild(new_node)

}

function addSite() {

    var content = document.getElementById("options")
    var selectedValue = content.options[content.selectedIndex].value;

    if (selectedValue != "") {
        goody = selectedValue

        
        var list = document.createElement("li");
        list.setAttribute("id", goody)
        var input_button = document.createElement("input")
        var func = 'deleteSite(' + '"' + goody + '"' + ')'

        input_button.setAttribute("type", "button")
        input_button.setAttribute("value", "X")
        input_button.setAttribute("id", goody)

        var input_hidden = document.createElement("input")
        input_hidden.setAttribute("type", "hidden")
        input_hidden.setAttribute("value", goody)
        input_hidden.setAttribute("name", goody)

        list.appendChild(input_button);
        list.appendChild(input_hidden)
        // list.appendChild(document.createElement("BR"));
        list.appendChild(document.createTextNode(" " + selectedValue))
        document.getElementById("allSites").appendChild(list);
        document.getElementById(goody).setAttribute('onclick', func)
        modify_droplist()
    }
}

// document.getElementById("Yo").setAttribute('onclick', 'deleteSite("iii")')

// function sendForm() {
//     var form=document.getElementById('form-id');
//     var col=form.querySelectorAll('li');
//     for( var n in col ) if( col[n] && col[n].nodeType==1 ){
//         col[n].onclick=function(e){
//             document.getElementById('test').value=this.querySelectorAll('input[type="hidden"]')[0].value;
//             form.submit();
//         }
//     }
// }