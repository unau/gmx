'use strict';
(function(){
  var Base = function(){};
  var OptionHolder = require('option').Holder;
  var async = require('async');
  Base.prototype = new OptionHolder();
  var p = Base.prototype;
  p.init = function(name) {
    this.name = name ? name : 'null';
    return this;
  };
  p.gen = function(name) {
    var action = new Base().init(name);
    return require('./' + name).action(action);
  };
  p.exec = function(seq, gear, cb) {
    var action = this;
    var funcs = [
      function(cb){
	cb(null, gear, action, {});
      }
    ];
    function mkMethod(funcnames) {
      funcnames = funcnames.split('-');
      return function(gear, action, args, cb) {
	args.projectSet.exec(funcnames);
	cb(null, gear, action, args);
      };
    };
    for (var i = 0, n = this.execfuncs.length; i < n; i++) {
      var f = this.execfuncs[i];
      var typef = typeof f;
      if (typef == 'string') {
	var fnames = f.split(',');
	for (var j = 0, nj = fnames.length; j < nj; j++) {
	  var fname = fnames[j];
	  if (this.funcs[fname]) {
	    funcs.push(this.funcs[fname]);
	  } else {
	    var m;
	    if (m = fname.match(/^\[(\w+)\?([\w\-]+):([\w\-]+)\]$/)) {
	      var optkey = m[1];
	      var truefuncname = m[2];
	      var falsefuncname = m[3];
	      if (! this.funcs[truefuncname]) {
		this.funcs[truefuncname] = mkMethod(truefuncname);
	      }
	      if (! this.funcs[falsefuncname]) {
		this.funcs[falsefuncname] = mkMethod(falsefuncname);
	      }
	      funcs.push(this.funcs[action.opts[optkey] ? truefuncname : falsefuncname]);
	    } else {
	      this.funcs[fname] = mkMethod(fname);
	      funcs.push(this.funcs[fname]);
	    }
	  }
	}
      } else if (typef == 'function') {
	funcs.push(f);
      }
    }
    async.waterfall(funcs, function(err, result) { if (err) throw err; cb(seq, result); });
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
  p.def = function(args, spec){
    console.log('Action#def ----->');
    var p = new RegExp(/<(\w+)>/g), m, name, h;
    this.argList = [];
    while (m = p.exec(args)) {
      this.argList.push(m[1]);
    }
    for (name in spec) {
      h = (function(h){
	console.log({'Action#def#spec[name]': h});
	var rh = {
	  shortname: '-' + (h.shortname ? h.shortname : name.charAt(0)),
	  longname: '--' + name,
	};
	if ('def' in h) {
	  rh.def = h.def;
	  rh.hasArg = (h.hasArg || h.func) ? true : false;
	  rh.convfunc = h.func;
	} else {
	  rh.def = false;
	  rh.hasArg = false;
	  rh.convfunc = null;
	}
	return rh;
      })(spec[name]);
      console.log({'Action#def#h': h});
      this.addOption_(name, h.shortname, h.longname, h.hasArg, h.convfunc, h.def);
    }
    console.log('Action#def <-----');
  };
  var freon = require('freon');
  p.funcs = {
    mkResult: function(gear, action, args, cb) {
      cb(null, (function(ret){
	if (! ret) return "<void />\n";
	return JSON.stringify(ret, null, 2) + "\n";
      })(args.ret));
    },
    getProjectSetByName: function(gear, action, args, cb) {
      args.projectSet = gear.getProjectSetByName(action.target);
      cb(null, gear, action, args);
    }
  };
  exports.Action = function(){ return new Base().init() };
})();
