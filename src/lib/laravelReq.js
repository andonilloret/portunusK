//var client = require("redis").createClient({ host:"localhost", port:'6379'});
var client = require("redis").createClient({ host:process.env.REDIS_HOST , port:'6379'});
var moment = require("moment");
var request = require('request');

//TODO: Sacar ISVUrl que está en duro
var ISVurl = 'http://local.test.instoreview.cl'
var jobQueue = [];
var io;

module.exports = function () {
  // middleware
  return function *laravelRequests(next) {
    this.doLaravelRequest = doLaravelRequest;
    this.getLaravelRequestJobQueue = getLaravelRequestJobQueue;
    io = this.app.io;
    yield next;
  }
}

function appendRequestJob(key, query){
  var job = jobQueue.find(function(job){return job.key == key});
  if(!job){
    jobQueue.push({"key": key, "query": query, queuedDate: new Date()});
    if(jobQueue.length == 1)
      execJobs();
  }
}

function execJobs(){
  //TODO: Ver si los objetos job son mutables
  jobQueue[0].jobStart = new Date();
  getLaravelRequestJobQueue();
  var job = jobQueue[0];
  // CHUNKS
  // 0: Platform Name (ISV, Point, ...)
  // 1: Client Name (Clorox, ICB, ...)
  // 2: View
  // ...
  keyChunks = job.key.split(".");
  doRequest(keyChunks[1], job.query, function(err, res){
    if(err)
      io.emit("cachedERROR", "La llave no se ha podido recachear");
    else
      io.emit("cachedOK", "La llave ha sido recacheada en " + (new Date() - job.jobStart)/1000 + "segundos.");
    jobQueue.shift();
    if(jobQueue.length > 0) execJobs();
  });
}

function doLaravelRequest(key, callback) {
  if(!key || !callback) return;
  client.hgetall(key, function (err, value) {
    if(err){
      callback({"error": true, "msg": "Key not found"});
    }else{
      appendRequestJob(key, value.query);
      callback(null, {"status": 200, "msg": "Se envio la petición para refrescar la llave"});
    }
  });
}

function doRequest(user, url, callback) {
  request.post( ISVurl + '/login',
  {form: {usuario: user + '.isv', password: 'qazwsxedc'}},
  function(e, r, body){
    if(e){
      callback({"error": true, "msg": 'Login Error'})
    }else{
      if(!/&nocache=true/.test(url))
        url += "&nocache=true";
      var j = request.jar();
      j.setCookie(request.cookie(r['headers']['set-cookie'][0].match(/PHPSESSID=[a-z0-9]*/i)[0]), ISVurl);
      j.setCookie(request.cookie(r['headers']['set-cookie'][1].match(/laravel_session=[a-z0-9]*/i)[0]), ISVurl);
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

function getLaravelRequestJobQueue(platform, client){
  if(!platform) platform = "";
  if(!client) client = "";
  var reg = new RegExp(platform + "." + client, "i");
  return jobQueue.filter(function(job){ return reg.test(job.key)});
}
