// Models should live in ./models
// ClientModelFactory.makeAll() will generate the client-side source for models, with
// only properties defined in the constructor's __exports__ array property.

var util = require('util'),
	fs = require('fs');

var EXTENDS_REGEX = /@extends (.+)/,
	JS_REGEX = /^[a-zA-Z0-9_\-]+\.js$/;

function log(s) {
	util.puts('[ClientModelFactory] ' + s);
}

function serialize(object, name, property) {
	if(property in object) {
		return name + '.' + property + ' = ' + object[property] + ';\n';
	} else if(property in object.prototype) {
		return name + '.prototype.' + property + ' = ' + object.prototype[property] + ';\n';
	} else {
		return '';
	}
}

function ClientModelFactory(modelpath) {
	this.models = {};

	var files = fs.readdirSync(modelpath);

	for(var i = 0; i < files.length; i++) {
		if(!files[i].match(JS_REGEX))
			continue;

		var name = files[i].replace('.js', '');
		log('loading model file: ' + files[i]);

		var module;

		try {
			module = require(modelpath + files[i]);
		} catch(e) {
			log('	skipping due to exception: ' + e);
			continue;
		}

		this.models[name] = '';

		for(var exp in module) {
			if(typeof module[exp] != 'function')
				continue;

			if('__exports__' in module[exp]) {
				// constructor
				this.models[name] += module[exp] + "\n";

				// handle inheritance using ghetto @extends comments
				var match = (''+module[exp]).match(EXTENDS_REGEX);
				if(match) {
					this.models[name] += this.extend(exp, match[1]);
				}

				var export_list = module[exp]['__exports__'];
				for(var j = 0; j < export_list.length; j++) {
					var prop = export_list[j];

					if(typeof prop == 'function') { // regular expression
						for(var p in module[exp]) {
							if(module[exp].hasOwnProperty(p) && p.match(prop))
								this.models[name] += serialize(module[exp], exp, p);
						}
					} else if(typeof prop == 'string') { // exact string
						this.models[name] += serialize(module[exp], exp, prop);
					}
				}
			}
		}
	}
}

ClientModelFactory.prototype.extend = function extend(child, parent) {
	// this code is inserted immediately after a constructor
	return child + '.prototype = ' + parent + '.prototype;\n';
};

ClientModelFactory.prototype.make = function make(model) {
	return this.models[model];
};

ClientModelFactory.prototype.makeAll = function makeAll() {
	var sources = [];

	for(var model in this.models) {
		sources.push(this.make(model));
	}

	return sources.join('');
};

exports.ClientModelFactory = global['ClientModelFactory'] || (global['ClientModelFactory'] = new ClientModelFactory(__dirname + '/models/'));