var async = require("async");
var LaravelRequest = require('./../../lib/laravelRequests');

function getJobs(callback){
  ctx = this;
  if(ctx.params){
    callback(null,{'data': this.getLaravelRequestJobQueue(ctx.params.platformPrefix, "")});
  }else{
    ctx.response.status = 400;
    callback(null,{'msg': 'Bad request'});
  }
}
getPlatformJobs = function *(){
  this.is('application/json');
  this.body = yield getJobs;
}

module.exports = getPlatformJobs;
