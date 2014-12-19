var express = require('express');

module.exports = function(router){
    var app = express();
    app.use(router.handler());
    return app;
}