var eRouter = require('express').Router;
var verbs = ['all', 'get', 'post', 'put', 'delete'];

function makeArray(e) {
	if (!e) {
		return [];
	} else if (Array.isArray(e)) {
		return e;
	} else {
		return [e];
	}
}

function Router(config, resolve) {
	var self = this;
	var router = eRouter(config);

	if (!resolve) {
		resolve = function (path) {
			var ctrl = require(path);

			return function () {
				ctrl.handle.apply(ctrl, arguments);
			};
		};
	}

	function applyOptions(router, options) {
		options.use = makeArray(options.use);
		if (options.use.length > 0) {
			router.use.apply(router, options.use);
		}
		return router;
	}

	this.use = function (middlewares) {
		applyOptions(router, {
			use: middlewares
		});
		return this;
	};

	this.scope = function (url, options, fn) {
		if (typeof (options) == 'function') {
			fn = options;
			if (typeof (url) == 'string') {
				options = {};
			} else {
				options = url;
				url = null;
			}
		}
		var scope = new Router(config, resolve);

		applyOptions(scope, options);

		fn(scope);

		if (url) {
			router.use(url, scope.handler());
		} else {
			router.use(scope.handler());
		}

		return this;
	};

	function makeControllerHandler(controller, method) {
		var handler = resolve(controller);

		return function (req, res, next) {
			req.__controller = controller;
			if (method) {
				req.__method = method;
			}

			handler(req, res, next);
		};
	}

	function makeHandler(options, handler) {
		if (typeof (options) != 'object') {
			handler = options;
			options = {};
		}
		if (typeof (handler) == 'function') {
			return handler;
		}

		var controller = null;
		var method = null;

		if (typeof (handler) == 'string') {
			var parts = handler.split('#');
			controller = parts[0];
			method = parts[1];
		} else {
			if (!options.controller || !options.method) {
				throw new Error('Undefined handler');
			} else {
				controller = options.controller;
				method = options.method;
			}
		}

		return makeControllerHandler(controller, method);
	};

	function handleVerb(verb, url, options, handler) {
		if (typeof (options) == 'function') {
			handler = options;
			options = {};
		}
		var args = [url].concat(makeArray(options.use));
		args.push(makeHandler(options, handler));
		router[verb].apply(router, args);
		return this;
	}

	function init() {
		verbs.forEach(function (verb) {
			self[verb] = function (url, options, handler) {
				handleVerb(verb, url, options, handler);
			};
		});
	}

	this.handler = function () {
		return router;
	};

	init();
}

module.exports = Router;
