'use strict';
(function(){
  var async = require('async'),
      path = require('path'),
      fs = require('fs'),
      ini = require('ini');
  var File = function(args){
    this.init(args);
  };
  (function(p){
    p.init = function(args) {
      if (args.parent) {
	this.projname = args.parent.name;
	this.stationDir = args.parent.stationDir;
	this.portDir = args.parent.portDir;
      }
    };
    p.updateWithGasFile = function(gasFile) {
      this.gas = gasFile;
      this.name = gasFile.name;
      this.type = gasFile.type;
      this.filename = gasFile.name + (gasFile.type == 'html' ? '.html' : '.js');
      this.stationPath = path.resolve(this.stationDir, this.filename);
      this.portPath = path.resolve(this.portDir, this.filename);
      return this;
    };
    p.setContent = function(content) {
      this.content = content;
      if (this.gas && this.gas.source) {
	this.dirtiness = (content !== this.gas.source);
      }
      return this;
    };
    p.getWriteMethod = function(place) {
      var file = this;
      return function(cb){
	var path = file[place + 'Path'];
	fs.writeFile(path, file.gas.source, function(err) {
	  console.log('      [' + file.name + ' (' + file.projname + ")] is created to \n" +
		      '       >>> [' + path + ']');
	  cb(err, {name: file.name, path: path});
	});
      };
    };
    p.getReadMethod = function() {
      var file = this;
      return function(cb){
	var path = file.portPath;
	fs.readFile(path, { encoding: 'utf8' }, function(err, content) {
	  file.setContent(content);
	  console.log('      [' + file.name + ' (' + file.projname + ')][' +
		      (file.dirtiness ? '*' : ' ') +
		      "] is read out from \n" +
		      '       <<< [' + path + ']');
	  cb(err, file);
	});
      };
    };
  })(File.prototype);
  var Project = function(name, dir){
    this.name = name;
    this.dir = dir;
    this.files = {};
    this.init();
  };
  (function(p){
    p.init = function(){
      (function(proj, specs){
	var k, spec, path0;
	for (k in specs) {
	  spec = specs[k];
	  proj[k] = path0 = path.resolve(proj.dir, spec.name);
	  if (spec.type == 'dir') {
	    if (! fs.existsSync(path0)) {
	      fs.mkdirSync(path0);
	    }
	  } else {
	    if (spec.func && fs.existsSync(path0)) {
	      spec.func(proj, fs.readFileSync(path0, { encoding: 'utf8' }));
	    }
	  }
	}
      })(
	this,
	{
	  dotGmx: { type: 'file', name: '.gmx',
		    func: function(proj, content) {
		      proj.config = ini.parse(content);
		      if (proj.config.id) {
			proj.id = proj.config.id;
		      }
		    } },
	  portDir: { type: 'dir', name: 'port' },
	  stationDir: { type: 'dir', name: 'station' }
	}
      );
      return this;
    };
    p.setGasProject = function(gasProject){
      var proj = this;
      proj.gasProject = gasProject;
      gasProject.getFiles().forEach(function(file) {
	if (! proj.files[file.name]) {
	  proj.files[file.name] = new File({parent: proj});
	}
	proj.files[file.name].updateWithGasFile(file);
      });
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
    p.read = function(cb){
      var self = this;
      async.parallel((function(tasks, files){
	for (var k1 in files) {
	  tasks.push(files[k1].getReadMethod());
	}
	return tasks;
      })([], this.files), function(err, result) {
	if (err) throw err;
	result.forEach(function(file){
	  if (file.dirtiness) {
	    console.log('    changeFile [' + file.name + '] on (' + file.projname + ')');
	    self.gasProject.changeFile(file.name, { source: file.content });
	  }
	});
	cb(null);
      });
    };
    p.deploy = function(cb){
      var self = this;
      console.log(  '  ** Deploying a project "' + self.name + '"');
      self.gasProject.deploy(function(err, gasProject, response){
	console.log('  ** Deployed  a project "' + self.name + '"');
	cb(err);
      });
    };
    function mkWriteMethod(dirname){
      return function(cb){
	var self = this;
	async.parallel((function(tasks, files){
	  for (var k1 in files) {
	    tasks.push(files[k1].getWriteMethod(dirname));
	  }
	  return tasks;
	})([], this.files), function(err, result) {
	  if (err) throw err;
	  cb(null);
	});
      };
    }
    
    /*
    function mkWriteMethod(dirname){
      return function(cb){
	var self = this;
	async.parallel((function(tasks, files){
	  for (var k1 in files) {
	    var file = files[k1],
		name = file.name,
		ext = file.type == 'html' ? '.html' : '.js';
	    var arrivalPath = path.resolve(self[dirname + 'Dir'], name + ext);
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
    }
    */
    p.write2station = mkWriteMethod('station');
    p.write2port = mkWriteMethod('port');
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
  var ProjectSet = function(name){
    this.name = name;
    this.projs = {};
  };
  (function(p){
    p.init = function(manager, projs, k) {
      this.manager = manager;
      for (k in projs) {
	projs[k].manager = manager;
	this.projs[k] = projs[k];
      }
      return this;
    };
    p.exec = function(funcnames) {
      var projs = this.projs;
      if (projs.length < 1) return this;
      (function(projs){
	return function(){
	  async.parallel((function(tasks, projs){
	    for (var k in projs) {
	      tasks.push(projs[k].mkmethod(funcnames));
	    }
	    return tasks;
	  })([], projs)
	  , function(err,result){
	    if (err) throw err;
	  });
	  return projs;
	};
      })(projs)();
    };
    p.toJSON = function(){
      var k, s = '<freon.projectSet name="' + this.name+ '" />' + "\n";
      for (k in this.projs) {
	s += '<freon.project name="' + k + '" />' + "\n";
      }
      s += '</freon.projectSet>' + "\n";
      return s;
    };
  })(ProjectSet.prototype);
  exports.Project = Project;
  exports.ProjectSet = ProjectSet;
})();
// end of file
