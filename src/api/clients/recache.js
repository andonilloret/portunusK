var client = require("redis").createClient({ host:(process.env.REDIS_HOST || "localhost"), port:'6379'});

function cacheQuery(callback){
  ctx = this;
  if(ctx.params){
    client.keys(ctx.params.clientName+"*", function (err, keys) {
      for(keyIndex in keys)
        ctx.doLaravelRequest(keys[keyIndex], function(err, msg){});
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
