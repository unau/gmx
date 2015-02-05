'use strict';
exports.action = function(action){
  action.argList = 'target'.split(',');
  action.funcs = [
    function(action, cb){
      var project = action.settings.projects[action.target];
      cb(null, action, project);
    },
    function(action, project, cb){
      action.manager.getProject(project.id, function(res, gasProject, response){
	cb(null, res, gasProject, response);
      });
    },
    function(res1, gasProject, response, cb){
      var s = {};
      var u;
      var files = gasProject.getFiles();
      for (var k1 in files) {
	var file = files[k1];
	if (! u) {
	  u = {};
	  for (var k2 in file) {
	    u[k2] = 1;
	  }
	}
	s[k1] = { type: file.type, name: file.name };
      }
      s = JSON.stringify({ss:s, uu:u});
      console.log(s);
      cb(null, s);
    }
  ];
  action.exec5 = function(seq, cb) {
    var target = this.target;
    var project = this.settings.projects[target];
    var manager = this.manager;
    var res = '';
    async.waterfall([
      function(cb){
	manager.getProject(project.id, function(res, gasProject, response){
	  cb(null, res, gasProject, response);
	});
      },
      function(res1, gasProject, response, cb){
	var s = {};
	var u;
	var files = gasProject.getFiles();
	for (var k1 in files) {
	  var file = files[k1];
	  if (! u) {
	    u = {};
	    for (var k2 in file) {
	      u[k2] = 1;
	    }
	  }
	  s[k1] = { type: file.type, name: file.name };
	}
	s = JSON.stringify({ss:s, uu:u});
	console.log(s);
	cb(null, s);
      }
    ], function(err, result){
      if (err) throw err;
      cb(seq, result);
    });
    return res;
  };  
  return action;
};
// end of file
