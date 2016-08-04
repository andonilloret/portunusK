//var client = require("redis").createClient({ host:"localhost", port:'6379'});
var client = require("redis").createClient({ host:process.env.REDIS_HOST , port:'6379'});

function getValues(storedKeys, keys, callback){
  if(storedKeys.length == 0)
    return callback(null, keys);
  var key = storedKeys.pop();
  client.hgetall(key.toString(), function (err, value) {
    if(!err){
      keys.push({
        'key': key.toString(),
        'val': value.data.toString(),
        'date': value.date
      });
      return getValues(storedKeys, keys, callback);
    }else {
      return getValues(storedKeys, keys, callback);
    }
  });
}

function getallRedisKeys(callback){
  ctx = this;
  keys = [];
  jobs = ctx.getLaravelRequestJobQueue();
  client.keys("*", function(err, storedKeys){
    getValues(storedKeys, keys, function(err, res){
      callback(null, ctx.render("index", { "keys": keys, "jobs": jobs}));
    });
  });
}

index = function *(){
  this.body = yield getallRedisKeys;
}

module.exports = index;
