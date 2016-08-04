var LaravelRequest = require('./../../lib/laravelRequests');

function cacheQuery(callback){
  ctx = this;
  if(ctx.params){
    ctx.doLaravelRequest(ctx.params.rediskey, callback);
  }else {
    ctx.status = 400;
    callback({"error": "Bad Request"});
  }
}
reCacheRedisKey = function *(){
  this.is('application/json');
  this.body = yield cacheQuery;
}

module.exports = reCacheRedisKey;
