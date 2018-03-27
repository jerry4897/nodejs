var express = require('express');
var app = express();

mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: '20121566',
    password: '123qwe',
    database: 'mydb'
})
connection.connect();

function insert_sensor(device, unit, type, value, seq, ip) {
  obj = {};
  obj.seq = seq;
  obj.device = device;
  obj.unit = unit;
  obj.type = type;
  obj.value = value;
  obj.ip = ip.replace(/^.*:/, '')

  var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {
    if (err) throw err;
    console.log("database insertion ok= %j", obj);
  });
}

app.get('/log', function(req, res) {
  r = req.query;
  console.log("GET %j", r);

  insert_sensor(r.device, r.unit, r.type, r.value, r.seq, req.connection.remoteAddress);
  res.end('OK:' + JSON.stringify(req.query));
});

app.get("/data", function(req, res) {
  console.log("param=" + req.query);

  var qstr = 'select * from sensors ';
  connection.query(qstr, function(err, rows, cols) {
    if (err) {
      throw err;
      res.send('query error: '+ qstr);
      return;
    }

    console.log("Got "+ rows.length +" records");
    html = ""
    for (var i=0; i< rows.length; i++) {
       html += JSON.stringify(rows[i]);
    }
    res.send(html);
  });

});

app.get("/download", function(req,res) {
	var qstr = 'select * from sensors ';
	var http = require('http');
	var fs = require('fs');
	var request = http.get("http://163.239.76.204:8083/data", function(response) {
		if (response.statusCode === 200) {
			var file1 = fs.createWriteStream("data.csv");
			response.pipe(file1);
		}
		request.setTimeout(12000, function() {
			request.abort();
		});
	}); 
	connection.query(qstr, function(err, rows, cols) {
		if(err) {
			throw err;
			res.send('query error: '+ qstr);
			return;
		}
	});		
	var file = __dirname + '/data.csv';
	res.download(file);	
});

var server = app.listen(8083, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
});
