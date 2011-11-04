var Backbone = require('backbone');

function User() { // @extends Backbone.Model
	return Backbone.Model.apply(this, arguments);
}

User.prototype = Backbone.Model.prototype;

// by default export all uppercase properties and validate
User.__exports__ = [/^[A-Z]+[A-Z_]+/, 'validate'];

User.EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

User.prototype.validate = function validate() {
	var email = this.get('email');
	return !!email.match(User.EMAIL_REGEX);
};

User.prototype.updateDB = function updateDB() {
	//server-only logic here...
};

exports.User = User;