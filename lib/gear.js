'use strict';
(function(){
  var fs = require('fs');
  var path = require('path');
  var freon = require('freon');
  var Forest = function(){
    this.init();
  };
  (function(p){
    
  })(Forest.prototype);

  var Gear = function(settings){
    this.init(settings);
  };
  (function(p){
    p.init = function(settings) {
      var gear = this,
	  Manager = require('gas-manager').Manager,
	  credential,
	  i, len, forest;
      gear.projects = {};
      gear.projectSets = {};
      gear.settings = settings;
      credential = (function(h,env,names,i,k1,len,k2){
	for (i = 0, len = names.length; i < len; i++) {
	  k1 = names[i];
	  h[k1] = env['npm_package_config_' + k1];
	}
	return h;
      })({}, process.env, ['client_id','client_secret','refresh_token']);
      this.manager = new Manager(credential);
    };
    p.getProjectHash = function(names, i, len, gear, r, name, proj) {
      gear = this;
      r = {};
      for (i = 0, len = names.length; i < len; i++) {
	name = names[i];
	proj = gear.projects[name];
	r[name] = proj ? proj : 'havetoget';
      }
      return r;
    };
    p.getProjectSetByName = function(name) {
      var gear = this, set = this.projectSets[name], projs, r;
      if (set) return set;
      projs = gear.getProjectHash((function(groups, targetName){
	if (groups[targetName]) return groups[targetName];
	return [targetName];
      })(gear.settings.groups, name));
      (function(forests){
	var i = 0, len = forests.length, forest;
	for (i = 0; i < len; i++) {
	  forest = forests[i];
	  fs.readdirSync(forest)
	    .filter(function(f){
	      return fs.statSync(path.resolve(forest, f)).isDirectory() &&
		projs[f] == 'havetoget';
	    })
	    .forEach(function(dir, proj){
	      gear.projects[dir] = projs[dir] = new freon.Project(dir, path.resolve(forest, dir));
	    });
	}
      })(gear.settings.forests);
      return gear.setProjectSet(name, projs);
    };
    p.setProjectSet = function(name, projs) {
      var set = this.projectSets[name] = new freon.ProjectSet(name).init(this.manager, projs);
      return set;
    };
  })(Gear.prototype);
  exports.Gear = Gear;
})();
