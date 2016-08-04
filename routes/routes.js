var router = require('koa-router')();

//WEBSITE ROUTES
router.get('/', require("../src/index/index"));

//API ROUTES
router.put('/api/clients/:clientName/recache', require("../src/api/clients/recache"));
router.del('/api/keys/:rediskey/delete', require("../src/api/keys/delete"));
router.put('/api/keys/:rediskey/recache', require("../src/api/keys/recache"));
router.put('/api/platforms/:platformPrefix/recache', require("../src/api/platforms/recache"));
router.get('/api/platforms/:platformPrefix/getjobs', require("../src/api/platforms/getjobs"));

module.exports = router;
