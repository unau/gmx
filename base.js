'use strict';
(function(){
  var path = require('path');
  var requireforcedly;

  var Base = function() {
  };
  (function(p){
    p.initAs = function(){
      this.pid = process.pid; 
    };
    p.reloadSettings_ = function() {
      var settings = require('gmx.json');
      this.settings = settings;
      var mySettings = this.settings[this.clazz];
      if (mySettings) {
	for (var key in mySettings) {
	  var value = mySettings[key];
	  var type = typeof value;
	  if (type == 'string' || type == 'number') {
	    this[key] = value;
	  } else if (this.role && value[this.role]) {
	    var value1 = value[this.role];
	    type = typeof value1;
	    if (type == 'string' || type == 'number') {
	      this[key] = value1;
	    }
	  }
	}
      }
      console.warn('reloaded gmx.json (clazz:' + this.clazz + ',role:' + this.role + ')');
      return this;
    };
  })(Base.prototype);

  exports.Base = Base;
})();
// end of file
