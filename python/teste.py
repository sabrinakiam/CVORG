import socket
import time

if __name__ == "__main__":

	i = 1
	while True:
		client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		client.connect(('127.0.0.1', 1111))
		client.send('running python code: %s' % i)
		data = client.recv(1024)
		if (i == 5):
			client.close()
			print 'closed client'
			break;
		print 'Received', repr(data)
		i = i + 1

		time.sleep(3)