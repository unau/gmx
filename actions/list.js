'use strict';
exports.action = function(action){
  action.argList = 'target'.split(',');
  action.execfuncs = [
    'getProjectSettingsByTargetName,fetch',
    function(action, projects, cb){
      cb(null, JSON.stringify(projects, null, 2));
    }
  ];
  return action;
};
// end of file
