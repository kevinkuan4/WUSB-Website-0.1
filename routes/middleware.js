/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */

const _ = require('underscore');
const keystone = require('keystone');
const User = keystone.list('User');
const Program = keystone.list('Program');
const Playlist = keystone.list('Playlist');


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/

exports.initLocals = function(req, res, next) {
	const locals = res.locals;
	locals.navLinks = [
		{label: 'Home', key: 'home', href: '/'},
		{label: 'Playlists', key: 'playlists', href: '/playlists'},
		{label: 'Programs', key: 'programs', href: '/programs'},
		{label: 'DJs', key: 'djs', href: '/djs'},
		{label: 'Schedule', key: 'schedule', href: '/schedule'},
		{label: 'Concert Billboard', key: 'billboard', href:'https://calendar.google.com/calendar/embed?src=usbcbb@gmail.com'},
		{label: 'Pledge', key: 'pledge', href: 'https://docs.google.com/forms/d/e/1FAIpQLSdHna3i-oM6mQ6cSpETpT6VvEoFXR0TuNdOTebG0KNuucOhoA/viewform?c=0&w=1'} 
	];
	locals.user = req.user;
	Program.model.getLiveProgram(function (err, prg) {
		keystone.populateRelated(prg, 'djs', (err) => {
			locals.prg = prg;
			next();
		});
	});
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/

exports.flashMessages = (req, res, next) => {
	const flashMsgs = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error')
	};
	res.locals.messages = _.any(flashMsgs, m => m.length) ? flashMsgs : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */

exports.requireUser = (req, res, next) => {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};


/**
 Prevents people from accessing protected pages when they're not admins
 */

exports.requireAdmin = (req, res, next) => {
	if (!req.user || !req.user.isAdmin) {
		req.flash('error', 'You must be an admin to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};

/**
 Load users
 */

exports.loadUsers = (req, res, next) => {
	User.model.find().exec((err, users) => {
		if (err) return next(err);
		req.users = users;
		res.locals.users = users;
		next();
	});
};

/**
 	Load programs
 */

exports.loadPrograms = (req, res, next) => {
	Program.model.find().exec((err, programs) => {
		if (err) return next(err);
		req.programs = programs;
		res.locals.programs = programs;
		next();
	});
};


/**
 	Load a playlist
 */

exports.loadPlaylist = (req, res, next) => {
	const playlistId = req.params.id;
	if (playlistId) {
		Playlist.model.findOne({ _id: playlistId })
		.populate(['program', 'author'])
		.exec((err, playlist) => {
			if (err) return next(err);
			req.playlist = playlist;
			res.locals.playlist = playlist;
			next();
		});
	}
	else {
		next();
	}
};


/**
 Load a program
 */

exports.loadProgram = (req, res, next) => {
	const programSlug = req.params.slug;
	if (programSlug) {
		Program.model.findOne({ slug: programSlug })
			.populate(['djs', 'playlists'])
			.exec((err, program) => {
				if (err) return next(err);
				req.program = program;
				res.locals.program = program;
				next();
			});
	}
	else {
		next();
	}
};

/**
 Load a dj
 */

exports.loadDJ = (req, res, next) => {
	var theDJ;
	const djSlug = req.params.slug;
	if (djSlug) {
		User.model.findOne({ slug: djSlug })
			.exec((err, user) => {
				if (err) return next(err);
				req.dj = user;
				res.locals.dj = user;
				theDJ = user;
				Program.model.find({ djs: user })
				.populate(['playlists'])
					.exec((err, programs) => {
						if (err) return next(err);
						req.programs = programs;
						res.locals.programs = programs;
						next();
					});
			});
	}
	else {
		next();
	}
};