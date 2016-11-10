var casper = require('casper').create();
var links;

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
}

casper.start(MYFS_CLASS_SEARCH_URL);

casper.withFrame('TargetContent', function() {
  this.evaluate(function(){
    document.querySelector('#CLASS_SRCH_WRK2_STRM\\$35\\$').value = '2173'
    document.querySelector('#SSR_CLSRCH_WRK_SUBJECT\\$0').value = 'CSCI'
  });

  this.click('#CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH');

  this.waitWhileVisible('#WAIT_win0', function(){
    var courseNumbers = this.evaluate(getCourseNumbers);
    parseCourses(courseNumbers.slice(0,1), [], function(courseInfos){
      casper.echo(JSON.stringify(courseInfos));
    });
  });
});

casper.run();
