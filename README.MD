# CS 4400 Phase 4

## Pre-req
- Nodejs
- npm
- mysql

## How to setup

~~~~
cd covidDatabaseProject
npm install
npm install mysql
npm install -g nodemon
~~~~

## How to start

~~~~
nodemon
~~~~

Then using your favorite browser to access localhost:3000

## TODO

- Screen 7 (Only need to implement INSERT)
    - (/sign_up_for_a_test_process)
- Screen 11 (Only need to test whether it works)
- Screen 14
- Sorting table for all required screens
- Need to test the edge cases for all screens


## For Windows Only

* If nodemon throws "cannot be loaded because running scripts is disabled on this system" in Windows,
  open Windows Powershell as administrator and run following:

~~~~
Set-ExecutionPolicy RemoteSigned
~~~~
