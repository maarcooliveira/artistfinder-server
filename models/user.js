var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	favorites: {
		type: [String],
		required: false
	},
	signupDate: {
		type: Date,
		required: true
	},
	collaborations: {
		type: [String],
		required: false
	}
	
});

module.exports = mongoose.model('User', UserSchema);