'use strict';
exports.action = function(action){
  action.def('<target>', {});
  action.execfuncs = [
    'getProjectSetByName,fetch-read-deploy',
    function(gear, action, args, cb) {
      args.ret = action.projectSet;
      cb(null, gear, action, args);
    },
    'mkResult'
  ];
  return action;
};
// end of file
