'use strict';
(function(){
  var Order = function(){
    this.v = {};
  };
  (function(p){
  })(Order.prototype);
  var OptionHolder = require('option').Holder;
  var OrderBuilder = function(){};
  OrderBuilder.prototype = new OptionHolder();
  (function(p){
    p.init = function(settings, manager, async){
      this.actions = {};
      this.baseAction = require('./actions/base').Action(settings, manager, async);
      this.addOption_('verbose', '-v', '--verbose');
      this.addOption_('debug', '-d', '--debug', true, Number);
      return this;
    };
    p.build = function(args){
      var order = new Order();
      args = this.readOptions(args, order.v);
      var arg = args.shift();
      order.action = this.getAction(arg);
      order.action.setOptions(order.v);
      order.action.readArgs(args);
      return order;
    };
    p.getAction = function(name){
      var action = this.actions[name];
      if (! action) {
	try {
	  this.actions[name] = action = this.baseAction.gen(name);
	} catch(e) {
	  action = this.baseAction;
	}
      }
      return action;
    };
  })(OrderBuilder.prototype);
  
  var Worker = function(){};
  var Base = require('base').Base;
  Worker.prototype = new Base();
  (function(p){
    p.init = function(){
      var worker = this;
      this.initAs();
      this.clazz = 'gmxd';
      this.role = 'worker';
      console.warn('init' + this.role);
      this.reloadSettings_();
      var Manager = require('gas-manager').Manager;
      var credential = require('credential.json');
      this.manager = new Manager(credential);
      return this;
    };
    p.start = function(){
      var worker = this;
      console.log('start worker process (pid:' + this.pid + ')');
      var orderBuilder = new OrderBuilder(this).init(this.settings, this.manager, require('async'));
      process.on('message', function(msg){
	if (msg && msg.gmx) {
	  var seq = msg.gmx.seq;
	  try {
	    var order = orderBuilder.build(msg.gmx.args);
	    order.action.exec(seq, function(seq, result){
	      process.send({gmx: { seq: seq, res: result }});
	    });
	  } catch(e) {
	    console.warn(e);
	    var res = "<error>\n";
	    for (var k in e) {
	      res += '  <' + k + '>' + e[k] + '</' + k + '>' + "\n";
	    }
	    res += "</error>\n";
	    process.send({gmx: { seq: seq, res: res }});
	  }
	}
      });
      process.on('disconnect', function(){
	console.log('stop worker process (pid:' + this.pid + ')');
	process.exit();
      });
      return this;
    };
  })(Worker.prototype);

  exports.Worker = Worker;
})();
