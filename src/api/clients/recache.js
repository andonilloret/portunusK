var redis = require("redis"),
    client = redis.createClient({ host:"localhost", port:'6379'});
var LaravelRequest = require('./../../lib/laravelRequests');

function cacheQuery(callback){
  ctx = this;
  if(ctx.params){
    client.keys(ctx.params.clientName+"*", function (err, keys) {
      for(keyIndex in keys)
        ctx.doLaravelRequest(keys[keyIndex], function(err, msg){
          console.log("Se envio la petición para refrescar la llave");
        });
      callback(null, {"msg": "Se envio la petición para refrescar Cache de cliente"});
    });
  }else {
    this.status = 400;
    callback({"error": "Bad Request"});
  }
}
reCacheRedisKey = function *(){
  this.is('application/json');
  this.body = yield cacheQuery;
}

module.exports = reCacheRedisKey;
