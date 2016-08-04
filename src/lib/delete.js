var request = require('request');
var moment = require("moment");
var redis = require("redis"),
    client = redis.createClient({ host:"localhost", port:'6379'});
var cookies = []
var ISVUurl = 'http://local.test.instoreview.cl'

var LaravelRequest = function() {}

LaravelRequest.prototype.doRequest = function (user, url, callback) {
  request.post( ISVUurl + '/login',
  {form: {usuario: user + '.isv', password: 'qazwsxedc'}},
  function(e, r, body){
    if(e){
      callback({"error": true, "msg": 'Login Error'})
    }else{
      if(!/&nocache=true/.test(url))
        url += "&nocache=true";
      var j = request.jar();
      j.setCookie(request.cookie(r['headers']['set-cookie'][0].match(/PHPSESSID=[a-z0-9]*/i)[0]), ISVUurl);
      j.setCookie(request.cookie(r['headers']['set-cookie'][1].match(/laravel_session=[a-z0-9]*/i)[0]), ISVUurl);
      request({url: url, jar: j, timeout: 0}, function (e, r, body) {
        if(e){
          callback({"error": true, "msg": 'Couldn\t get data'});
        }else{
          if(/<!DOCTYPE html>/.test(body))
            callback({error: "Unexpected response"});
          else
            callback(null, body);
        }
      })
    }
  });
}

LaravelRequest.prototype.getFreshKeyData = function (key, callback) {
  client.hgetall(key, function (err, value) {
    if(err){
      callback({"error": true, "msg": "Key not found"});
    }else{
      // CHUNKS
      // 0: Platform Name (ISV, Point, ...)
      // 1: Client Name (Clorox, ICB, ...)
      // 2: View
      // ...
      keyChunks = key.split(".");
      LaravelRequest.prototype.doRequest(keyChunks[1], value.query, function(err, res){
        if(err)
          callback(null, {"status": 500, "err": err});
        else
          callback(null, {"status": 200, "date": moment.utc().format("YYYY-MM-DD HH:mm:ss"), "msg": res});
      });
    }
  });
}

module.exports = new LaravelRequest();
