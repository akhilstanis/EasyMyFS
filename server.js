require('dotenv').config();
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;

app.set('port', (process.env.PORT || 4000));
app.use(express.static('public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
  app.get('/courses.json', function (req, res) {
    db.collection('courses').find().toArray(function(err,docs){
      res.send(JSON.stringify(docs[0]));
    });
  });

  app.listen(app.get('port'), function () {
    console.log('App listening on port ' + app.get('port') + '...');
  });
});
