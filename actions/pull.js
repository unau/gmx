'use strict';
exports.action = function(action){
  action.argList = 'target'.split(',');
  action.execfuncs = [
    'getProjectSettingsByTargetName,fetchWrite',
    function(action, projects, cb){
      cb(null, "done\n");
    }
  ];
  return action;
};
// end of file
