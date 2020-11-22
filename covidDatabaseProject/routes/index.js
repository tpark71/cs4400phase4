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

	mysqlDb.query('SELECT * FROM users WHERE username = ? and password = ?',
	 [username, password],
	 (error, results, fields) => {
		if (results.length > 0) {
			res.json(results);
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
						res.render('screen2', {title:"Register", loc:location, housing:housing_type})
					} else {
						console.log("Error!");
					}
			});
		} else {
			console.log("Error!");
		}
   });
});

router.post('/create', (req, res , next) => {
	res.send("Good!")
})


// Screen 3: Home Screen(s)

// Screen 4: Student View Test Results

// Screen 5: Explore Test Result

// Screen 6: Aggregate Test Results

// Screen 7: Signup for a Test

// Screen 8: Lab Tech Tests Processed

// Screen 9: View Pools

// Screen 10: Create a Pool

// Screen 11: View Pool

// Screen 12: Create an Appointment

// Screen 13: View Appointments

// Screen 14: Reassign Tester

// Screen 15: Create a Testing Site

// Screen 16: Explore Pool Result

// Screen 17: Tester Change Testing Site

// Screen 18: View Daily Results

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
