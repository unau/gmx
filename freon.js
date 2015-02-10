'use strict';
(function(){
  var async = require('async');
  var path = require('path');
  var fs = require('fs');
  var Project = function(name, action, spec){
    this.name = name;
    this.action = action;
    if (spec) this.init(spec);
  };
  (function(p){
    p.init = function(spec){
      this.id = spec.id;
      this.manager = this.action.manager;
      this.stationDir = path.resolve(this.action.settings.global.baseDir, 'src0', 'station', this.name);
      if (! fs.existsSync(this.stationDir)) {
	fs.mkdirSync(this.stationDir);
      }
      return this;
    };
    p.setGasProject = function(gasProject){
      this.gasProject = gasProject;
      return this;
    };
    p.fetch = function(cb){
      var self = this;
      console.log(  '  ** Getting a project "' + self.name + '"');
      self.manager.getProject(self.id, function(res, gasProject, response){
	console.log('  ** Got     a project "' + self.name + '"');
	self.setGasProject(gasProject);
	cb(null);
      });
    };
    p.write = function(cb){
      var self = this;
      async.parallel((function(tasks, files){
	for (var k1 in files) {
	  var file = files[k1];
	  var name = file.name;
	  var arrivalPath = path.resolve(self.stationDir, name + '.js');
	  tasks.push((function(path, file){
	    return function(cb){
	      fs.writeFile(path, file.source, function(err) {
		console.log('      [' + file.name + ' (' + self.name + ")] is created to \n" +
			    '       >>> [' + path + ']');
		cb(err, {name: file.name, path: path});
	      });
	    };
	  })(arrivalPath,file));
	}
	return tasks;
      })([], this.gasProject.getFiles()), function(err, result) {
	if (err) throw err;
	cb(null);
      });
    };
    p.mkmethod = function(funcnames){
      return (function(project){
	return function(cb){
	  async.waterfall((function(tasks,names,len){
	    for (var i = 0; i < len; i++) {
	      tasks.push((function(name){
		return function(cb){project[name](cb)};
	      })(names[i]));
	    }
	    return tasks;
	  })([],funcnames,funcnames.length)
          , function(err,result){
	    if (err) throw err;
	    console.log('  finished: [' + funcnames.join(',') + '] of ' + project.name);
	  });
	  cb(null);
	};
      })(this);
    };
  })(Project.prototype);
  var Projects = function(action){
    this.action = action;
    this.manager = action.manager;
    this.items = {};
  };
  (function(p){
    p.add = function(name, spec) {
      var proj = new Project(name, this.action, spec);
      this.items[name] = proj;
      return this;
    };
    p.exec = function(funcnames){
      (function(projects){
	return function(){
	  async.parallel((function(tasks,items){
	    for (var k in items) {
	      tasks.push(items[k].mkmethod(funcnames));
	    }
	    return tasks;
	  })([],projects.items)
	  , function(err,result){
	    if (err) throw err;
	  });
	  return projects;
	};
      })(this)();
    };
    p.toJSON = function(){
      return '<freon.projects/>';
    };
  })(Projects.prototype);
  exports.Project = Project;
  exports.Projects = Projects;
})();
// end of file
