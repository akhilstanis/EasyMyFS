var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
  var courses = db.collection('courses');

  courses.deleteMany({}, function(err,result){
    var coursesJson = fs.readFileSync('public/courses.json', 'utf8');
    courses.insert(JSON.parse(coursesJson), function(err,result){
      console.log('Done!');
      db.close();
    });
  });
});
