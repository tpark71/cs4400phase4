-- CS4400: Introduction to Database Systems
-- Covid Testing Site Datebase Create Queries

DROP DATABASE IF EXISTS covidtest_fall2020;
CREATE DATABASE IF NOT EXISTS covidtest_fall2020;
USE covidtest_fall2020;

DROP TABLE IF EXISTS USER;
CREATE TABLE USER(
    username VARCHAR(40) NOT NULL,
    user_password VARCHAR(40) NOT NULL,
    email VARCHAR(40) NOT NULL,
    fname VARCHAR(40) NOT NULL,
    lname VARCHAR(40) NOT NULL,
    PRIMARY KEY (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS LOCATION;
CREATE TABLE LOCATION(
	location_name varchar(40) NOT NULL,
    PRIMARY KEY (location_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS STUDENT;
CREATE TABLE STUDENT(
    student_username VARCHAR(40) NOT NULL,
    housing_type VARCHAR(20) NOT NULL,
    location VARCHAR(40) NOT NULL,
    PRIMARY KEY (student_username),
    FOREIGN KEY (student_username) REFERENCES USER(username),
    FOREIGN KEY (location) REFERENCES LOCATION(location_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS ADMINISTRATOR;
CREATE TABLE ADMINISTRATOR(
    admin_username VARCHAR(40) NOT NULL,
    PRIMARY KEY (admin_username),
    FOREIGN KEY (admin_username) REFERENCES USER(username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS EMPLOYEE;
CREATE TABLE EMPLOYEE(
    emp_username VARCHAR(40) NOT NULL,
    phone_num VARCHAR(10) NOT NULL,
    PRIMARY KEY (emp_username),
    FOREIGN KEY (emp_username) REFERENCES USER(username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS LABTECH;
CREATE TABLE LABTECH(
    labtech_username VARCHAR(40) NOT NULL,
    PRIMARY KEY (labtech_username),
    FOREIGN KEY (labtech_username) REFERENCES EMPLOYEE(emp_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS SITETESTER;
CREATE TABLE SITETESTER(
	sitetester_username varchar(20) NOT NULL,
    PRIMARY KEY (sitetester_username),
    FOREIGN KEY (sitetester_username) REFERENCES EMPLOYEE(emp_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS SITE;
CREATE TABLE SITE(
	site_name varchar(40) NOT NULL,
    street varchar(40) NOT NULL,
    city varchar(40) NOT NULL,
	state char(2) NOT NULL,
    zip char(5) NOT NULL,
    location varchar(40) NOT NULL,
    PRIMARY KEY (site_name),
    FOREIGN KEY (location) REFERENCES LOCATION(location_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS WORKING_AT;
CREATE TABLE WORKING_AT(
	username varchar(20) NOT NULL,
    site varchar(40) NOT NULL,
    PRIMARY KEY (username, site),
    FOREIGN KEY (username) REFERENCES SITETESTER(sitetester_username),
    FOREIGN KEY (site) REFERENCES SITE(site_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS POOL;
CREATE TABLE POOL(
	pool_id varchar(10) NOT NULL,
    pool_status varchar(20) NOT NULL,
    process_date date,
    processed_by varchar(40),
    PRIMARY KEY (pool_id),
    FOREIGN KEY (processed_by) REFERENCES LABTECH(labtech_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS APPOINTMENT;
CREATE TABLE APPOINTMENT(
  username varchar(40),
  site_name varchar(40) NOT NULL,
  appt_date date NOT NULL,
  appt_time time NOT NULL,
  PRIMARY KEY (site_name, appt_date, appt_time),
  FOREIGN KEY (username) REFERENCES STUDENT(student_username),
  FOREIGN KEY (site_name) REFERENCES SITE(site_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS TEST;
CREATE TABLE TEST(
	test_id varchar(7) NOT NULL,
    test_status varchar(10) NOT NULL,
    pool_id varchar(10),
    appt_site varchar(40) NOT NULL,
    appt_date date NOT NULL,
    appt_time time NOT NULL,
	PRIMARY KEY (test_id),
    FOREIGN KEY (pool_id) REFERENCES POOL(pool_id),
    FOREIGN KEY (appt_site, appt_date, appt_time) REFERENCES APPOINTMENT(site_name, appt_date, appt_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;