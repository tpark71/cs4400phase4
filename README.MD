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
cd covidDatabaseProject
nodemon
~~~~

Then using your favorite browser to access localhost:3000

## For Windows Only

* If nodemon throws "cannot be loaded because running scripts is disabled on this system" in Windows,
  open Windows Powershell as administrator and run following:

~~~~
Set-ExecutionPolicy RemoteSigned
~~~~
