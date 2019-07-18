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


//Start the server and make it listen for connections on port 81
var server = app.listen(81, function() {
    console.log("Server running...");
});
