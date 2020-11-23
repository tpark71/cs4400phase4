
var check = function() {
    if (document.getElementById('password').value ==
      document.getElementById('confirm_password').value) {
      document.getElementById('message').style.color = 'green';
      document.getElementById('message').innerHTML = 'matching';
      document.getElementById('complete_register').disabled = false;
    } else {
      document.getElementById('message').style.color = 'red';
      document.getElementById('message').innerHTML = 'not matching';
      document.getElementById('complete_register').disabled = true;
    }
  }


document.getElementById('options').onchange = function() {
    if (this.value == "") {
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

        document.getElementById('housing_type').required = true;
        document.getElementById('location').required = true;
        document.getElementById('phone').required = false;
        // document.getElementById('site_tester').required = false;
        // document.getElementById('labtech').required = false;

    } else if (this.value == "3") {
        document.getElementById("housing_type").style.display = 'none';
        document.getElementById("location").style.display = 'none';
        document.getElementById("phone").style.display = 'block';
        document.getElementById("site_tester").style.display = 'block';
        document.getElementById("labtech").style.display = 'block';

        document.getElementById('housing_type').required = false;
        document.getElementById('location').required = false;
        document.getElementById('phone').required = true;
        // document.getElementById('site_tester').required = true;
        // document.getElementById('labtech').required = true;
    }
};
