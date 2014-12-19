var express = require('express');
var Router = require('./router');
var http = require('http');
var Controller = require('./controller');

var MyCtrl = Controller.extend(function MyCtrl(req, res){
    this._construct(req, res);

    return this;
});

MyCtrl.prototype.test = function(next){
    this.res.write(this.something + "<br/>");
    this.res.write('InsideMethod<br/>');
    this.res.write('params: ' + JSON.stringify(this.req.params, null, 2) + "<br/>");
    this.res.write('body: ' + JSON.stringify(this.req.body, null, 2) + "<br/>");
    this.res.write('query: ' + JSON.stringify(this.req.query, null, 2) + "<br/>");
    next();
}

MyCtrl.prototype.methodMissing = function(next){
    this.res.write('InsideMethodMissing<br/>');
    next();
}

MyCtrl.before(function(next){
    console.log('test');
    this.res.set('content-type', 'text/html');
    this.res.write('BeforeFilter<br/>');
    next();
});

MyCtrl.after(function(next){
    this.res.write('AfterFilter<br/>');
    this.res.end();
    next();
})

var ex = express();

var app = new Router(null, function(path){
    return function(){
        MyCtrl.handle.apply(MyCtrl, arguments);
    };
});

app.scope('/test', function(app){
   app.get('/:id/:data', function(req, res, next){
       res.json({test: true});
   });
});

app.get('/test', 'test#test');
app.get('*', 'test');

ex.use(app.handler());

var server = http.createServer(ex);

server.listen(process.env.PORT);
