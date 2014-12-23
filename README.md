# Simple MVC library
Do not use :)

```javascript
var mvc = require('mvc');

var Controller = mvc.Controller;
var app = mvc.application;
var Router = mvc.router;

var MyCtrl = Controller.extend(function(){
    this._construct.apply(this, arguments);
    return this;
});

MyCtrl.action('test', function(){
    this.res.json({controller: true});
    next();
});

var router = new Router(null, function(ctlrl){
    return function(){
        MyCtrl.handle.apply(MyCtrl, arguments);
    }
});

router.get('/', function(req, res){
    res.json({test: true});
});

router.get('/ctrl', 'myctrl#test');

app(router).listen(process.env.PORT);
```
