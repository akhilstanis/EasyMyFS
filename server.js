var express = require('express');
var app = express();
var fs = require('fs');

app.set('port', (process.env.PORT || 4000));
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post('/courses.json', function (req, res) {
  if(req.query.token != process.env.AUTH_TOKEN)
    return res.status(403).end();

  fs.writeFile('public/courses.json', JSON.stringify(req.body), function(){
    res.end();
  });
});

app.listen(app.get('port'), function () {
  console.log('App listening on port ' + app.get('port') + '...');
});
