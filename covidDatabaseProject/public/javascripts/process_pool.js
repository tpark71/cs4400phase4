document.getElementById('options').onchange = function() {
    if (this.value == "") {
        document.getElementById("negative_table").style.display = 'none';
        document.getElementById("positive_table").style.display = 'none';
    } else if (this.value == "2") {
        document.getElementById("positive_table").style.display = 'block';
        document.getElementById("negative_table").style.display = 'none';

    } else if (this.value == "3") {
        document.getElementById("positive_table").style.display = 'none';
        document.getElementById("negative_table").style.display = 'block';
    }
};
