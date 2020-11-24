var express = require('express');
var router = express.Router();
// express.use(bodyParser.urlencoded({ extended: false }))

const mysqlDb = require('./../mysqlConn')

// Screen 1: Login
router.get('/', (req, res, next) => {

	res.clearCookie("username");
	res.clearCookie("status");
	res.clearCookie("position");

	res.render('login', {title:''});
});

router.post('/auth', (req, res , next) => {
	var username = req.body.username;
	var password = req.body.password;

	mysqlDb.query(
		'SELECT student_username, emp_username from user \
		left join student on student_username = username \
		left join employee on emp_username = username \
		left join administrator on admin_username = username \
		where username = ? and user_password = ?',
	 [username, password],
	 (error, results, fields) => {
		if (results.length > 0) {
			obj = results[0]
			res.cookie("username", username)

			console.log("step 1")

			// 1. USER IS A STUDENT
			if (obj["student_username"] != null) {
				res.cookie("status", "Student")
				res.redirect('/home_screen')
			// 2. USER IS AN EMPLOYEE
			} else if (obj["emp_username"] != null) {
				res.cookie("status", "Employee")

				console.log("step 2")
				res.redirect("/employee_only")

			// 3. USER IS AN ADMIN
			} else if (obj["admin_username"] != null) {
				res.cookie("status", "Admin")
			} else {
				console.log("Error: Cannot Detect Status")
				// res.redirect('/home_screen')
			}
		} else {
			res.render('login', {title:'Incorrect Username and/or Password!'});
		}		
  });
})

router.get('/employee_only', (req, res, next) => {
	var username = req.cookies.username
	console.log("username:")
	console.log(username)
	mysqlDb.query(
		'select labtech_username, sitetester_username from employee \
		left join labtech on emp_username = labtech_username \
		left join sitetester on emp_username = sitetester_username \
		where emp_username = ?',
		[username],
		(error, results, fields) => {
			if (results.length > 0) {
				job = results[0]

				console.log("step 3")

				if (job["labtech_username"] != null && job["sitetester_username"] != null) {
					res.cookie("position", 'both')
					res.redirect("/home_screen")
				} else if (job["labtech_username"] != null && job["sitetester_username"] == null) {
					res.cookie("position", 'lab')
					res.redirect("/home_screen")
				} else if (job["labtech_username"] == null && job["sitetester_username"] != null) {
					res.cookie("position", 'site')
					res.redirect("/home_screen")
				} else {
					console.log("Error: this one does not have a position")
				}

			} else {
				console.log("Error!");
			}
		});
})

// Screen 2: Register
router.get('/register', (req, res, next) => {
	console.log("step 1")
	mysqlDb.query('SELECT DISTINCT housing_type FROM student',
	(error, results, fields) => {
		if (results.length > 0) {
			console.log("step 2")
			var housing_type = results;
			mysqlDb.query('SELECT DISTINCT location FROM student',
				(error, results, fields) => {
					if (results.length > 0) {
						var location = results;
						console.log("step 3")
						res.render('screen2', {title:"Register", loc:location, housing:housing_type, error:""})
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
	console.log("step 4")

	mysqlDb.query('SELECT * FROM user where username = ?',
				[username],
				(error, results, fields) => {
					if (results.length > 0) {
						console.log("step 5")
						// req.session.error = 'Username is already taken. Please try another';
						res.redirect('/register');
					} else {
						var email = req.body.email;
						var fname = req.body.fname;
						var lname = req.body.lname;
						var password = req.body.password;
						var status = req.body.status;
					
						if (status == "2") {
							var housing_type = req.body.housing_type;
							var location = req.body.location;
							console.log("step 6")
							mysqlDb.query('CALL register_student(?, ?, ?, ?, ?, ?, ?)',
							[username, email, fname, lname, location, housing_type, password],
							(error, results, fields) => {
							});
							console.log("step 7")
							res.cookie("username", username)
							res.cookie("status", "Student")
					
							res.redirect("/home_screen")
					
						} else if (status == "3") {
							var phone_num = req.body.phone;
							var site_tester = false
							var labtech = false
					
							res.cookie("username", username)
							res.cookie("status", "Employee")
					
							if (req.body.site_tester !== 'undefined'&& req.body.site_tester) { 
								site_tester = true
								res.cookie("position", 'site')
							}
					
							if (req.body.labtech !== 'undefined'&& req.body.labtech) { 
								labtech = true
								res.cookie("position", 'lab')
							}
					
							if (site_tester && labtech) {
								res.cookie("position", "both")
							}
					
							if (!site_tester && !labtech) {
								req.session.error = 'You must select at least one box!';
								res.redirect('/register');
							}
					
							mysqlDb.query('CALL register_employee(?, ?, ?, ?, ?, ?, ?, ?)',
							[username, email, fname, lname, phone_num, labtech, site_tester, password],
							(error, results, fields) => {
							});
					
							res.redirect("/home_screen")
					
						} else {
							console.log("Error: Status is not detected!")
						}
					}
		});
})


// Screen 3: Home Screen(s)
router.get('/home_screen', (req, res, next) => {
	var username = req.cookies.username
	var status = req.cookies.status
	var position = req.cookies.position

	console.log("step 6")
	console.log(username)
	console.log(status)
	console.log(position)
	// console.log(req.cookies.labtech)
	// console.log(req.cookies.site_tester)

	table = []
	site_tester_table = [
		["changing_testing","Change Testing"],
		["view_appointments","View Appointments"],
		["create_appointment","Create Appointment"],
		["view_aggregate_results","View Aggregate Results"],
		["view_daily_results","View Daily Results"]
	]
	labtech_table = [
		["process_pool","Process Pool"],
		["create_pool","Create Pool"],
		["view_pools","View Pools"],
		["view_my_processed_tests","View My Processed Tests"],
		["view_aggregate_results","View Aggregate Results"],
		["view_daily_results","View Daily Results"]
	]
	both_table = [
		["process_pool","Process Pool"],
		["create_pool","Create Pool"],
		["view_pools","View Pools"],
		["view_my_processed_tests","View My Processed Tests"],
		["view_aggregate_results","View Aggregate Results"],
		["changing_testing","Change Testing"],
		["view_appointments","View Appointments"],
		["create_appointment","Create Appointment"],
		["view_daily_results","View Daily Results"]
	]	

	if (status == "Employee") {
		console.log("step 7")

		if (position == 'site') {
			status = "Tester"
			table = site_tester_table
		}

		if (position == 'lab') {
			console.log("step 8")
			status = "Lab Technician"
			table = labtech_table
		}

		if (position == 'both') {
			status = "Lab Technician / Tester"
			// table = site_tester_table.concat(labtech_table)
			table = both_table
		}

		res.render('screen3', {title:status, table:table})
	} 

	if (status == "Admin") {
		table = [
			["reassign_testers","Reassign Testers"],
			["create_appointment","Create Appointment"],
			["view_appointment","View Appointment"],
			["create_testing_site","Create Testing Site"],
			["view_aggregate_results","View Aggregate Results"],
			["view_daily_results","View Daily Results"]
		]
	}

	table = [
		["view_my_results","View My Results"],
		["view_aggregate_results","View Aggregate Results"],
		["sign_up_for_a_test","Sign Up for a Test"],
		["view_daily_results","View Daily Results"]
	]	

	res.render('screen3', {title:status, table:table});
})

// Screen 4: Student View Test Results
router.get('/view_my_results', (req, res, next) => {
	console.log(req.cookies.username)
	res.render("screen4", {result: [{
		"test_id": null,
		"timeslot_date": null,
		"date_processed": null,
		"pool_status": null,
		"test_status": null
	}] })
})

router.post('/view_my_results_filtered', (req, res, next) => {
	var username = req.cookies.username
	var start_date = null
	var end_date = null

	if (req.body.start_date !== 'undefined'&& req.body.start_date) { 
		start_date = req.body.start_date
		start_date = String(start_date)
	}

	if (req.body.end_date !== 'undefined'&& req.body.end_date) { 
		end_date = req.body.end_date
		end_date = String(end_date)
	}

	console.log(username)
	console.log(start_date)
	console.log(end_date)

	mysqlDb.query('CALL student_view_results(?, null, ?, ?)',
		[username, start_date, end_date],
		(error, results, fields) => {
		});



	mysqlDb.query(
		'SELECT test_id, \
		DATE_FORMAT(timeslot_date, "%m/%d/%Y") as timeslot_date, \
		DATE_FORMAT(date_processed, "%m/%d/%Y") as date_processed, \
		pool_status, test_status from student_view_results_result',
		(error, results, fields) => {
			if (results.length > 0) {
				res.render('screen4', {result:results})
			} else {
				res.render("screen4", {result: [{
					"test_id": "N/A",
					"timeslot_date": "N/A",
					"date_processed": "N/A",
					"pool_status": "N/A",
					"test_status": "N/A"
				}] })
		}
	});	
})

// Screen 5: Explore Test Result
router.get('/explore_test_result:id', (req, res, next) => {
	//console.log(username)
	var test_id = req.params.id;
	// need to remove.
	//temp value == 100003;
	//test_id = String(test_id)


	mysqlDb.query('CALL explore_results(?)',
	[test_id],
	(error, results, fields) => {
		
	});

	mysqlDb.query('select test_id, \
	DATE_FORMAT(test_date, "%m/%d/%Y") as test_date, \
	timeslot,\
	testing_location,\
	DATE_FORMAT(date_processed, "%m/%d/%Y") as date_processed, \
	pooled_result, \
	individual_result, \
	processed_by \
	from explore_results_result',
		(error, results, fields) => {

			if (results.length > 0) {
				res.render('screen5', {result:results})
				console.log("success");
			} else {
				res.render('screen5', {result: [{
					"test_id": "N/A",
					"test_date": "N/A",
					"timeslot": "N/A",
					"testing_location": "N/A",
					"date_processed": "N/A",
					"pooled_result": "N/A",
					"individual_result": "N/A",
					"processed_by": "N/A"
				}] })
				}
		
	});
})



// Screen 6: Aggregate Test Results
router.get('/view_aggregate_results', (req, res, next) => {
	console.log(req.cookies.username)

	var top_row = [{
		"total": "N/A",
		"percent": "N/A"
	}]

	var data = [{
		"test_status": "N/A",
		"num_of_test": "N/A",
		"percentage": "N/A"
	}]
	
	mysqlDb.query('SELECT DISTINCT housing_type FROM student',
	(error, results, fields) => {
		if (results.length > 0) {
			var housing_type = results;
			mysqlDb.query('SELECT DISTINCT location FROM student',
				(error, results, fields) => {
					if (results.length > 0) {
						var location = results;
						mysqlDb.query('select distinct site_name from site',
						(error, results, fields) => {
							if (results.length > 0) {
									var sites = results;
									console.log(top_row)
									res.render('screen6', {loc:location, housing:housing_type, sites:sites, top_row:top_row, data:data})
								} else {
									console.log("Error!");
								}
						});
					} else {
						console.log("Error!");
					}
			});
		} else {
			console.log("Error!");
		}
   });
})

router.post('/view_aggregate_results_filtered', (req, res, next) => {

	var location = req.body.location;
	var housing_type = req.body.housing_type;
	var testing_site = req.body.sites;
	var start_date = null
	var end_date = null

	if (location == "all") {
		location = null;
	}

	if (housing_type == "all") {
		housing_type = null;
	}

	if (testing_site == "all") {
		testing_site = null;
	}

	if (req.body.start_date !== 'undefined'&& req.body.start_date) { 
		start_date = req.body.start_date
		start_date = String(start_date)
	}

	if (req.body.end_date !== 'undefined'&& req.body.end_date) { 
		end_date = req.body.end_date
		end_date = String(end_date)
	}



	mysqlDb.query('CALL aggregate_results(?, ?, ?, ?, ?)',
		[location, housing_type, testing_site, start_date, end_date],
		(error, results, fields) => {
		});

	console.log(location)
	console.log(housing_type)
	console.log(testing_site)
	console.log(start_date)
	console.log(end_date)

	mysqlDb.query('SELECT DISTINCT housing_type FROM student',
	(error, results, fields) => {
		if (results.length > 0) {
			var housing_type = results;
			mysqlDb.query('SELECT DISTINCT location FROM student',
				(error, results, fields) => {
					if (results.length > 0) {
						var location = results;
						mysqlDb.query('select distinct site_name from site',
						(error, results, fields) => {
							if (results.length > 0) {
									var sites = results;
									mysqlDb.query('Select sum(num_of_test) as total, "100 %" as percent from aggregate_results_result',
									(error, results, fields) => {
										if (results.length > 0) {
												var top_row = results;
												mysqlDb.query('Select test_status, num_of_test, concat(percentage, " %") as percentage from aggregate_results_result',
													(error, results, fields) => {
														if (results.length > 0) {
																var data = results;
																res.render('screen6', {loc:location, housing:housing_type, sites:sites, top_row:top_row, data:data})
															} else {
																res.redirect("/view_aggregate_results")
															}
													});		
											} else {
												console.log("Error!");
											}
								});
							} else {
								console.log("Error!");
							}
						});
					} else {
						console.log("Error!");
					}
			});
		} else {
			console.log("Error!");
		}
	});
	
})


// Screen 7: Signup for a Test
router.get('/sign_up_for_a_test', (req, res, next) => {

	var data = [{
		"appt_date": "N/A",
		"appt_time": "N/A",
		"street": "N/A",
		"site_name": "N/A"
	}]

	mysqlDb.query('select distinct site_name from site',
						(error, results, fields) => {
							if (results.length > 0) {
									var sites = results;
									res.render('screen7', {sites:sites, data:data, error:""})
								} else {
									console.log("Error!");
								}
						});
})

router.post('/sign_up_for_a_test_filtered', (req, res, next) => {
	var username = req.cookies.username;
	var testing_site = req.body.sites;
	var start_date = null
	var end_date = null
	var start_time = null
	var end_time = null

	console.log(username)

	if (testing_site == "all") {
		testing_site = null;
	}

	if (req.body.start_date !== 'undefined'&& req.body.start_date) { 
		start_date = req.body.start_date
		start_date = String(start_date)
	}

	if (req.body.end_date !== 'undefined'&& req.body.end_date) { 
		end_date = req.body.end_date
		end_date = String(end_date)
	}

	if (req.body.start_time !== 'undefined'&& req.body.start_time) { 
		start_time = req.body.start_time
		start_time = String(start_time)
	}

	if (req.body.end_time !== 'undefined'&& req.body.end_time) { 
		end_time = req.body.end_time
		end_time = String(end_time)
	}

	console.log(username)
	console.log(testing_site)
	console.log(start_date)
	console.log(end_date)
	console.log(start_time)
	console.log(end_time)

	mysqlDb.query('CALL test_sign_up_filter(?, ?, ?, ?, ?, ?)',
		[username, testing_site, start_date, end_date, start_time, end_time],
		(error, results, fields) => {
		});

	console.log("Passed")


	mysqlDb.query('select distinct site_name from site',
						(error, results, fields) => {
							if (results.length > 0) {
								var sites = results;
								mysqlDb.query('SELECT \
									DATE_FORMAT(appt_date, "%m/%d/%Y") as appt_date, \
									TIME_FORMAT(appt_time, "%h:%i %p") as appt_time, \
									street, site_name from test_sign_up_filter_result',
									(error, results, fields) => {
										if (results.length > 0) {
												
												res.render('screen7', {sites:sites, data:results, error:""})
											} else {
												res.redirect("/sign_up_for_a_test_filtered")
											}
									});
								} else {
									console.log("Error!");
								}
						});
})

router.post('/sign_up_for_a_test_process', (req, res, next) => {
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
	mysqlDb.query('SELECT * FROM student',
  (error, results, fields) => {
   if (results.length > 0) {
    //  res.render('debug', {title: "debug only", result:results})
	  res.json(results);
	//res.send()
   } else {
     console.log("Error!");
   }		
 });
});

module.exports = router;
