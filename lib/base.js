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
      var settings = require('../gmx.json'),
	  mySettings = settings[this.clazz],
	  key, value, type;
      if (! settings.forests) {
	settings.forests = [];
      }
      this.settings = settings;
      if (mySettings) {
	for (key in mySettings) {
	  value = mySettings[key];
	  type = typeof value;
	  if (type == 'string' || type == 'number') {
	    this[key] = value;
	  }
	}
      }
      console.warn('reloaded gmx.json (clazz:' + this.clazz + ')');
      return this;
    };
  })(Base.prototype);

  exports.Base = Base;
})();
// end of file
