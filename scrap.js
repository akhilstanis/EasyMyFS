var casper = require('casper').create({
  // verbose: true,
  // logLevel: 'info'
});

var fs = require('fs');
var spawn = require('child_process').spawn;

var MYFS_CLASS_SEARCH_URL = 'https://my.fresnostate.edu/psp/mfs/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.CLASS_SEARCH.GBL?FolderPath=PORTAL_ROOT_OBJECT.FR_VIEW_SOC.FR_CLASS_SEARCH_GBL2&IsFolder=false&IgnoreParamTempl=FolderPath%2cIsFolder'

casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
})

casper.on("page.error", function(msg, trace) {
  this.echo("Error: " + msg);
});

casper.on("resource.error", function(resourceError) {
    this.echo("ResourceError: " + JSON.stringify(resourceError, undefined, 4));
});

var getCourseNumbers = function(){
  var courseNumbers = document.querySelectorAll("a[id^='MTG_CLASS_NBR']");
  return Array.prototype.map.call(courseNumbers, function(courseNumber){ return courseNumber.textContent; });
};

var parseCoursePage = function() {
  var courseName = document.querySelector("#win0divDERIVED_CLSRCH_DESCR200").textContent;
  return { name: courseName };
}

var parseCourses = function(courseNumbers, previousCourseInfos, callback) {
  var courseNumber = courseNumbers.pop();

  if(courseNumber) {
    casper.echo('Parsing course ' + courseNumber + '...');

    casper.clickLabel(courseNumber);
    casper.waitWhileVisible('#WAIT_win0', function(){
      var courseInfo = this.evaluate(parseCoursePage);
      previousCourseInfos.push(courseInfo);

      casper.clickLabel('View Search Results');
      casper.waitWhileVisible('#WAIT_win0', function(){
        parseCourses(courseNumbers, previousCourseInfos, callback);
      });
    });
  } else {
    callback(previousCourseInfos);
  }
};

var checkMoreThan50Alert = function(){
  return document.querySelector('#DERIVED_SSE_DSP_SSR_MSG_TEXT').textContent ==  'Your search will return over 50 classes, would you like to continue?';
};

var parseCourseNumbers = function(){
  var courseNumbers = casper.evaluate(getCourseNumbers);
  parseCourses(courseNumbers, [], function(courseInfos){
    var data = {
      timestamp: new Date(),
      courses: courseInfos
    };
    fs.write('public/courses.json', JSON.stringify(data));
    spawn('node', 'upload.js');
    casper.echo('Uploading...');
    casper.wait(5000);
  });
};


casper.start(MYFS_CLASS_SEARCH_URL);

casper.withFrame('TargetContent', function() {
  casper.evaluate(function(){
    document.querySelector('#CLASS_SRCH_WRK2_STRM\\$35\\$').value = '2173';
    document.querySelector('#SSR_CLSRCH_WRK_SUBJECT\\$0').value = 'CSCI';
    document.querySelector('#SSR_CLSRCH_WRK_SSR_OPEN_ONLY\\$chk\\$4').value = 'N';
  });

  casper.click('#CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH');

  casper.waitWhileVisible('#WAIT_win0', function(){
    var hasMoreThan50Alert = casper.evaluate(checkMoreThan50Alert);

    if(hasMoreThan50Alert) {
      casper.click('#\\#ICSave');
      casper.waitWhileVisible('#WAIT_win0', parseCourseNumbers);
    } else parseCourseNumbers();
  });
});

casper.run();
