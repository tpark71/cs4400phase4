function modify_droplist(username) {

    var droplist = document.querySelectorAll("li[name='" + username + "']")
    var opt = document.getElementById(username + "_options")

    if (opt.options[0].value !== "No Site Selected Yet") {
        for (var i = 0; i<opt.length; i++) {
            var opt_value = opt.options[i].value
            for (var j = 0; j<droplist.length; j++) {
                var droplist_value = droplist[j].id.split("_")[1]
                if (opt_value == droplist_value){
                    opt.remove(i)
                    i--
                }
            }
        }
    }
}

function full_modify_droplist(li) {
    var data_json = JSON.parse(li)
    var length = data_json.length;

    for (var i=0; i<length; i++) {
        var username = data_json[i].username
        modify_droplist(username)
    }
}

function deleteSite(something) {
    var removed = document.getElementById(something)
    var username = something.split("_")[0]
    var sitename = something.split("_")[1]
    // document.getElementById("demo").innerHTML = something.split("_")[0];


    var new_node = document.createElement("option")
    new_node.setAttribute("value", sitename)
    var new_node_text = document.createTextNode(sitename)

    // document.getElementById("demo").innerHTML = sitename;
    new_node.appendChild(new_node_text)

    document.getElementById(something).remove();
    var opt = document.getElementById(username + "_options")
    opt.appendChild(new_node)

}

function addSite(something) {

    var content = document.getElementById(something)
    var username = something.split("_")[0]
    var selectedValue = content.options[content.selectedIndex].value;

    if (selectedValue != "") {
        curr_id = username + "_" + selectedValue
        
        
        var list = document.createElement("li");
        list.setAttribute("id", curr_id)
        list.setAttribute("name", username)
        var input_button = document.createElement("input")
        var func = 'deleteSite(' + '"' + curr_id + '"' + ')'

        input_button.setAttribute("type", "button")
        input_button.setAttribute("value", "X")
        input_button.setAttribute("name", selectedValue)

        var input_hidden = document.createElement("input")
        input_hidden.setAttribute("type", "hidden")
        input_hidden.setAttribute("value", selectedValue)
        input_hidden.setAttribute("name", curr_id)

        list.appendChild(input_button);
        list.appendChild(input_hidden)
        // list.appendChild(document.createElement("BR"));
        list.appendChild(document.createTextNode(" " + selectedValue))
        document.getElementById(username).appendChild(list);
        document.getElementById(curr_id).setAttribute('onclick', func)
        modify_droplist(username)
    }
}