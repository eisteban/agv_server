//Import the necessary libraries/declare the necessary objects
const express = require("express");
const myParser = require("body-parser");
const mongoose = require('mongoose');
//var mysql = require("mysql");

var app = express();

//middleware
app.use(myParser.urlencoded({ extended: true }));
app.use(require('./routes/agv'));
app.use(require('./routes/manager'));

var cmd = '0';
var agv2receive = '0';
var agv2sendrouteid = '0';
var agvResponse = { 
    'agvnumber': '0', 
    'command': '0',
    'destination': '0', 
    'clock': '0', 
    'batchid': '0', 
    'rework': '0', 
    'routeid': '0' 
};
var agvResponseNULL = { 
    'agvnumber': '0', 
    'command': '0', 
    'destination': '0', 
    'clock': '0', 
    'batchid': '0', 
    'rework': '0', 
    'routeid': '0' 
};


//Start the server and make it listen for connections on port 81
var server = app.listen(81, function() {
    console.log("Server running...");
});

module.export = {

    agvResponse,
    agv2receive

}