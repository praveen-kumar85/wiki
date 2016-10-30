"use strict";

const modb = require('mongoose'),
			Promise = require('bluebird'),
			bcrypt = require('bcryptjs-then'),
			_ = require('lodash');

/**
 * Region schema
 *
 * @type       {<Mongoose.Schema>}
 */
var userSchema = modb.Schema({

	email: {
		type: String,
		required: true,
		index: true
	},

	provider: {
		type: String,
		required: true
	},

	providerId: {
		type: String
	},

	password: {
		type: String
	},

	name: {
		type: String
	},

	rights: [{
		type: String
	}]

},
{
	timestamps: {}
});

userSchema.statics.processProfile = (profile) => {

	let primaryEmail = '';
	if(_.isArray(profile.emails)) {
		let e = _.find(profile.emails, ['primary', true]);
		primaryEmail = (e) ? e.value : _.first(profile.emails).value;
	} else if(_.isString(profile.email) && profile.email.length > 5) {
		primaryEmail = profile.email;
	} else {
		return Promise.reject(new Error('Invalid User Email'));
	}
	
	return db.User.findOneAndUpdate({
		email: primaryEmail,
		provider: profile.provider
	}, {
		email: primaryEmail,
		provider: profile.provider,
		providerId: profile.id,
		name: profile.displayName
	}, {
		new: true,
		upsert: true
	}).then((user) => {
	  return (user) ? user : Promise.reject(new Error('User Upsert failed.'));
	});

};

userSchema.statics.hashPassword = (rawPwd) => {
	return bcrypt.hash(rawPwd);
};

userSchema.methods.validatePassword = function(rawPwd) {
	let self = this;
	return bcrypt.hash(rawPwd).then((pwd) => {
		return (self.password === pwd) ? true : Promise.reject(new Error('Invalid Password'));
	});
};

module.exports = modb.model('User', userSchema);