'use strict';
const keystone = require('keystone');
const moment = require('moment');

// Docs: http://keystonejs.com/docs/database/#fieldtypes
const Types = keystone.Field.Types;

// Docs: http://keystonejs.com/docs/database/#lists-options
const options = {
	autokey: { path: 'slug', from: 'title', unique: true },
	map: { name: 'title' },
	singular: 'Post',
	plural: 'Posts',
	sortable: true,
	defaultSort: '-publishedAt',
	drilldown: 'author'
};

const TextPost = new keystone.List('TextPost', options);

/* On Create Post: Add title, author, textContent. Set isPublished if
	the post is not a draft. Everything else should not be touched and
	will be set automatically! */
TextPost.add({
	title: { type: Types.Text, required: true },
	author: { type: Types.Relationship, ref: 'User', required: true,
		initial: true },
	isPublished: { type: Types.Boolean, default: false },
	draftedAt: { type: Types.Datetime, default: Date.now, noedit: true },
	publishedAt: { type: Types.Datetime, noedit: true },
	lastEditedAt: { type: Types.Datetime, noedit: true },
	editCount: { type: Types.Number, default: 0, noedit: true },
	textContent: { type: Types.Html, required: true, initial: true,
		wysiwyg: true, note: 'Can be expanded' },
	postImage: { type: Types.LocalFile, dest: 'public/images/posts',
		prefix: 'images/posts',
		filename: function (item, file) {
			return item._id + '.' + file.extension;
		},
		format: function (item, file) {
			return '/images/posts/'+ file.filename;
		}
	},
	silentEdit: { type: Types.Boolean, default: false,
		note: 'Use to edit a post from the admin UI without \
			changing the edit counter. Be sure to set to false again after \
			you finish your edit.' }

});

/* Set up the Mongoose schema
	API Docs: http://mongoosejs.com/docs/api.html
	Docs on Pre and Post: http://mongoosejs.com/docs/middleware.html */
TextPost.schema.methods.wasEdited = function () {
	return this.editCount > 0;
};

TextPost.schema.virtual('textLength').get(function () {
	const length = this.textContent.length;
	if (length < 35) return 'xs';
	else if (length <= 70) return 's';
	else if (length <= 140) return 'm';
	else return 'l';
});

/* Set the published date when the post first gets published
	or set the edit date and the edit counter */
TextPost.schema.pre('save', function (next) {
	if (this.isModified('isPublished') && this.isPublished &&
		!this.publishedAt) {
		this.publishedAt = moment();
	} else if (this.isModified('textContent') && this.isPublished
		&& !this.silentEdit) {
		this.lastEditedAt = moment();
		this.editCount += 1;
	}

	next(); // Everyone loves callback hell
});

TextPost.schema.post('save', function () {
	if (this.silentEdit) {
		this.silentEdit = false;
		console.log('An admin attempted a silent edit at ' + new Date() +
			'.');
	}
});

TextPost.schema.pre('update', function (next) {
	if (this.isPublished && !this.publishedAt) {
		this.publishedAt = moment();
	}
	next();
});

TextPost.schema.post('update', function () {
	if (this.silentEdit) {
		this.silentEdit = false;
		console.log('An admin attempted a silent edit at ' + new Date() + '.');
	}
});

TextPost.defaultColumns = 'title, author, isPublished,' +
	' draftedAt, publishedAt';

TextPost.register();
