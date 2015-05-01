var mongoose = require('mongoose');

var ChangelogSchema = new mongoose.Schema({
	model: { //artist or album
		type: String,
		required: true
	},
	modelId: {
		type: String,
		required: true	
	},
	userId: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	},
	operation: { //insert or update
		type: String,
		required: false
	}
	
});

module.exports = mongoose.model('Changelog', ChangelogSchema);