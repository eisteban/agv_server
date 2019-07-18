const fs = require('fs');
const express = require("express");
var app = express();

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
const agvResponseNULL = { 
    'agvnumber': '0', 
    'command': '0', 
    'destination': '0', 
    'clock': '0', 
    'batchid': '0', 
    'rework': '0', 
    'routeid': '0' 
};

var agvsArray = [];
var movingArray = [];

var typeID = {'status':'0', 'station_leave':'1', 'station_arrive':'2', 'message':'3'};


//middleware
let mdware = (req, res, next) => {


    if (req.body.src === 'agv'){

        let rawdata = fs.readFileSync('./data/data.json');
        let data = JSON.parse(rawdata);

        for (let i=0; i<data.commands.length; i++){

            if (req.body.AGVNo === data.commands[i].agvnumber){
    
                let agvResponseArray = data.commands.splice(i, 1);
                agvResponse = agvResponseArray[0];
                
                let newdata = {
                    commands: data.commands
                }
    
                fs.writeFileSync('./data/data.json', JSON.stringify(newdata));
            }
    
        }

        // console.log("Resp:", JSON.stringify(agvResponse));
        // console.log("Body:", JSON.stringify(req.body));

        if(agvResponse.agvnumber == "0" && req.body.typeID == "0"){
            res.json(agvResponseNULL);
        } else {
            next();
        }   

    } else {

        res.status(400).json({

            ok: false, 
            message: 'Source not found'
            
        })

    }

   

};


app.post("/agv", mdware, (req, res) => {


   let body = req.body;
   //console.log(body);
   
   let agvorigin = body.AGVNo;
   let typeID_agv = body.typeID;
   let moving_agv = body.moving;

    if (typeID_agv == typeID.status){

        res.json(agvResponse);
        resetJSON(agvResponse);

    }

    else if (typeID_agv == typeID.station_leave){
        cmd = "SERVER_DATA";
        let agvResponseRoute = { 
            'agvnumber': agvorigin, 
            'command': cmd, 
            'destination': '0', 
            'clock': '0', 
            'batchid': '0', 
            'rework': '0', 
            'routeid': makeid(7)
        };
       
        res.json(agvResponseRoute);

        console.log("\nAGV NUMBER #" + body.AGVNo + " IS LEAVING " + body.leavingStation + ".");
        console.log("\nClock: " + body.clock +'\n');
        var batchArray = body.batchID.split(",");
        for (i=1; i<batchArray.length + 1; i++){
            console.log("Batch #" + i + " = " + batchArray[i-1]);
        }
        console.log("");

    }

    else if (typeID_agv == typeID.station_arrive){
        res.send(agvResponse);

        console.log("\nAGV NUMBER #" + body.AGVNo + " ARRIVED TO " + body.arrivingStation + ".");
        console.log("\nClock: " + body.clock + '\n');

        var batchArray = body.batchID.split(",");
        for (i=1; i<batchArray.length + 1; i++){
            console.log("Batch #" + i + " = " + batchArray[i-1]);
        }

        console.log("\nWith Route ID: " + body.routeID + '\n');

        resetJSON(agvResponse);
    }

    else if (typeID_agv == typeID.message){
        res.send(agvResponse);
        resetJSON(agvResponse);
    }
    
    else {
        res.json(agvResponseNULL);
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
    //console.log(makeid(6));


});


app.get('/agv', function (req, res) {
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



module.exports = app;