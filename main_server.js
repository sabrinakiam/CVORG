var express = require('express');
var app = express();

var http = require('http');
var server = http.createServer(app);
var net = require('net');
var netServer = net.createServer();

var WebSocketServer = require('websocket').server;
var HOST = '127.0.0.1';
var PORT = 1234;



app.use(express.static(__dirname + '/public'));


server.listen(PORT, HOST, function() {
	console.log((new Date()) + ' Server listening on ' + HOST + ': ' + PORT);
});

netServer.listen(1111,HOST, function(){
	console.log((new Date()) + ' Server listening for python code on ' + PORT + ': 1111');
});

var sockets = [];

//Function turns on tcp server connection to python code
//when it receives a message from python code, it writes to the socket given value
//still super glitchy, writing correct value to socket but socket end not receiving
function connectPython(value) {
	console.log('--------value is ' + value);
	netServer.on('connection', function(socket) {
	    console.log('PYTHON CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);
	    sockets.push(socket);
	    socket.on('error', function(e) {
	    	console.log('error: ' + e);
	    });

	    // Add a 'data' event handler to this instance of socket
	    socket.on('data', function(data) {
	        console.log('DATA ' + socket.remoteAddress + ': ' + data);
	        if (value == 0)
	        	socket.write('');
	        else {
   		       	socket.write('A Scale value is: ' + value);

	        }
	        console.log('wrote to socket ' + value);
	    });

	    
	    // Add a 'close' event handler to this instance of socket
	    socket.on('close', function(data) {
	        console.log('Socket connection closed... ');
	    });
	});
}

wsServer = new WebSocketServer({
	httpServer: server
});

	//create gradient array, currently a global var
	//used to send images to server
	var img_arr = [];

	var fullval = 255;
	var imsz = 512;

	for (var c = 0; c < imsz; c++) {
		for (var d = 0; d < imsz; d++) {
				//img_arr[c].push(2);
			img_arr.push(255-(fullval * (c+d)/2)/imsz);
		}
	}


	var count = 0;
	var clients = {};

	//changes canvas according to values on switches, returns new array
	function changeCanvas(change_val) {
		var changed_img = [];
		//subtracts a value from image, darkens it
			for (var a = 0; a < imsz*imsz; a++) {
							if (img_arr[a]+change_val > 0)
								changed_img[a]= img_arr[a]-change_val; 
			}
		return changed_img;
	}

//when server connects to client
wsServer.on('request', function(r){
	var connection = r.accept('echo-protocol',r.origin);
	var id = count++;
	clients[id] = connection;

	clients[id].sendUTF(img_arr);
	//server sends client img arr upon loading page

	console.log((new Date()) + ' Connection accepted ' + id);
	//console.log(img_arr);

	//when server receives message from client (ie when someone changes scale val)
	connection.on('message', function(message){
		var msg = message.utf8Data;
		console.log("scale numbers are: " + msg + "------------------------------------------------");

		var return_arr = msg.split(',');
		//change array according to first value in client message
		var updated_array = changeCanvas(+return_arr[0]);

		//updates clients, sends new changed img array
		for (var i in clients) {
			//clients[i].sendUTF('sum is: ' + sum);
			clients[i].sendUTF(updated_array);
		}

		//receiving this message, it connects to the tcp server and passes the first val of the message
		connectPython(return_arr[0]);
	});

	connection.on('close', function(reasonCode, desc) {
		delete clients[id];
		console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected. ');
	});
});

