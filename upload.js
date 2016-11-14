var fs = require('fs');
var http = require('http')

var body = fs.readFileSync('public/courses.json', 'utf8');

var request = new http.ClientRequest({
    hostname: process.env.HOSTNAME,
    port: 80,
    path: "/courses.json?token=" + process.env.AUTH_TOKEN,
    method: "POST",
    agent: false,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body)
    }
});

request.end(body)
