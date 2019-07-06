var express = require('express');
var jquery = require('jquery');
var bodyParser = require('body-parser')
var mqtt = require('mqtt');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));
app.use('/mqtt', express.static(__dirname + '/node_modules/mqtt/dist/'));
app.set('views', './views');
app.set('view engine', 'jade');

var distance = 0;
var light = 0;

var client = mqtt.connect("mqtt://localhost:1883");
client.on("connect", function(){console.log("connected");});

client.on("message", function(topic, message, packet) {
  console.log("Received message:")
  console.log("Topic: " + topic)
  console.log("Payload: " + message)
  if(topic == "mbot/distance"){
    //$("#distanceP").text(message)
    distance = "" + message;
  } else {
    //$("#lightP").text(message)
    light = "" + message;
  }
});

var topics = ["mbot/light","mbot/distance"];
client.subscribe(topics);

global.getDistance = function(){return distance};
global.getLight = function(){return light};

app.get('/', function(req, res) {
  res.render('home', {
    title: 'mBot Control'
  });
});

app.get('/data', function(req,res) {
  res.json({ distance: distance,
             light: light});
});

app.post('/command' , function(req,res) {
  console.log("Received command request: " + res);

  var direction = req.body.direction

  var command = "doMove,"

  switch(direction) {
    case "forward": command += "200,200"; break;
    case "left": command += "0,200"; break;
    case "right": command += "200,0"; break;
    case "back": command += "-200,-200"; break;
    case "stop": command += "0,0"; break;
  }

  client.publish("mbot/command", command, {"qos" : 2});

  // always stop the motor
  //client.publish("mbot/command", "doMove,0,0");

})

app.listen(3000);
