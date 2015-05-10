var mongoose = require('mongoose');

var ArtistSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	bio: {
		type: String,
		required: false
	},
	image: {
		type: String,
		required: false
	},
	isBand: {
		type: Boolean,
		required: true
	},
	members: {
		type: [String],
		required: false
	},
	memberOf: {
		type: String,
		required: false	
	},
	lastfm: {
		type: String,
		required: false
	},
	twitter: {
		type: String,
		required: false
	},
	facebook: {
		type: String,
		required: false
	},
	instagram: {
		type: String,
		required: false
	},
	spotify: {
		type: String,
		required: false
	},
	website: {
		type: String,
		required: false
	},
	favCount: {
		type: String,
		required: true
	}
	
});

module.exports = mongoose.model('Artist', ArtistSchema);