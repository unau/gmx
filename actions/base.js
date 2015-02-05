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
    this.name = name ? name : 'null';
    return this;
  };
  p.gen = function(name) {
    console.warn('gen(%s) ... begin', name);
    var action = new Base().init(this.settings, this.manager, this.async, name);
    var r = require('./' + name).action(action);
    console.warn('gen(%s) ... end', name);
    return r;
  };
  p.exec = function(seq, cb) {
    var action = this;
    var funcs = [
      function(cb){
	cb(null, action);
      }
    ];
    for (var i = 0, n = this.funcs.length; i < n; i++) {
      funcs.push(this.funcs[i]);
    }
    console.log('manager:' + (action.manager ? 'o' : 'x'));
    console.log('async:' + (action.async ? 'o' : 'x'));
    action.async.waterfall(funcs, function(err, result) { if (err) throw err; cb(seq, result); });
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
  exports.Action = function(settings, manager, async){ return new Base().init(settings, manager, async) };
})();
