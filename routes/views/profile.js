'use strict';
const keystone = require('keystone');
const fs = require('fs');

exports = module.exports = (req, res) => {

	let view = new keystone.View(req, res);
	let locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'profile';

	// Accept form post submit
	view.on('post', { action: 'edit-profile' }, next => {		
		let updater = locals.user.getUpdateHandler(req, res, {
			errorMessage: 'There was an error editing your profile:'
		});

		// console.log('yooooo');
		// console.log(locals.user.description);
		// console.log('ayyyyyy');
		// locals.user.description = 'TESTTTTTTT';
		// console.log(locals.user.description);
		// console.log('supppppp');
		// cleanText = strInputCode.replace(/<\/?[^>]+(>|$)/g, "");

		updater.process(req.body, {
			flashErrors: true,
			logErrors: true,
			fields: 'profileImage, email, name, password, description'
		}, err => {
			if (err) {
				locals.validationErrors = err.errors;
				next();
			} else {
				req.flash('success', 'Profile updated');
				res.redirect('/profile');
			}

			// console.log(locals.user.description);
			// console.log('oh no');
		});
	});

	view.render('profile');
};
