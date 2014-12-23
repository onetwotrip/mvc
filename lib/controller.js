var Class = require('class');

function getMethodFilters(type, method) {

    var applied = [];
    var filters = this.getFilters(type);
    for (var i = 0, k = filters.length; i < k; i++) {
        var f = filters[i];

        var methods = f[0];
        var filter = f[1];

        if (methods.indexOf(method) || methods.indexOf('*')) {
            applied.push(filter);
        }
    }
    return applied;
}

function processFilterArgs(ctrl, key, methods, fn) {
    if (typeof (methods) === 'function') {
        fn = methods;
        methods = ['*'];
    }
    if (typeof (methods) === 'string') {
        methods = [methods];
    }

    for(var i = 0, k = methods.length; i < k; i++){
        ctrl.__filters[methods[i]]
    }

    this.__filters = this.__filters || {
        before: [],
        after: []
    };
    this.__filters[key].push([methods, fn]);
}

var Controller = Class.extend(function Controller(req, res) {
    this._construct();
    var self = this;

    this.req = req;
    this.res = res;

    return this;
});

Controller.prototype.methodMissing = function (next) {
    next();
};

Controller.getFilters = function (type) {
    return this.__filters[type] || [];
};

Controller.initFilters = function (type) {
    if (this._super.getFilters) {
        this.__filters[type] = this._super.getFilters(type);
    } else {
        this.__filters[type] = [];
    }
};

Controller.init = function () {
    this.__filters = {};
    this.initFilters('before');
    this.initFilters('after');
};

Controller.before = function (methods, fn) {
    processFilterArgs.call(this, 'before', methods, fn);
};

Controller.after = function (methods, fn) {
    processFilterArgs.call(this, 'after', methods, fn);
};

Controller.action = function (name, fn) {
    this.prototype[name] = fn;
};

Controller.handle = function (req, res, next) {

    var inst = new this(req, res, next);
    var methodName = req.__method;
    var method = (methodName && inst[methodName]) ? inst[methodName] : inst.methodMissing;
    var stack = getMethodFilters.call(this, 'before', methodName);
    stack.push(method);
    stack = stack.concat(getMethodFilters.call(this, 'after', methodName));

    function callStack(err) {

        if (err) {
            next(err);
        }
        var s = stack.shift();
        if (s) {
            s.call(inst, callStack);
        }
    }

    callStack();
};

Controller.init();

module.exports = Controller;
