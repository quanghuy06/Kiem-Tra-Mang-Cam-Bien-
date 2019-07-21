var mysql = require('mysql');
var mqtt  = require('mqtt');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
app.set('view engine', 'html');
app.set('views', __dirname ) 
app.engine('html', require('ejs').renderFile);

var count = 0;
var client = mqtt.connect("mqtt://localhost:1883",{username:"huytq",password:"Quanghuy@123"});
var topic1 = "DHT11";

var server = app.listen(3000, () => { //Start the server, listening on port 3000.
    console.log("Conect to requests on port 3000...");
})

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'huytq',
	password : 'Quanghuy@123',
	database : 'wsn'
});

connection.connect(function(err) {
	if (err) 
		throw err;
	console.log("mysql connected");
	var sql ="DROP TABLE IF EXISTS sensors";
	connection.query(sql, function(err, result){
		if (err) 
			throw err;
		console.log("drop tables sensors ok");
	});
	sql = "CREATE TABLE sensors( id INT(10) PRIMARY KEY  auto_increment, room char(10), temp char(10), hum char(10), time datetime)"
	connection.query(sql, function(err, result){
		if (err) 
			throw err;
		console.log("create tables sensors ok");
	});
});


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use((request, response, next) => {
  console.log(request.headers)
  next()
})

app.use((request, response, next) => {
  request.chance = Math.random()
  next()
})
app.use(express.static('public')); //Send index.html page on GET /

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/home', (request, response) => {
	if (request.session.loggedin) {
		  connection.query("SELECT * FROM sensors", function (err, result, fields) {
		  if (err) throw err;
		  response.sendFile(path.join(__dirname + '/index.html'));
		});
	}else {
		response.send('Please login to view this page!!');
		response.end();
	}
	
})


app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('No Connect Account!');

			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

var mqtt_server = "mqtt://localhost"
var mqtt = require("mqtt"); 

var option = {
	username: "huytq",
	password: "Quanghuy@123",
	clean: true
};

var client = mqtt.connect(mqtt_server, option);

client.on("connect", function (){
    console.log("Connected to MQTT server!");
});

client.on("connect", function () {
   client.subscribe("DHT11");
});



function getDateTimeNow() {
    var date = new Date();
    timenow = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return timenow;
};


var io = require('socket.io')(server); //Bind socket.io to our express server.

//app.use(express.static('public')); //Send index.html page on GET /

io.on('connection', (socket) => {
    console.log("Someone connected."); //show a log as a new client connects.
	 connection.query("SELECT * FROM sensors WHERE room='1' ", function (err, result, fields) {
	 if (err) throw err;
	 result.forEach(function(value) {
	 var m_time = value.time.toString().slice(4,24);
	//console.log(m_time);
    io.sockets.emit('tem', {time:m_time , temp:value.temp,hum:value.hum,room:value.room}); 
	 });
	 
	});
	
})
var Temp ;
var Hum ;
var room ; 

client.on('message',function(topic, message){
	console.log("message is "+ message);
	console.log("topic is "+ topic);
	//message = JSON.parse(message);
	if( topic == topic1){
		data = message.toString();
		a = JSON.parse(data);
		room = a.room;
		Temp = a.Temperature;
		Hum = a.Humidity;
	}
		console.log(room,Temp,Hum);

		console.log("ready to save");
		var time = getDateTimeNow();
		let query = "INSERT INTO `sensors` (room,temp,hum,time) VALUES ( '"+ room + "', '" + Temp + "', '"+ Hum + "','"+ time +"')";
			connection.query(query, (err, result) => {
		    if (err) {
		        throw err;
		    }
		});
		if(room == 1){
    		io.sockets.emit('temp', {time:time , temp:Temp,hum:Hum,room:room});
    	} 
});

client.on("connect",function(){	
	console.log("connected  "+ client.connected);
});

//handle errors
client.on("error",function(error){
console.log("Can't connect" + error);
process.exit(1)});
