'use strict';
exports.action = function(action){
  action.argList = 'target'.split(',');
  action.getProjectSettingsByTargetName = function(action, cb){
    var projects = {};
    var name = action.target;
    var project = action.settings.projects[name];
    if (project) {
      projects[name] = project;
    } else {
      var group = action.settings.groups[name];
      if (group) {
	for (var i = 0, n = group.length; i < n; i++) {
	  name = group[i];
	  project = action.settings.projects[name];
	  if (project) {
	    projects[name] = project;
	  }
	}
      }
    }
    cb(null, action, projects);
  };
  action.funcs = [
    action.getProjectSettingsByTargetName,
    function(action, projects, cb){
      action.waterfall(
	(function(a){
	  for (var k in projects) {
	    var project = projects[k];
	    a.push(function(gasProjects, cb){
	      console.log("** START ** getProject");
	      action.manager.getProject(project.id, function(res, gasProject, response){
		gasProjects.push(gasProject);
		cb(null, gasProjects);
	      });
	    });
	  }
	  return a;
	})([ function(cb){ cb(null, [])} ]),
	function(err, gasProjects) {
	  cb(err, action, gasProjects);
	});
    },
    function(action, gasProjects, cb){
      var fs = require('fs');
      var path = require('path');
      for (var i = 0, n = gasProjects.length; i < n; i++) {
	var gasProject = gasProjects[i];
	var pname = gasProject.filename;
	console.log('  Got a project "' + pname + '"');
	var files = gasProject.getFiles();
	var funcs = [];
	for (var k1 in files) {
	  var file = files[k1];
	  var name = file.name;
	  var arrivalPath = path.resolve(action.settings.global.baseDir, 'src0', 'station', pname, name + '.js');
	  if (! fs.existsSync(path.dirname(arrivalPath))) {
	    fs.mkdirSync(path.dirname(arrivalPath));
	  }
	  funcs.push((function(path,file){
	    return function(cb){
	      fs.writeFile(path, file.source, function(err) {
		console.log('      [' + file.name + "] is created to \n       >>> [" + path + ']');
		cb(err, {name: file.name, path: path});
	      });
	    };
	  })(arrivalPath,file));
	}
      }
      action.parallel(funcs, function(err, result) {
	if (err) throw err;
	cb(null, action, result);
      });
    },
    function(action, writingResult, cb){
      var s = JSON.stringify(writingResult, null, 2) + "\n";
      cb(null, s);
    }
  ];
  return action;
};
// end of file
