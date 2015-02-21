'use strict';
(function(){
  var Front = function(){
    this.version = '0.0.1';
  };
  var Base = require('base').Base;
  Front.prototype = new Base();

  (function(p){
    p.init = function(){
      this.initAs();
      this.clazz = 'gmxd';
      this.reset_();
      this.seq = 0;
      var gmxd = this;
      this.ownActions = {
	reset: function(req, res){
	  gmxd.reset_();
	  res.end("reset server\n");
	},
	stop: function(req, res){
	  gmxd.stopWorker();
	  console.log('stopping server ...');
	  gmxd.server.close();
	  console.log('stoped server ...');
	  //req.connection.end();
	  //req.connection.destroy();
	  process.exit();
	},
	status: function(req, res){
	  var s = {},
	      seq;
	  s.reqs = {};
	  for (seq in this.reqs) {
	    s.reqs[seq] = 1;
	  }
	  res.end(JSON.stringify(s, null, 2) + "\n");
	}
      };
      return this;
    };
    p.stopWorker = function(){
      if (this.worker && this.worker.connected) {
	this.worker.disconnect();
      }
    };
    p.reset_ = function(){
      var gmxd = this;
      this.reloadSettings_();
      this.reqs = {};
      this.stopWorker();
      this.worker = require('child_process').fork('start_worker.js');
      this.worker.on('message', function(msg){
	if (msg && msg.gmx) {
	  var seq = msg.gmx.seq;
	  var res = msg.gmx.res;
	  var httpres = gmxd.retrieveResponse(seq);
	  if (res && httpres) {
	    httpres.write(res);
	    httpres.end();
	  }
	}
      });
    };
    p.storeRequest = function(req, res) {
      var seq = this.seq++;
      this.reqs[seq] = { seq: seq, req: req, res: res };
      return seq;
    };
    p.retrieveResponse = function(seq) {
      var obj = this.reqs[seq];
      if (! obj) return null;
      var res = obj.res;
      if (! res) return null;
      delete this.reqs[seq];
      return res;
    };
    p.start = function() {
      process.on('uncaughtException', function (err) {
	console.error(err);
	console.error(err.stack);
      });
      var http = require('http');
      this.server = http.createServer();
      var gmxd = this;
      this.server.on('request', function(req, res) {
	var url = decodeURI(req.url);
	console.warn({request_url:url});
	res.writeHead(200, {'content-type': 'text/plain'});
	var args = url.substr(1).split('/');
	if (gmxd.ownActions[args[0]]) {
	  return gmxd.ownActions[args[0]](req, res);
	}
	if (gmxd.worker.connected) {
	  var seq = gmxd.storeRequest(req, res);
	  gmxd.worker.send({ gmx: { seq: seq, args: args } });
	}
      });
      this.server.listen(this.port, function() {
	console.log('server running (version:' + gmxd.version + ', pid:' + gmxd.pid + ')');
      });
      return this;
    };
  })(Front.prototype);

  exports.Front = Front;
})();
