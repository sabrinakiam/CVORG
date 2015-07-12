# CVORG


To run:

	run node main_server.js
	in web browser, go to localhost:1234
	Once you change a value on the scale, start running the python code with python python/teste.py

Notes:
	main_server.js is the main node server
	public/index.html is the corresponding html file
	python/teste.py is the python client that's supposed to communicate with node

	If you get an error EADDRINUSE, go into main_server.js and change PORT variable to 3000. Also go to public/index.html and change the arguments of new websocket to new WebSocket('ws://localhost:3000', 'echo-protocol');

	Python and Node js communication is still glitchy. The python code isn't receiving the correct value for some reason and the values are getting written to the socket weirdly. Still have to look into ZEROmq.