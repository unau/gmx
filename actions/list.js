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
	  cb(err, gasProjects);
	});
    },
    function(gasProjects, cb){
      var s = {};
      for (var i = 0, n = gasProjects.length; i < n; i++) {
	var gasProject = gasProjects[i];
	var pname = gasProject.filename;
	s[pname] = {
	  name: pname,
	  id: gasProject.fileId,
	  files: {}
	};
	var files = gasProject.getFiles();
	for (var k1 in files) {
	  var file = files[k1];
	  var name = file.name;
	  s[pname].files[name] = { type: file.type, name: name };
	}
      }
      s = JSON.stringify(s, null, 2) + "\n";
      cb(null, s);
    }
  ];
  return action;
};
// end of file
