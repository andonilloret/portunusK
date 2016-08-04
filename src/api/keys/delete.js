//var client = require("redis").createClient({ host:"localhost", port:'6379'});
var client = require("redis").createClient({ host:process.env.REDIS_HOST , port:'6379'});

function getallRedisKeys(callback){
  if(this.params){
    ctx = this;
    client.send_command('del', [this.params.rediskey],function(err, res){
      var msg = {'msg': 'success'};
      if(res === 0){
        ctx.response.status = 404
        msg = {'msg': 'Key not found'};
      }
      callback(err, msg);
    });
  }else {
    ctx.response.status = 400;
    callback(null,{'msg': 'Bad Request'});
  }
}
deleleteRedisKey = function *(){
  this.is('application/json');
  this.body = yield getallRedisKeys;
}

module.exports = deleleteRedisKey;
