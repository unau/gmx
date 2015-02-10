'use strict';
(function(){
  var Base = function(){};
  var OptionHolder = require('option').Holder;
  Base.prototype = new OptionHolder();
  var p = Base.prototype;
  p.init = function(settings, manager, async, name) {
    this.settings = settings;
    this.manager = manager;
    this.async = async;
    this.waterfall = async.waterfall;
    this.parallel = async.parallel;
    this.name = name ? name : 'null';
    return this;
  };
  p.gen = function(name) {
    var action = new Base().init(this.settings, this.manager, this.async, name);
    return require('./' + name).action(action);
  };
  p.exec = function(seq, cb) {
    var action = this;
    var funcs = [
      function(cb){
	cb(null, action);
      }
    ];
    for (var i = 0, n = this.execfuncs.length; i < n; i++) {
      var f = this.execfuncs[i];
      var typef = typeof f;
      if (typef == 'string') {
	var fnames = f.split(',');
	for (var j = 0, nj = fnames.length; j < nj; j++) {
	  var fname = fnames[j];
	  if (! this.funcs[fname]) throw new Error('unknown func named "' + fname + '"');
	  funcs.push(this.funcs[fname]);
	}
      } else if (typef == 'function') {
	funcs.push(f);
      }
    }
    action.waterfall(funcs, function(err, result) { if (err) throw err; cb(seq, result); });
  };
  p.setOptions = function(opts){
    this.opts = opts;
    return this;
  };
  p.readArgs = function(args){
    console.log('Action#readArgs ----->');
    var opts = {};
    args = this.readOptions(args, opts);
    for (var k in opts) {
      this.opts[k] = opts[k]; 
    }
    for (var i = 0, n = this.argList.length; i < n; i++) {
      var name = this.argList[i];
      this[name] = args[i];
      console.log(['Action#readArgs',i,name,args[i]]);
    }
    console.log('Action#readArgs <-----');
    return this;
  };
  var freon = require('../freon');
  p.funcs = {
    getProjectSettingsByTargetName: function(action, cb){
      var projects = new freon.Projects(action);
      var name = action.target;
      var project = action.settings.projects[name];
      if (project) {
	projects.add(name, project);
      } else {
	var group = action.settings.groups[name];
	if (group) {
	  for (var i = 0, n = group.length; i < n; i++) {
	    name = group[i];
	    project = action.settings.projects[name];
	    if (project) {
	      projects.add(name, project);
	    }
	  }
	}
      }
      cb(null, action, projects);
    },
    fetchWrite: function(action, projects, cb){
      projects.exec(['fetch','write']);
      cb(null, action, projects);
    },
    fetch: function(action, projects, cb){
      projects.exec(['fetch']);
      cb(null, action, projects);
    }
  };
  exports.Action = function(settings, manager, async){ return new Base().init(settings, manager, async) };
})();
