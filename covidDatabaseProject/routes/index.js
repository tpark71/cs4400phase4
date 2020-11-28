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
		'SELECT student_username, emp_username, admin_username from user \
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
			console.log(obj)

			// 1. USER IS A STUDENT
			if (obj["student_username"] != null) {
				res.cookie("status", "Student")
				res.redirect('/home_screen')
			// 2. USER IS AN EMPLOYEE
			} else if (obj["emp_username"] != null) {
				res.cookie("status", "Employee")
				res.redirect("/employee_only")

			// 3. USER IS AN ADMIN
			} else if (obj["admin_username"] != null) {
				console.log("step 2 for Admin login")
				res.cookie("status", "Admin")
				res.redirect('/home_screen')
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
		["view_appointment","View Appointments"],
		["create_appointment","Create Appointment"],
		["view_aggregate_results","View Aggregate Results"],
		["view_daily_results","View Daily Results"]
	]
	labtech_table = [
		["process_pool","Process Pool"],
		["create_pool","Create Pool"],
		["view_pool","View Pools"],
		["view_my_processed_tests","View My Processed Tests"],
		["view_aggregate_results","View Aggregate Results"],
		["view_daily_results","View Daily Results"]
	]
	both_table = [
		["process_pool","Process Pool"],
		["create_pool","Create Pool"],
		["view_pool","View Pools"],
		["view_my_processed_tests","View My Processed Tests"],
		["view_aggregate_results","View Aggregate Results"],
		["changing_testing","Change Testing"],
		["view_appointment","View Appointments"],
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
		res.cookie("position", "Admin")
		table = [
			["reassign_testers","Reassign Testers"],
			["create_appointment","Create Appointment"],
			["view_appointment","View Appointment"],
			["create_testing_site","Create Testing Site"],
			["view_aggregate_results","View Aggregate Results"],
			["view_daily_results","View Daily Results"]
		]
	} else {
		table = [
			["view_my_results","View My Results"],
			["view_aggregate_results","View Aggregate Results"],
			["sign_up_for_a_test","Sign Up for a Test"],
			["view_daily_results","View Daily Results"]
		]
	}

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
	var username = req.cookies.username;
	username = 'jhilborn97';


	var data = [{
		"test_id": "N/A",
		"pool_id": "N/A",
		"test_date": "N/A",
		"process_date": "N/A",
		"test_status": "N/A"
	}]

	res.render('screen8');

	mysqlDb.query('select * from test natural join pool where pool.processed_by in (?)',
	[username],
	(error, results, fields) => {
		if (results.length > 0) {
			
			res.render("screen8", {result: [{
				"pool_id": "N/A",
				"test_id": "N/A",
				"test_status": "N/A",
				"appt_site": "N/A",
				"appt_date": "N/A",
				"appt_time": "N/A",
				"pool_status": "N/A",
				"process_date": "N/A",
				"processed_by": "N/A"
			}] })
			console.log("aaaaa");
		} else {
			console.log("Error!");
			res.render("screen8", {result: [{
				"pool_id": "N/A",
				"test_id": "N/A",
				"test_status": "N/A",
				"appt_site": "N/A",
				"appt_date": "N/A",
				"appt_time": "N/A",
				"pool_status": "N/A",
				"process_date": "N/A",
				"processed_by": "N/A"
			}] })
		}
	});

})



router.post('/a', (req, res, next) => {
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



// Screen 9: View Pools
router.get('/view_pool', (req, res, next) => {
	var data = [{
		pool_id: "N/A",
		test_ids: "N/A",
		date_processed: "N/A",
		processed_by: "N/A",
		pool_status: "N/A"
	}]

	var message = String(req.cookies.error)
	var pool = [ "Positive", "Negative", "Pending"]

	error = message
	if (error === 'undefined') { 
		error = ""
	}
	res.clearCookie("error")

	res.render('screen9', {title:"View Pool", pool:pool, data:data, error:error})
});

router.post('/view_pool_filtered', (req, res, next) => {
	console.log(req.body.sites)

	var pool_status = req.body.sites;
	var start_date = null
	var end_date = null
	var processed_by = req.body.processed_by;
	
	if (pool_status == "all") {
		pool_status = null;
	}

	if (processed_by == '') {
		processed_by = null;
	}

	if (req.body.start_date !== 'undefined' && req.body.start_date) { 
		start_date = req.body.start_date
		start_date = String(start_date)
	}

	if (req.body.end_date !== 'undefined' && req.body.end_date) { 
		end_date = req.body.end_date
		end_date = String(end_date)
	}

	mysqlDb.query(
		'CALL view_pools(?,?,?,?)',
		[start_date, end_date, pool_status, processed_by],
		(error, results, fields) => {
		});



	mysqlDb.query(
		'select * from view_pools_result',
		(error, results, fields) => {
			if (results.length > 0) {
				var data = results;
				var pool = [ "Positive", "Negative", "Pending"]
				res.render('screen9', {title:"View Pool", pool:pool, data:data, error:""})
			} else {
				res.cookie("error", "No Result. Please try with other option(s)")
				res.redirect('/view_pool')
			}
		});
})

// Screen 10: Create a Pool
router.get('/create_pool', (req, res, next) => {
	var message = String(req.cookies.error)
	mysqlDb.query(
		'select test_id, DATE_FORMAT(appt_date, "%m/%d/%Y") as appt_date from test where pool_id is null',
		(error, results, fields) => {
			if (results.length > 0) {
				var data = results;

				error = message
				if (error === 'undefined') { 
					error = ""
				}
				res.clearCookie("error")

				res.render('screen10', {title:"Create Pool", error:error, data:data})
			} else {
				console.log("Error!");
			}
		});
})

router.post('/create_pool_process', (req, res, next) => {
	var pool_id = req.body.pool_id

	const obj = {};
	for (let [key, value] of Object.entries(req.body)) {
		obj[key] = value;
	}

	delete obj["pool_id"]

	console.log(obj)
	dict_len = Object.keys(obj).length

	if (dict_len == 0) {
		res.cookie("error", "You must select one or more Test ID")
		res.redirect('/create_pool')
	} else if (dict_len > 7) {
		res.cookie("error", "You cannot select more than 7 Test IDs")
		res.redirect('/create_pool')
	} else {
		mysqlDb.query(
			'SELECT * FROM pool where pool_id = ?',
			[pool_id],
			(error, results, fields) => {
				if (results.length > 0) {
					res.cookie("error", "Pool ID must be unique")
					res.redirect('/create_pool')
				} else {
					const tests = Object.keys(obj)
					
					console.log(tests)
					console.log(tests[0])
					console.log(pool_id)
					
					mysqlDb.query(
						'CALL create_pool(?,?)',
						[pool_id, tests[0]],
						(error, results, fields) => {
						});
					
					for (var i=1; i<tests.length; i++) {	
						mysqlDb.query(
							'CALL assign_test_to_pool(?,?)',
							[pool_id, tests[i]],
							(error, results, fields) => {
							});
					}

					res.render("successed", {title:"Creating Pool Success!", message:"Successfully created pool"})

				}
			});
	}

	
})

// Screen 11: Process Pool
router.get('/process_pool', (req, res, next) => {
	var pool_id = "11"
	var message = String(req.cookies.error)

	mysqlDb.query(
		'select p.pool_id as pool_id, t.test_id as test_id, DATE_FORMAT(appt_date, "%m/%d/%Y") as appt_date from pool p \
		left join test t on p.pool_id = t.pool_id \
		where p.pool_id = ?',
		[pool_id],
		(error, results, fields) => {
			if (results.length > 0) {
				var data = results;

				error = message
					if (error === 'undefined') { 
						error = ""
					}
				res.clearCookie("error")

				res.render('screen11', {title:"Process Pool", pool_id:pool_id, data:data, error:error})
			} else {
				console.log("Error!");
			}
		});

})

router.post('/process_pool_filtered', (req, res, next) => {
	var username = req.cookies.username
	var pool_id = req.body.pool_id
	var processed_date = req.body.start_date
	var status = req.body.status

	delete obj["pool_id"]
	delete obj["processed_date"]
	delete obj["status"]

	const obj = {};
	
	for (let [key, value] of Object.entries(req.body)) {
		obj[key] = value;
	}
	console.log(obj)

	const tests = Object.keys(obj)
	
	mysqlDb.query(
		'select DATE_FORMAT(max(appt_date), "%Y/%m/%d") as appt_date from pool p \
		left join test t on p.pool_id = t.pool_id \
		where p.pool_id = ?',
		[pool_id],
		(error, results, fields) => {
			if (results.length > 0) {
				var last_date = results[0].appt_date;
				last_date_list = last_date.split("/")
				processed_date_list = processed_date.split("-")

				console.log(last_date_list)
				console.log(processed_date_list)

				if (last_date_list[0]>processed_date_list[0] ||
					last_date_list[0]==processed_date_list[0] && last_date_list[1]>processed_date_list[1] ||
					last_date_list[0]==processed_date_list[0] && last_date_list[1]==processed_date_list[1] && last_date_list[2]>=processed_date_list[2]
					){
						res.cookie("error", "Processed Date must be after the latest timeslot date of the tests")
						res.redirect("/process_pool")
				} else {
					// 너무 귀찮아서 아직 테스트 안함ㅋㅋㅋ
					if (status == "2") {
						mysqlDb.query(
							'CALL process_pool(?, ?, ?, ?)',
							[pool_id, 'positive', processed_date, username],
							(error, results, fields) => {
							});
						
						for (var i=0; i<tests.length; i++) {
							var ind_status = obj[test[i]]
							mysqlDb.query(
								'CALL process_test(?,?)',
								[tests[i], ind_status],
								(error, results, fields) => {
								});
						}

					} else {
						mysqlDb.query(
							'CALL process_pool(?, ?, ?, ?)',
							[pool_id, 'negative', processed_date, username],
							(error, results, fields) => {
							});

						for (var i=0; i<tests.length; i++) {
							mysqlDb.query(
								'CALL process_test(?,?)',
								[tests[i], 'negative'],
								(error, results, fields) => {
								});
						}
						res.render("successed", {title:"Pool Processed", message:"You have successfully processed the pool"})
					}
				}
			} else {
				console.log("Error!");
			}
		});
})



// Screen 12: Create an Appointment
router.get('/create_appointment', (req, res, next) => {

	var username = req.cookies.username
	var position = req.cookies.position
	var message = String(req.cookies.error)

	console.log(position)

	if (position == "Admin") {
		mysqlDb.query(
			'select distinct site_name as site from site',
			(error, results, fields) => {
				if (results.length > 0) {
					var sites = results;
					error = message
					if (error === 'undefined') { 
						error = ""
					}
					res.clearCookie("error")

					console.log("here!")
					
					res.render('screen12', {title:"Create Appointment", sites:sites, error:error})
				} else {
					console.log("Error!22");
				}
			});
	} else {
		mysqlDb.query(
			'select distinct site from working_at \
			left join site on site_name = site \
			where username = ?',
			[username],
			(error, results, fields) => {
				if (results.length > 0) {
					var sites = results;

					error = message
					if (error === 'undefined') { 
						error = ""
					}
					res.clearCookie("error")
					
					res.render('screen12', {title:"Create Appointment", sites:sites, error:error})
				} else {
					console.log("Error!");
				}
			});
	}
})

router.post('/create_appointment_process', (req, res, next) => {



	var username = req.cookies.username
	var position = req.cookies.position
	var site = req.body.status
	var date = String(req.body.date)
	var time = String(req.body.time)
	var message = "You have created an appointment on " + date + "at " + time + " in " + site;

	console.log(username)
	console.log(position)
	console.log(site)
	console.log(date)
	console.log(time)

	mysqlDb.query(
		'select * from appointment \
		where site_name = ? and appt_date = ? and appt_time = ?',
		[site, date, time],
		(error, results, fields) => {
			if (results.length > 0) {
				res.cookie("error", "Appointment Exist Already. Try Another Time")
				res.redirect('/create_appointment')
			} else {
				mysqlDb.query(
					'CALL create_appointment(?, ?, ?)',
					[site, date, time],
					(error, results, fields) => {
						if (results.length > 0) {
							res.cookie("error", "Cannot Make Appointment. Try Another Time")
							res.redirect('/create_appointment')
						} else {
							res.render("successed", {title:"Congrat!", message:message});
						}
					});
			}
		});

	

	




})


// Screen 13: View Appointments
router.get('/view_appointment', (req, res, next) => {
	var message = String(req.cookies.error)
	var data = [{
		"appt_date": "N/A",
		"appt_time": "N/A",
		"site_name": "N/A",
		"location": "N/A",
		"username": "N/A"
	}]

	mysqlDb.query('select distinct site_name from site',
						(error, results, fields) => {
							if (results.length > 0) {
									var sites = results;
									error = message
									if (error === 'undefined') { 
										error = ""
									}
									res.clearCookie("error")
									res.render('screen13', {title:"View Appointment", sites:sites, data:data, error:error})
								} else {
									console.log("Error!");
								}
						});
})

router.post('/view_appointment_filtered', (req, res, next) => {
	var username = req.cookies.username;
	var testing_site = req.body.sites;
	var start_date = null
	var end_date = null
	var start_time = null
	var end_time = null
	var availability = req.body.availability

	console.log(username)

	if (testing_site == "all") {
		testing_site = null;
	}

	if (availability == "all") {
		availability = null;
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

	mysqlDb.query('CALL view_appointments(?,?,?,?,?,?)',
		[testing_site, start_date, end_date, start_time, end_time, availability],
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
									site_name, location, username from view_appointments_result ORDER BY appt_date',
									(error, results, fields) => {
										if (results.length > 0) {
												data = results
												res.render('screen13', {title:"View Appointment", sites:sites, data:data, error:""})
											} else {
												res.cookie("error","No Appointment Found. Try Again")
												res.redirect("/view_appointment")
											}
									});
								} else {
									console.log("Error!");
								}
						});
})

// Screen 14: Reassign Tester
router.get('/reassign_tester', (req, res, next) => {
	res.send("TODO")
})

// Screen 15: Create a Testing Site
router.get('/create_testing_site', (req, res, next) => {
	var message = String(req.cookies.error)
	console.log(message)
	mysqlDb.query('select * from sitetester;',
	(error, results, fields) => {
		if (results.length > 0) {
			console.log("step 2")
			var tester = results;
			mysqlDb.query('SELECT DISTINCT location FROM student',
				(error, results, fields) => {
					if (results.length > 0) {
						var location = results;
						error = message
						if (error === 'undefined') { 
							error = ""
						}
						res.clearCookie("error")
						res.render('screen15', {title:"Create a Testing Site", loc:location, tester:tester, error:error})
					} else {
						console.log("Error!");
					}
			});
		} else {
			console.log("Error!");
		}
   });
})

router.post('/create_testing_site_process', (req, res, next) => {
	var site = req.body.site_name
	var street = req.body.street
	var city = req.body.city
	var zip = req.body.zip
	var state = req.body.state
	var location = req.body.loc
	var tester = req.body.tester

	const obj = {};
	for (let [key, value] of Object.entries(req.body)) {
		obj[key] = value;
	}
	obj.additionalField = 0;
	console.log(obj)

	mysqlDb.query(
		'select * from site where site_name = ?',
		[site],
		(error, results, fields) => {
			if (results.length > 0) {
				res.cookie("error", "Already Exist. Cannot Create Testing Site." )
				res.redirect('/create_testing_site')
			} else {

				console.log(site)

				mysqlDb.query(
					'CALL create_testing_site(?,?,?,?,?,?,?)',
					[site, street, city, state, zip, location, tester],
					(error, results, fields) => {
						res.render("successed", {title:"Successfully Created New Testing Site", message:"You have successfully Created New Testing Site"})
					});
			}
		});



})

// Screen 16: Explore Pool Result
router.get('/explore_pool_result', (req, res, next) => {
	var pool_id = "1"

	mysqlDb.query(
		'select \
		p.pool_id, \
		pool_status, \
		DATE_FORMAT(process_date, "%m/%d/%Y") as process_date, \
		processed_by, \
		test_id, \
		test_status, \
		appt_site, \
		DATE_FORMAT(appt_date, "%m/%d/%Y") appt_date \
		from pool p \
		left join test t on p.pool_id = t.pool_id \
		where p.pool_id = ?',
		[pool_id],
		(error, results, fields) => {
			if (results.length > 0) {
				var data = results;
				var table = ["Date Processed", "Pool Result", "Processed By"]

				console.log(data)

				res.render('screen16', {title:"Explore Pool Result", data:data, table:table, error:""})
			} else {
				console.log("Error!");
			}
		});
})

// Screen 17: Tester Change Testing Site
router.get('/changing_testing', (req, res, next) => {
	var username = req.cookies.username

	mysqlDb.query(
		'select site from working_at where username = ?',
		[username],
		(error, results, fields) => {
			if (results.length > 0) {
				var site = results;
				mysqlDb.query(
					'select fname, lname from user where username = ?',
					[username],
					(error, results, fields) => {
						if (results.length > 0) {
							var name = results;
							mysqlDb.query(
								'select lower(replace(site_name, " ", "")) as sid , site_name from site',
								(error, results, fields) => {
									if (results.length > 0) {
										var choices = results;
										console.log(results)
										res.render('screen17', {title:"Tester Change Testing Site", username:username, name:name, sites:site, error:"", choices:choices})
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

router.post("/changing_testing_process", (req, res, next) => {

	var username = req.cookies.username
	const obj = {};
	
	for (let [key, value] of Object.entries(req.body)) {
		obj[key] = value;
	}
	obj.additionalField = 0;
	console.log(obj)
	
	const keys = Object.keys(obj)

	mysqlDb.query(
		'delete from working_at where username=?',
		[username],
		(error, results, fields) => {
		});

	for (var i = 0; i<keys.length; i++) {
		var curr_site = keys[i]

		mysqlDb.query(
			'CALL assign_tester(?, ?)',
			[username, curr_site],
			(error, results, fields) => {
			});

	}

	res.render("successed", {title:"Successfully Updated", message:"Your Assigned Testing Sites are Successfully Updated!"})

});

// Screen 18: View Daily Results
router.get('/view_daily_results', (req, res, next) => {
	mysqlDb.query(
		'CALL daily_results()',
		(error, results, fields) => {
		});
	mysqlDb.query(
		'select DATE_FORMAT(process_date, "%m/%d/%Y") as process_date, \
		 num_tests, pos_tests, \
		 concat(pos_percent, " %") as pos_percent \
		 from daily_results_result',
		(error, results, fields) => {
			if (results.length > 0) {
				var data = results;
				res.render('screen18', {title:"View Daily Results", error:"", data:data})
			} else {
				console.log("Error!");
			}
		});
})

// Debugging Screen
router.get('/debug', (req, res, next) => {
	mysqlDb.query('SELECT * FROM student',
  (error, results, fields) => {
   if (results.length > 0) {
	  res.render('debug', {title: "debug only", result:results})
	
	  res.json(results);
	//res.send()
   } else {
     console.log("Error!");
   }		
 });
});

module.exports = router;
