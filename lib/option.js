'use strict';
(function(){
  var Option  = function(name){
    this.name = name;
  };
  (function(p){
  })(Option.prototype);

  var OptionHolder  = function(){
    this.options = {};
  };
  (function(p){
    p.readOptions = function(args, target){
      var k, option;
      for (k in this.options) {
	option = this.options[k];
	target[option.name] = option.def;
      }
      var arg = args.shift();
      while (arg) {
	if (! arg.match(/^(-+)([^\-].*)$/)) {
	  args.unshift(arg);
	  return args;
	}
	option = this.getOption(arg);
	args = option.read(args, target);
	arg = args.shift();
      }
      return args;
    };
    p.getOption = function(name){
      var option = this.options[name];
      if (! option) throw new Error('unknown option <' + name + '>');
      return option;
    };
    p.addOption_ = function(name, shortname, longname, hasArg, convfunc, def){
      var option = new Option(name);
      option.def = def;
      option.read =
	hasArg ? (convfunc ?
		  function(args, target) {
		    target[this.name] = convfunc(args.shift());
		    return args;
		  } :
		  function(args, target) {
		    target[this.name] = args.shift();
		    return args;
		  })
      : function(args, target) {
	target[this.name] = true;
	return args;
      };
      this.options[shortname] = this.options[longname] = option;
      return this;
    };
  })(OptionHolder.prototype);
  exports.Holder = OptionHolder;
})();
