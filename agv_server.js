//Import the necessary libraries/declare the necessary objects
var express = require("express");
var myParser = require("body-parser");
var mysql = require("mysql");

var app = express();
var cmd = '0';
var agv2receive = '0';
var agv2sendrouteid = '0';
var agvResponse = { 'agvnumber': '0', 'command': '0', 'destination': '0', 'clock': '0', 'batchid': '0', 'rework': '0', 'routeid': '0' };
var agvResponseNULL = { 'agvnumber': '0', 'command': '0', 'destination': '0', 'clock': '0', 'batchid': '0', 'rework': '0', 'routeid': '0' };

var agvsArray = [];
var movingArray = [];

var typeID = {'status':'0', 'station_leave':'1', 'station_arrive':'2', 'message':'3'};

let agvKeys = ['xxxyyyzzz', 'qqqwwweee', 'pppwwwddd', 'eeerrrggg'];

// var con = mysql.createConnection({
//     host: "192.168.1.70",
//     user: "esteban",
//     password: "password",
//     database: "testDB"
// });

// con.connect(function(err){
//     if (err) throw err;
//     console.log("Connected to " + con.host + "!");
//     con.query("select * from MyGuests", function(err, result, fields){
//     if (err) throw err;
//     console.log(result);
// });

//middleware
app.use(myParser.urlencoded({ extended: true }));

app.post("/test", function(req, res) {

    var jsonString = JSON.stringify(req.body);

    var strArray = jsonString.split("\"");
    
    if (agvKeys.includes(req.body.key)){
        console.log(jsonString);
        //console.log(agvResponse.src);
        src = strArray[3];

        //receives request from agv
        if (src == "agv") {
            var agvorigin = strArray[11];
            var typeID_agv = strArray[7];
            var moving_agv = strArray[19];

            if (typeID_agv == typeID.status && agvorigin == agv2receive){

                res.send(agvResponse);
                agv2sendrouteid = agv2receive;
                resetJSON(agvResponse);
            }

            else if (typeID_agv == typeID.station_leave && agvorigin == agv2sendrouteid){
                cmd = "SERVER_DATA";
                agvResponse["agvnumber"] = agv2sendrouteid;
                agvResponse["command"] = cmd;
                agvResponse["routeid"] = makeid(7);
                res.send(agvResponse);

                console.log("\nAGV NUMBER #" + agv2sendrouteid + " IS LEAVING " + strArray[23] + ".");
                console.log("\nClock: " + strArray[15] +'\n');
                var batchArray = strArray[19].split(",");
                for (i=1; i<batchArray.length + 1; i++){
                    console.log("Batch #" + i + " = " + batchArray[i-1]);
                }
                console.log("");

                resetJSON(agvResponse);
                agv2sendrouteid = "0";

            }

            else if (typeID_agv == typeID.station_arrive){
                res.send(agvResponse);

                console.log("\nAGV NUMBER #" + strArray[11] + " ARRIVED TO " + strArray[23] + ".");
                console.log("\nClock: " + strArray[15] + '\n');

                var batchArray = strArray[19].split(",");
                for (i=1; i<batchArray.length + 1; i++){
                    console.log("Batch #" + i + " = " + batchArray[i-1]);
                }

                console.log("\nWith Route ID: " + strArray[31] + '\n');

                resetJSON(agvResponse);
            }

            else if (typeID_agv == typeID.message && agvorigin == agv2receive){
                res.send(agvResponse);
                resetJSON(agvResponse);
            }
            
            else {
                res.send(agvResponseNULL);
            }

            if(!agvsArray.includes(agvorigin)){
                agvsArray.push(agvorigin);
                movingArray.push(moving_agv);
                console.log('AGV added!');
            }
            else{
                movingArray[agvsArray.indexOf(agvorigin)] = moving_agv;
            }

            res.end();  
            console.log(makeid(6));
            
            //receives request from manager
        } else if (src == "manager") {

            agv2receive = strArray[7];
            agvResponse["agvnumber"] = agv2receive;

            if (strArray[11] == "STOP") {
                cmd = "STOP";
                agvResponse["command"] = cmd;
                res.end();
            } else if (strArray[11] == "START") {
                agvResponse["command"] = cmd;
                res.end();
            } else if (strArray[11] == "NEW_DESTINATION") {
                cmd = "NEW_DESTINATION";
                agvResponse["command"] = cmd;
                agvResponse["destination"] = strArray[15];
                agvResponse["clock"] = strArray[19];
                agvResponse["batchid"] = strArray[23];
                agvResponse["rework"] = strArray[27];
                res.end();
            } else {
                    res.end();
            }
        } 
    } else {
        res.end();
}

});

app.get('/test', function (req, res) {
    var text = '';
    for (i=0; i<agvsArray.length; i++){
        text += 'AGV ';
        text += agvsArray[i];
        if (movingArray[i] == '1'){
            text += ' is moving.\n';
        }
        else if (movingArray[i] == '0') {
            text += ' is not moving.\n';
        }
    }
    res.send(text);
});


function resetJSON(jsonObj) {
    for (var key in jsonObj) {
        jsonObj[key] = "0";
    }
    agv2receive = "0";
    cmd = "0";
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }


//Start the server and make it listen for connections on port 81
var server = app.listen(81, function() {
    console.log("Server running...");
});