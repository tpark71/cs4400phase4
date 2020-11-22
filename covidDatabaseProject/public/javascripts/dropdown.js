document.getElementById('options').onchange = function() {
    if (this.value == "1") {
        document.getElementById("housing_type").style.display = 'none';
        document.getElementById("location").style.display = 'none';
        document.getElementById("phone").style.display = 'none';
        document.getElementById("site_tester").style.display = 'none';
        document.getElementById("labtech").style.display = 'none';
    } else if (this.value == "2") {
        document.getElementById("housing_type").style.display = 'block';
        document.getElementById("location").style.display = 'block';
        document.getElementById("phone").style.display = 'none';
        document.getElementById("site_tester").style.display = 'none';
        document.getElementById("labtech").style.display = 'none';
    } else if (this.value == "3") {
        document.getElementById("housing_type").style.display = 'none';
        document.getElementById("location").style.display = 'none';
        document.getElementById("phone").style.display = 'block';
        document.getElementById("site_tester").style.display = 'block';
        document.getElementById("labtech").style.display = 'block';
    }
};
