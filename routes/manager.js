const fs = require('fs');
const express = require("express");
let app = express();

let rawdata = fs.readFileSync('./data/data.json');
let cmdsArray = JSON.parse(rawdata);

//middleware
let mdware = (req, res, next) => {

    //console.log(req.body);
    if (req.body.src === 'manager'){

        next();

    } else {

        res.status(400).json({

            ok: false, 
            message: 'Source not found'
            
        })

    }
   

};

app.post('/manager', mdware,  (req, res) => {

    let body = req.body;
    let agvResponse = { 
        'agvnumber': '0', 
        'command': '0', 
        'destination': '0', 
        'clock': '0', 
        'batchid': '0', 
        'rework': '0', 
        'routeid': '0' 
    };
    let agv2receive = '0';

    agv2receive = body.agv;
    agvResponse.agvnumber = agv2receive;

    if (body.command == "STOP") {
        cmd = "STOP";
        agvResponse.command = cmd;

        grabarArchivo(agvResponse);

        res.status(200).json({
            ok: true
        });

    } else if (body.command == "START") {
        cmd = "START";
        agvResponse.command = cmd;

        grabarArchivo(agvResponse);

        res.status(200).json({
            ok: true
        });

    } else if (body.command == "NEW_DESTINATION") {
        cmd = "NEW_DESTINATION";
        agvResponse.command = cmd;
        agvResponse.destination = body.destination;
        agvResponse.clock = body.clock;
        agvResponse.batchid = body.batchid;
        agvResponse.rework = body.rework;

        grabarArchivo(agvResponse);

        res.status(200).json({
            ok: true
        });

    } else {
            res.status(404).json({
                ok: false,
                message: 'Command not found'
            });
    }

 

});

function grabarArchivo(resp) {

    cmdsArray.commands.push(resp);
    
    let jsonDataString = JSON.stringify(cmdsArray);

    fs.writeFileSync('./data/data.json', jsonDataString);

}



module.exports = app;
