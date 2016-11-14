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
  var getText = function(selector) {
    var el = document.querySelector(selector);
    return el ? el.textContent : '';
  };

  return {
    name: getText('#win0divDERIVED_CLSRCH_DESCR200'),
    status: getText('#SSR_CLS_DTL_WRK_SSR_DESCRSHORT'),
    units: getText('#SSR_CLS_DTL_WRK_UNITS_RANGE'),
    career: getText('#PSXLATITEM_XLATLONGNAME'),
    dates: getText('#SSR_CLS_DTL_WRK_SSR_DATE_LONG'),
    grading: getText('#GRADE_BASIS_TBL_DESCRFORMAL'),
    schedule: getText('#MTG_SCHED\\$0'),
    room: getText('#MTG_LOC\\$0'),
    instructor: getText('#MTG_INSTR\\$0'),
    class_capacity: getText('#SSR_CLS_DTL_WRK_ENRL_CAP'),
    enrollment_total: getText('#SSR_CLS_DTL_WRK_ENRL_TOT'),
    available_seats: getText('#SSR_CLS_DTL_WRK_AVAILABLE_SEATS'),
    wait_list_capacity: getText('#SSR_CLS_DTL_WRK_WAIT_CAP'),
    wait_list_total: getText('#SSR_CLS_DTL_WRK_WAIT_TOT'),
    description: getText('#DERIVED_CLSRCH_DESCRLONG'),
    class_notes: getText('#DERIVED_CLSRCH_SSR_CLASSNOTE_LONG')
  };
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
  parseCourses(courseNumbers.slice(0,2), [], function(courseInfos){
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
