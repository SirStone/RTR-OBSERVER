const express = require('express');  
const path = require('path');
const fs = require('fs');
const packageJSON = require('./package.json')

var http = require('http'); const http_port = 8000;
var https = require('https'); const https_port = 8443;
var privateKey  = fs.readFileSync('sslcert/selfsigned.key', 'utf8');
var certificate = fs.readFileSync('sslcert/selfsigned.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var app = express();

// app configuration
app.set("views", path.join(__dirname, "views")); // setting the location of the views ak the web pages
app.set("view engine", "pug"); // setting the templating engine
app.use(express.static(path.join(__dirname, "public"))); // setting the '/' pointing to the public folder

app.get('/', function(req, res) {  
    // res.sendFile(path.join(__dirname, 'public/index.html')); 
    res.render("index", {
        version: packageJSON.version,
        title: "Robocode Tank Royale PWA",
      }); 
});  
  
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(http_port);
httpsServer.listen(https_port);

console.log('HTTP Server running on port ' + http_port);
console.log('HTTPS Server running on port ' + https_port);