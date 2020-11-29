/*
CS4400: Introduction to Database Systems
Fall 2020
Phase III Template

Team 49
Taejoon Park (tpark71)
Jeonghoon Lee (jlee3688)

Directions:
Please follow all instructions from the Phase III assignment PDF.
This file must run without error for credit.
*/


-- ID: 2a
-- Author: lvossler3
-- Name: register_student
DROP PROCEDURE IF EXISTS register_student;
DELIMITER //
CREATE PROCEDURE register_student(
		IN i_username VARCHAR(40),
        IN i_email VARCHAR(40),
        IN i_fname VARCHAR(40),
        IN i_lname VARCHAR(40),
        IN i_location VARCHAR(40),
        IN i_housing_type VARCHAR(20),
        IN i_password VARCHAR(40)
)
BEGIN

-- Type solution below
  IF(i_username not in (select username from user) 
  and (i_email like '_%@_%._%') 
  AND (length(i_email) >= 5) 
  AND (length(i_email) <= 25)
  and (length(i_password) >= 8)
  and (concat(i_fname, i_lname) not in (select concat(fname, lname) from user))
  and (i_username is not null)
  and (i_fname is not null)
  and (i_lname is not null)
  and (i_password is not null)) THEN
    insert into user values (i_username, MD5(i_password), i_email, i_fname, i_lname);       
    insert into student values (i_username, i_housing_type, i_location);
END IF;
-- End of solution
END //
DELIMITER ;

-- ID: 2b
-- Author: lvossler3
-- Name: register_employee
DROP PROCEDURE IF EXISTS register_employee;
DELIMITER //
CREATE PROCEDURE register_employee(
		IN i_username VARCHAR(40),
        IN i_email VARCHAR(40),
        IN i_fname VARCHAR(40),
        IN i_lname VARCHAR(40),
        IN i_phone VARCHAR(10),
        IN i_labtech BOOLEAN,
        IN i_sitetester BOOLEAN,
        IN i_password VARCHAR(40)
)
BEGIN
-- Type solution below


    IF((i_username not in (select username from user)) 
    and (i_labtech or i_siteTester) 
    and (i_email like '_%@_%._%') 
    AND (length(i_email) >= 5) 
    AND (length(i_email) <= 25)
    and (length(i_password) >= 8)
    and (concat(i_fname, i_lname) not in (select concat(fname, lname) from user))
    and (i_username is not null)
    and (i_fname is not null)
    and (i_lname is not null)
    and (i_password is not null)) THEN
		insert into user values (i_username, MD5(i_password), i_email, i_fname, i_lname);
        insert into employee values (i_username, i_phone);
        
        
		IF (i_labtech) 
		THEN insert into labtech values (i_username);
		END IF;
		
		IF (i_sitetester) 
		THEN insert into sitetester values (i_username);
		END IF;
        
        
	END IF;
END //
DELIMITER ;

-- ID: 4a
-- Author: Aviva Smith
-- Name: student_view_results
DROP PROCEDURE IF EXISTS `student_view_results`;
DELIMITER //
CREATE PROCEDURE `student_view_results`(
    IN i_student_username VARCHAR(50),
	IN i_test_status VARCHAR(50),
	IN i_start_date DATE,
    IN i_end_date DATE
)
BEGIN
	DROP TABLE IF EXISTS student_view_results_result;
    CREATE TABLE student_view_results_result(
        test_id VARCHAR(7),
        timeslot_date date,
        date_processed date,
        pool_status VARCHAR(40),
        test_status VARCHAR(40)
    );
    INSERT INTO student_view_results_result

    -- Type solution below

		SELECT t.test_id, t.appt_date, p.process_date, p.pool_status , t.test_status
        FROM Appointment a
            LEFT JOIN Test t
                ON t.appt_date = a.appt_date
                AND t.appt_time = a.appt_time
                AND t.appt_site = a.site_name
            LEFT JOIN Pool p
                ON t.pool_id = p.pool_id
        WHERE i_student_username = a.username
            AND (i_test_status = t.test_status OR i_test_status IS NULL)
            AND (i_start_date <= t.appt_date OR i_start_date IS NULL)
            AND (i_end_date >= t.appt_date OR i_end_date IS NULL);

    -- End of solution
END //
DELIMITER ;

-- ID: 5a
-- Author: asmith457
-- Name: explore_results
DROP PROCEDURE IF EXISTS explore_results;
DELIMITER $$
CREATE PROCEDURE explore_results (
    IN i_test_id VARCHAR(7))
BEGIN
    DROP TABLE IF EXISTS explore_results_result;
    CREATE TABLE explore_results_result(
        test_id VARCHAR(7),
        test_date date,
        timeslot time,
        testing_location VARCHAR(40),
        date_processed date,
        pooled_result VARCHAR(40),
        individual_result VARCHAR(40),
        processed_by VARCHAR(80)
    );
    INSERT INTO explore_results_result

    -- Type solution below

		SELECT
			t.test_id,
			a.appt_date as test_date,
			a.appt_time as timeslot,
			site_name as testing_location,
			p.process_date as date_processed,
			p.pool_status as pooled_result,
			t.test_status as individual_result,
			CONCAT(u.fname, " ", u.lname) as processed_by
		From Test t
		left join Appointment a
			ON t.appt_date = a.appt_date
			AND t.appt_time = a.appt_time
			AND t.appt_site = a.site_name
		left join (Pool p LEFT JOIN user u ON p.processed_by = u.username)
			ON t.pool_id = p.pool_id
		WHERE test_id = i_test_id;

    -- End of solution
END$$
DELIMITER ;

-- ID: 6a
-- Author: asmith457
-- Name: aggregate_results
DROP PROCEDURE IF EXISTS aggregate_results;
DELIMITER $$
CREATE PROCEDURE aggregate_results(
    IN i_location VARCHAR(50),
    IN i_housing VARCHAR(50),
    IN i_testing_site VARCHAR(50),
    IN i_start_date DATE,
    IN i_end_date DATE)
BEGIN
    DROP TABLE IF EXISTS aggregate_results_result;
    CREATE TABLE aggregate_results_result(
        test_status VARCHAR(40),
        num_of_test INT,
        percentage DECIMAL(6,2)
    );

    INSERT INTO aggregate_results_result

    -- Type solution below

		select t.test_status, count(*), format((count(*) / (
			select count(*) from student s
			left join (appointment a LEFT JOIN Test t 
				ON t.appt_date = a.appt_date
				AND t.appt_time = a.appt_time
				AND t.appt_site = a.site_name
				) on a.username = s.student_username
			left join location l
			on s.location = l.location_name
			where 
				(l.location_name = i_location or i_location is NULL)
				and
				(s.housing_type = i_housing or i_housing is NULL)
				and
				(t.appt_site = i_testing_site or i_testing_site is null)
				and
				(a.appt_date >= i_start_date or i_start_date is null)
				and
				(a.appt_date <= i_end_date or i_end_date is null)
			) * 100), 2)
		from student s
		left join (appointment a LEFT JOIN Test t 
			ON t.appt_date = a.appt_date
			AND t.appt_time = a.appt_time
			AND t.appt_site = a.site_name
			) on a.username = s.student_username
		left join location l
		on s.location = l.location_name
		where 
            (l.location_name = i_location or i_location is NULL)
			and
			(s.housing_type = i_housing or i_housing is NULL)
			and
			(t.appt_site = i_testing_site or i_testing_site is null)
			and
			(a.appt_date >= i_start_date or i_start_date is null)
			and
			(a.appt_date <= i_end_date or i_end_date is null)
		group by t.test_status;
        
    -- End of solution
END$$
DELIMITER ;


-- ID: 7a
-- Author: lvossler3
-- Name: test_sign_up_filter
DROP PROCEDURE IF EXISTS test_sign_up_filter;
DELIMITER //
CREATE PROCEDURE test_sign_up_filter(
    IN i_username VARCHAR(40),
    IN i_testing_site VARCHAR(40),
    IN i_start_date date,
    IN i_end_date date,
    IN i_start_time time,
    IN i_end_time time)
BEGIN
    DROP TABLE IF EXISTS test_sign_up_filter_result;
    CREATE TABLE test_sign_up_filter_result(
        appt_date date,
        appt_time time,
        street VARCHAR (40),
        city VARCHAR(40),
        state VARCHAR(2),
        zip VARCHAR(5),
        site_name VARCHAR(40));
    INSERT INTO test_sign_up_filter_result

    -- Type solution below
    
	select a.appt_date, a.appt_time, s.street, s.city, s.state, s.zip, a.site_name from appointment a
	left join site s
    ON a.site_name = s.site_name
	WHERE
		(a.username is NULL)
		and
		(a.site_name = i_testing_site or i_testing_site is NULL)
		and
		(a.appt_date >= i_start_date or i_start_date is NULL)
		and
		(a.appt_date <= i_end_date or i_end_date is NULL)
		and
		(a.appt_time >= i_start_time or i_start_time is NULL)
		and
		(a.appt_time <= i_end_time or i_end_time is NULL)
        and
        (s.location = (select location from student where student_username = i_username))
        ;

    -- End of solution

    END //
    DELIMITER ;

-- ID: 7b
-- Author: lvossler3
-- Name: test_sign_up
DROP PROCEDURE IF EXISTS test_sign_up;
DELIMITER //
CREATE PROCEDURE test_sign_up(
		IN i_username VARCHAR(40),
        IN i_site_name VARCHAR(40),
        IN i_appt_date date,
        IN i_appt_time time,
        IN i_test_id VARCHAR(7)
)
BEGIN
-- Type solution below
	IF ((i_site_name, i_appt_date, i_appt_time) in (select site_name, appt_date, appt_time from appointment))
    THEN
		IF ((i_test_id not in (select test_id from test)) AND ((i_site_name, i_appt_date, i_appt_time) not in (
				Select a.site_name, a.appt_date, a.appt_time from appointment a
				LEFT JOIN Test t 
						ON t.appt_date = a.appt_date
						AND t.appt_time = a.appt_time
						AND t.appt_site = a.site_name
				WHERE
					(a.username is not null)
					or
					(test_status = 'pending')))
			AND 'pending' not in (select t.test_status from student s
			left join (appointment a LEFT JOIN Test t 
				ON t.appt_date = a.appt_date
				AND t.appt_time = a.appt_time
				AND t.appt_site = a.site_name
				) on a.username = s.student_username where s.student_username = i_username))
        THEN 
			update appointment set username = i_username where (site_name = i_site_name) and (appt_date = i_appt_date) and (appt_time = i_appt_time);
            insert into test(test_id, test_status, pool_id, appt_site, appt_date, appt_time) values (i_test_id, 'pending', NULL, i_site_name, i_appt_date, i_appt_time);
        END IF;
    END IF;

-- End of solution
END //
DELIMITER ;

-- Number: 8a
-- Author: lvossler3
-- Name: tests_processed
DROP PROCEDURE IF EXISTS tests_processed;
DELIMITER //
CREATE PROCEDURE tests_processed(
    IN i_start_date date,
    IN i_end_date date,
    IN i_test_status VARCHAR(10),
    IN i_lab_tech_username VARCHAR(40))
BEGIN
    DROP TABLE IF EXISTS tests_processed_result;
    CREATE TABLE tests_processed_result(
        test_id VARCHAR(7),
        pool_id VARCHAR(10),
        test_date date,
        process_date date,
        test_status VARCHAR(10) );
    INSERT INTO tests_processed_result
    -- Type solution below

        select test_id, pool_id, appt_date as test_date, process_date, test_status
        from test 
		natural join pool
        where (processed_by = i_lab_tech_username or i_lab_tech_username is NULL)
        and (test_status = i_test_status or i_test_status is NULL)
        and (appt_date >= i_start_date or i_start_date is NULL)
        and (appt_date <= i_end_date or i_end_date is NULL)
        and (test_status != 'pending');
        
        
    -- End of solution
    END //
    DELIMITER ;

-- ID: 9a
-- Author: ahatcher8@
-- Name: view_pools
DROP PROCEDURE IF EXISTS view_pools;
DELIMITER //
CREATE PROCEDURE view_pools(
    IN i_begin_process_date DATE,
    IN i_end_process_date DATE,
    IN i_pool_status VARCHAR(20),
    IN i_processed_by VARCHAR(40)
)
BEGIN
    DROP TABLE IF EXISTS view_pools_result;
    CREATE TABLE view_pools_result(
        pool_id VARCHAR(10),
        test_ids VARCHAR(100),
        date_processed DATE,
        processed_by VARCHAR(40),
        pool_status VARCHAR(20));

    INSERT INTO view_pools_result
-- Type solution below
	SELECT 
		p.pool_id, 
        group_concat(test_id separator ' , ') as test_ids, 
        p.process_date as date_processed, 
        p.processed_by, 
        p.pool_status
	FROM pool p
    left join test t
    on p.pool_id = t.pool_id
    where 
		((p.process_date >= i_begin_process_date or p.process_date is NULL) or (i_begin_process_date is NULL))
		and
		(p.process_date <= i_end_process_date or i_end_process_date is NULL)
		and
		(p.pool_status = i_pool_status or i_pool_status is null)
		and
		(p.processed_by = i_processed_by or i_processed_by is null)
    group by p.pool_id;
    
-- End of solution
END //
DELIMITER ;

-- ID: 10a
-- Author: ahatcher8@
-- Name: create_pool
DROP PROCEDURE IF EXISTS create_pool;
DELIMITER //
CREATE PROCEDURE create_pool(
	IN i_pool_id VARCHAR(10),
    IN i_test_id VARCHAR(7)
)
BEGIN
-- Type solution below
	if (i_pool_id not in (select pool_id from pool))
		THEN
		if (i_test_id in (select test_id from test))
			THEN if ((select pool_id from test where i_test_id = test_id) is NULL)
				THEN 
					insert into pool(pool_id, pool_status) value (i_pool_id, "pending");
					update test set pool_id = i_pool_id where i_test_id = test_id;
			END IF;
		END IF;
	END IF;
END //
DELIMITER ;

-- ID: 10b
-- Author: ahatcher8@
-- Name: assign_test_to_pool
DROP PROCEDURE IF EXISTS assign_test_to_pool;
DELIMITER //
CREATE PROCEDURE assign_test_to_pool(
    IN i_pool_id VARCHAR(10),
    IN i_test_id VARCHAR(7)
)
BEGIN
-- Type solution below
	if (i_pool_id in (select pool_id from pool))
		THEN if ((select count(*) from test where pool_id = i_pool_id) < 7 and (select pool_id from test where i_test_id = test_id) is NULL)
			THEN update test set pool_id = i_pool_id where i_test_id = test_id;
		END IF;
    END IF;
-- End of solution
END //
DELIMITER ;

-- ID: 11a
-- Author: ahatcher8@
-- Name: process_pool
DROP PROCEDURE IF EXISTS process_pool;
DELIMITER //
CREATE PROCEDURE process_pool(
    IN i_pool_id VARCHAR(10),
    IN i_pool_status VARCHAR(20),
    IN i_process_date DATE,
    IN i_processed_by VARCHAR(40)
)
BEGIN
-- Type solution below

    SELECT pool_status
    INTO @curr_status
    FROM POOL
    WHERE pool_id = i_pool_id;

    IF
        ((@curr_status = 'pending') AND (i_pool_status = 'positive' OR i_pool_status = 'negative'))
    THEN
        UPDATE POOL
        SET pool_status = i_pool_status, process_date = i_process_date, processed_by = i_processed_by
        WHERE pool_id = i_pool_id;
    END IF;


-- End of solution
END //
DELIMITER ;

-- ID: 11b
-- Author: ahatcher8@
-- Name: process_test
DROP PROCEDURE IF EXISTS process_test;
DELIMITER //
CREATE PROCEDURE process_test(
    IN i_test_id VARCHAR(7),
    IN i_test_status VARCHAR(20)
)
BEGIN
-- Type solution below

SELECT test_status
INTO @curr_status
FROM test
WHERE test_id = i_test_id;

SELECT pool_status
INTO @pool_status
FROM pool
WHERE pool_id = (select pool_id from test where test_id = i_test_id);

if (i_test_id in (select test_id from test))
	THEN if (@pool_status != 'pending')
		THEN if (@curr_status = 'pending')
-- 			THEN if (not (i_test_status = 'positve' and @pool_status = 'negative'))
-- 				THEN update test set test_status = i_test_status where test_id = i_test_id;
-- 			END IF;
			THEN if ((not (i_test_status = 'positive' and @pool_status = 'negative')) and (i_test_status = 'positive' or i_test_status = "negative"))
				THEN update test set test_status = i_test_status where test_id = i_test_id;
			END IF;
        END IF;
	END IF;
END IF;


-- End of solution
END //
DELIMITER ;

-- ID: 12a
-- Author: dvaidyanathan6
-- Name: create_appointment

DROP PROCEDURE IF EXISTS create_appointment;
DELIMITER //
CREATE PROCEDURE create_appointment(
	IN i_site_name VARCHAR(40),
    IN i_date DATE,
    IN i_time TIME
)
BEGIN
-- Type solution below

if (i_site_name in (select site from working_at))
	THEN
	select count(*)
	into @total_num
	from working_at
	where site = i_site_name;
    
	select count(*)
    INTO @curr_num
    from appointment
    where site_name = i_site_name and appt_date = i_date;
    
	IF ((i_site_name, i_date, i_time) not in (select site_name, appt_date, appt_time from appointment))
    	THEN if (@total_num*10 > @curr_num)
			THEN insert into appointment(site_name, appt_date, appt_time) value (i_site_name, i_date, i_time);
		END IF;
	END IF;
END IF;
-- End of solution
END //
DELIMITER ;

-- ID: 13a
-- Author: dvaidyanathan6@
-- Name: view_appointments
DROP PROCEDURE IF EXISTS view_appointments;
DELIMITER //
CREATE PROCEDURE view_appointments(
    IN i_site_name VARCHAR(40),
    IN i_begin_appt_date DATE,
    IN i_end_appt_date DATE,
    IN i_begin_appt_time TIME,
    IN i_end_appt_time TIME,
    IN i_is_available INT  -- 0 for "booked only", 1 for "available only", NULL for "all"
)
BEGIN
    DROP TABLE IF EXISTS view_appointments_result;
    CREATE TABLE view_appointments_result(

        appt_date DATE,
        appt_time TIME,
        site_name VARCHAR(40),
        location VARCHAR(40),
        username VARCHAR(40));

    INSERT INTO view_appointments_result
-- Type solution below

    SELECT a.appt_date, a.appt_time, a.site_name, s.location, a.username FROM appointment a
    left join test t
    ON t.appt_date = a.appt_date
		AND t.appt_time = a.appt_time
		AND t.appt_site = a.site_name
	left join site s
    ON  s.site_name = a.site_name
    WHERE
		(i_site_name = a.site_name or i_site_name is NULL)
        and
        (i_begin_appt_date <= a.appt_date or i_begin_appt_date is NULL)
        and
        (i_end_appt_date >= a.appt_date or i_end_appt_date is NULL)
        and
        (i_begin_appt_time <= a.appt_time or i_begin_appt_time is NULL)
        and
        (i_end_appt_time >= a.appt_time or i_end_appt_time is NULL)
        and
        (
        case 
			when (i_is_available = 0)
				THEN a.username like "%"
			when (i_is_available = 1)
				THEN a.username is NULL
 			when (i_is_available is Null)
 				Then (a.username like '%' or a.username is null)
        END
        )
        ;

-- End of solution
END //
DELIMITER ;


-- ID: 14a
-- Author: kachtani3@
-- Name: view_testers
DROP PROCEDURE IF EXISTS view_testers;
DELIMITER //
CREATE PROCEDURE view_testers()
BEGIN
    DROP TABLE IF EXISTS view_testers_result;
    CREATE TABLE view_testers_result(

        username VARCHAR(40),
        name VARCHAR(80),
        phone_number VARCHAR(10),
        assigned_sites VARCHAR(255));

    INSERT INTO view_testers_result
-- Type solution below
    select 
		s.sitetester_username, 
        CONCAT(u.fname, ' ', u.lname) as name,
        e.phone_num,
        group_concat(site separator ' , ') as assigned_sites
	from sitetester s
    left join (working_at w) on s.sitetester_username = w.username
    left join employee e on s.sitetester_username = e.emp_username
    left join user u on u.username = s.sitetester_username
    group by s.sitetester_username;
-- End of solution
END //
DELIMITER ;

-- ID: 15a
-- Author: kachtani3@
-- Name: create_testing_site
DROP PROCEDURE IF EXISTS create_testing_site;
DELIMITER //
CREATE PROCEDURE create_testing_site(
	IN i_site_name VARCHAR(40),
    IN i_street varchar(40),
    IN i_city varchar(40),
    IN i_state char(2),
    IN i_zip char(5),
    IN i_location varchar(40),
    IN i_first_tester_username varchar(40)
)
BEGIN
-- Type solution below
	if (i_site_name not in (select site_name from site))
		THEN 
			insert into site(site_name, street, city, state, zip, location) value (i_site_name, i_street, i_city, i_state, i_zip, i_location);
			insert into working_at(username, site) value (i_first_tester_username, i_site_name);
    End if;
    
-- End of solution
END //
DELIMITER ;

-- ID: 16a
-- Author: kachtani3@
-- Name: pool_metadata
DROP PROCEDURE IF EXISTS pool_metadata;
DELIMITER //
CREATE PROCEDURE pool_metadata(
    IN i_pool_id VARCHAR(10))
BEGIN
    DROP TABLE IF EXISTS pool_metadata_result;
    CREATE TABLE pool_metadata_result(
        pool_id VARCHAR(10),
        date_processed DATE,
        pooled_result VARCHAR(20),
        processed_by VARCHAR(100));

    INSERT INTO pool_metadata_result
-- Type solution below

    SELECT pool_id, process_date as date_processed, pool_status as pooled_result, CONCAT(u.fname, u.lname) FROM pool p
    left join user u on p.processed_by = u.username
    where pool_id = i_pool_id;

-- End of solution
END //
DELIMITER ;

-- ID: 16b
-- Author: kachtani3@
-- Name: tests_in_pool
DROP PROCEDURE IF EXISTS tests_in_pool;
DELIMITER //
CREATE PROCEDURE tests_in_pool(
    IN i_pool_id VARCHAR(10))
BEGIN
    DROP TABLE IF EXISTS tests_in_pool_result;
    CREATE TABLE tests_in_pool_result(
        test_id varchar(7),
        date_tested DATE,
        testing_site VARCHAR(40),
        test_result VARCHAR(20));

    INSERT INTO tests_in_pool_result
-- Type solution below
    SELECT test_id, appt_date as date_tested, appt_site as testing_site, test_status as test_result FROM test
    where pool_id = i_pool_id;
-- End of solution
END //
DELIMITER ;

-- ID: 17a
-- Author: kachtani3@
-- Name: tester_assigned_sites
DROP PROCEDURE IF EXISTS tester_assigned_sites;
DELIMITER //
CREATE PROCEDURE tester_assigned_sites(
    IN i_tester_username VARCHAR(40))
BEGIN
    DROP TABLE IF EXISTS tester_assigned_sites_result;
    CREATE TABLE tester_assigned_sites_result(
        site_name VARCHAR(40));

    INSERT INTO tester_assigned_sites_result
-- Type solution below

    SELECT site as site_name FROM working_at
    where username = i_tester_username;

-- End of solution
END //
DELIMITER ;

-- ID: 17b
-- Author: kachtani3@
-- Name: assign_tester
DROP PROCEDURE IF EXISTS assign_tester;
DELIMITER //
CREATE PROCEDURE assign_tester(
	IN i_tester_username VARCHAR(40),
    IN i_site_name VARCHAR(40)
)
BEGIN
-- Type solution below

if (i_tester_username in (select s.sitetester_username from sitetester s)
	and
    i_site_name in (select site_name from site)
    and
    (i_tester_username, i_site_name) not in (select username, site from working_at)
    )
	THEN
		insert into working_at(username, site) value (i_tester_username, i_site_name);
end if;

-- End of solution
END //
DELIMITER ;


-- ID: 17c
-- Author: kachtani3@
-- Name: unassign_tester
DROP PROCEDURE IF EXISTS unassign_tester;
DELIMITER //
CREATE PROCEDURE unassign_tester(
	IN i_tester_username VARCHAR(40),
    IN i_site_name VARCHAR(40)
)
BEGIN
-- Type solution below

	if (i_tester_username in (select username from working_at where site = i_site_name))
		THEN
			SELECT count(*)
            INTO @curr_tester
			FROM working_at
			where site = i_site_name;
			if (@curr_tester > 1)
				THEN delete from working_at where username = i_tester_username and site = i_site_name;
			end if;
    end if;
-- End of solution
END //
DELIMITER ;


-- ID: 18a
-- Author: lvossler3
-- Name: daily_results
DROP PROCEDURE IF EXISTS daily_results;
DELIMITER //
CREATE PROCEDURE daily_results()
BEGIN
	DROP TABLE IF EXISTS daily_results_result;
    CREATE TABLE daily_results_result(
		process_date date,
        num_tests int,
        pos_tests int,
        pos_percent DECIMAL(6,2));
	INSERT INTO daily_results_result
    -- Type solution below
   
    SELECT 
		p.process_date, @num_tests := count(*) as num_tests, 
		IFNULL((
			SELECT count(*)
            FROM test t	
            left join pool po
            on po.pool_id = t.pool_id
			where 
				po.process_date = p.process_date
				and
				t.test_status = 'positive'
			group by p.process_date), 0) as pos_tests,
            FORMAT((
            IFNULL((
			SELECT count(*)
            FROM test t	
            left join pool po
            on po.pool_id = t.pool_id
			where 
				po.process_date = p.process_date
				and
				t.test_status = 'positive'
			group by p.process_date), 0) / count(*) * 100          
            ), 2) as pos_percent
    FROM test t
    left join pool p on p.pool_id = t.pool_id
    where 
		p.process_date is not null
    group by p.process_date;
    
    -- End of solution
    END //
    DELIMITER ;














