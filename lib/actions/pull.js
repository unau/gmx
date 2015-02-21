'use strict';
exports.action = function(action){
  action.def('<target>', {
    pass: {}
  });
  action.execfuncs = [
    'getProjectSetByName,[pass?fetch-write2port:fetch-write2station]',
    function(gear, action, args, cb) {
      args.ret = action.projectSet;
      cb(null, gear, action, args);
    },
    'mkResult'
  ];
  return action;
};
// end of file
