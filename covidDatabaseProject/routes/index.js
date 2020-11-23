var express = require('express');
var router = express.Router();

const mysqlDb = require('./../mysqlConn')

// Screen 1: Login
router.get('/', (req, res, next) => {
	res.render('login', {title:''});
});

router.post('/auth', (req, res , next) => {
	var username = req.body.username;
	var password = req.body.password;

	mysqlDb.query(
		'SELECT student_username, emp_username from user \
		left join student on student_username = username \
		left join employee on emp_username = username \
		where username = ? and user_password = ?',
	 [username, password],
	 (error, results, fields) => {
		if (results.length > 0) {
			obj = results[0]

			res.cookie("username", username)
			if (obj["student_username"] != null) {
				res.cookie("status", "Student")
			} else if (obj["emp_username"] != null){
				res.cookie("status", "Employee")
			} else {
				res.cookie("status", "ERROR")
				console.log("Error: Cannot Detect Status")
			}

			res.redirect('/home_screen')

		} else {
			res.render('login', {title:'Incorrect Username and/or Password!'});
		}		
  });
})

// Screen 2: Register
router.get('/register', (req, res, next) => {
	mysqlDb.query('SELECT DISTINCT housing_type FROM student',
	(error, results, fields) => {
		if (results.length > 0) {
			var housing_type = results;
			mysqlDb.query('SELECT DISTINCT location FROM student',
				(error, results, fields) => {
					if (results.length > 0) {
						var location = results;
						res.render('screen2', {title:"Register", loc:location, housing:housing_type, not_unique:""})
					} else {
						console.log("Error!");
					}
			});
		} else {
			console.log("Error!");
		}
   });
});

function not_unique_id() {

}

router.post('/create', (req, res , next) => {
	var username = req.body.username;
	var email = req.body.email;
	var fname = req.body.fname;
	var lname = req.body.lname;
	var passowrd = req.body.password;
	var status = req.body.status;
	if (status == "2") {
		var housing_type = req.body.housing_type;
		var location = req.body.location;
	} else if (status == "3") {
		var phone_num = req.body.phone;
		var site_tester = req.body.site_tester;
		var labtech = req.body.labtech
		console.log("Print")
		console.log(site_tester)
		console.log(labtech)
	} else {
		console.log("Error: Status is not detected!")
	}

	res.send(status)

})


// Screen 3: Home Screen(s)
router.get('/home_screen', (req, res, next) => {
	var username = req.cookies.username
	var status = req.cookies.status
	res.render('screen3', {title:status});
})

// Screen 4: Student View Test Results
router.get('/view_my_results', (req, res, next) => {
	res.render("screen4", {data:null})
})

// router.get('/view_my_results_filtered', (req, res, next) => {
	
// 	mysqlDb.query('CALL student_view_results(?, null, ?, ?)',
// 	[username, start_date, end_date],
//   (error, results, fields) => {
//    if (results.length > 0) {
//      res.render('screen4', {data:results})
//    } else {
//      console.log("Error!");
//    }		
//  });
// })

// Screen 5: Explore Test Result
router.get('/explore_test_result', (req, res, next) => {
	res.send("TODO")
})

// Screen 6: Aggregate Test Results
router.get('/view_aggregate_results', (req, res, next) => {
	res.send("TODO")
})

// Screen 7: Signup for a Test
router.get('/sign_up_for_a_test', (req, res, next) => {
	res.send("TODO")
})

// Screen 8: Lab Tech Tests Processed
router.get('/lab_tech_tests_processed', (req, res, next) => {
	res.send("TODO")
})

// Screen 9: View Pools
router.get('/view_pool', (req, res, next) => {
	res.send("TODO")
})

// Screen 10: Create a Pool
router.get('/create_a_pool', (req, res, next) => {
	res.send("TODO")
})

// Screen 11: View Pool
router.get('/view_pool', (req, res, next) => {
	res.send("TODO")
})

// Screen 12: Create an Appointment
router.get('/create_an_appointment', (req, res, next) => {
	res.send("TODO")
})

// Screen 13: View Appointments
router.get('/view_appointments', (req, res, next) => {
	res.send("TODO")
})

// Screen 14: Reassign Tester
router.get('/reassign_tester', (req, res, next) => {
	res.send("TODO")
})

// Screen 15: Create a Testing Site
router.get('/create_a_testing_site', (req, res, next) => {
	res.send("TODO")
})

// Screen 16: Explore Pool Result
router.get('/explore_pool_result', (req, res, next) => {
	res.send("TODO")
})

// Screen 17: Tester Change Testing Site
router.get('/tester_change_testing_site', (req, res, next) => {
	res.send("TODO")
})

// Screen 18: View Daily Results
router.get('/view_daily_results', (req, res, next) => {
	res.send("TODO")
})

// Debugging Screen
router.get('/debug', (req, res, next) => {
  mysqlDb.query('SELECT * FROM user',
  (error, results, fields) => {
   if (results.length > 0) {
     res.render('debug', {title: "debug only", result:results})
    //  res.json(results);
   } else {
     console.log("Error!");
   }		
 });
});

module.exports = router;
