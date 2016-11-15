require('dotenv').config();
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
  if(err) {
    console.error('Oops! Could not connect to MongoDB. Are you sure MongoDB is running at ' + process.env.MONGODB_URI);
    process.exit(1);
  }

  var courses = db.collection('courses');

  courses.deleteMany({}, function(err,result){
    var coursesJson = fs.readFileSync('public/courses.json', 'utf8');
    courses.insert(JSON.parse(coursesJson), function(err,result){
      console.log('Done!');
      db.close();
    });
  });
});
