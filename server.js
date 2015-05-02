// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Artist = require('./models/artist');
var Album = require('./models/album');
var Changelog = require('./models/changelog');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://admin:admin@ds031882.mongolab.com:31882/artistfinder');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
	next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
	extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
	res.json({ message: 'Welcome! Check the API doc at https://github.com/maarcooliveira/artistfinder-server' });
});

//User route 
var userRoute = router.route('/users');

userRoute.get(function(req, res) {  
	var name = req.query.name === undefined ? {} : {"name" : "\"" + req.query.name + "\""};
	var sort = req.query.sort === undefined ? {} : JSON.parse(req.query.sort);
	var limit = req.query.limit === undefined ? 0 : req.query.limit;
	
	User.find(name).sort(sort).limit(limit).exec(function (err, users) {
		if (err) {
			res.statusCode = 500;
			res.json({ message: 'Server error. Please try again later', data: [] });
		}
		else {
			res.json({ message: 'ok', data: users });
		}
	});
});

userRoute.post(function(req, res) {
	var user = new User();
	user.name = req.body.name;
	user.email = req.body.email;
	user.password = req.body.password;
	user.favorites = [];
	user.signupDate = new Date();
	user.collaborations = [];
	
	if (!(user.name && user.email && user.password)) {
		res.statusCode = 500;
		res.json({ message: 'Name, email and password are required fields', data: [] });
	}
	else {
		user.save(function(err) {
			if (err) {
				res.statusCode = 500;
				res.json({ message: 'Email already in use', data: [] });
			}
			else {
				res.statusCode = 201;
				res.json({ message: 'User added', data: user });
			}
		});
	}
});

userRoute.options(function(req, res) {
	res.writeHead(200);
	res.end();
});


var userIdRoute = router.route('/users/:id');

userIdRoute.get(function(req, res) {
	User.findById(req.params.id, function(err, user) {
		if (err || !user) {
			res.statusCode = 404;
			res.json({ message: 'User not found', data: [] });
		}
		else
			res.json({ message: 'ok', data: user });
	});
});

userIdRoute.put(function(req, res) {
	User.findById(req.params.id, function(err, user) {
		if (err) {
			res.statusCode = 404;
			res.json({ message: 'User not found', data: [] });
		}
		else {
			user.name = req.body.name;
			user.email = req.body.email;
			user.password = req.body.password;
			user.favorites = req.body.favorites;
			user.collaborations = req.body.collaborations;
			if (!(user.name && user.email && user.password && user.favorites && user.collaborations)) {
				res.statusCode = 500;
				res.json({ message: 'Missing required fields', data: [] });
			}
			else {
				user.save(function (err) {
					if (err) {
						res.statusCode = 500;
						res.json({ message: 'Email already in use', data: [] });
					}
					else
						res.json({ message: 'User updated', data: [] });
				});
			}	
		}
	});
});

userIdRoute.delete(function(req, res) {
	User.remove({
		_id: req.params.id
	}, function(err, user) {
		if (err) {
			res.writeHead(404);
			res.end();
		}
		else if (user === 1) {
			res.json({ message: 'User deleted', data: [] });
		}
		else {
			res.statusCode = 404;
			res.json({ message: 'User not found', data: [] });	
		}
	});
});


//Artist route 
var artistRoute = router.route('/artists');

artistRoute.get(function(req, res) {
	var name = req.query.name === undefined ? {} : {"name" : "\"" + req.query.name + "\""};
	var sort = req.query.sort === undefined ? {} : JSON.parse(req.query.sort);
	var limit = req.query.limit === undefined ? 0 : req.query.limit;
	
	Artist.find(name).sort(sort).limit(limit).exec(function (err, artists) {
		if (err) {
			res.statusCode = 500;
			res.json({ message: 'Error. Please check your query or try again later', data: [] });
		}
		else {
			res.json({ message: 'ok', data: artists });
		}
	});
});

artistRoute.post(function(req, res) {
	var artist = new Artist();
	artist.name = req.body.name;
	artist.bio = req.body.bio;
	artist.image = req.body.image;
	artist.isBand = req.body.isBand;
	artist.members = req.body.members;
	artist.memberOf = req.body.memberOf;
	artist.lastfm = req.body.lastfm;
	artist.twitter = req.body.twitter;
	artist.facebook = req.body.facebook;
	artist.favCount = 0;
	
	if (!(artist.name && artist.isBand)) {
		res.statusCode = 500;
		res.json({ message: 'Name and isBand are required fields', data: [] });
	}
	else {
		artist.save(function(err) {
			if (err) {
				res.statusCode = 500;
				res.json({ message: 'Server error. Please try again later', data: [] });
			}
			else {
				res.statusCode = 201;
				res.json({ message: 'Artist added', data: artist });
				var log = new Changelog();
				log.model = 'artist';
				log.modelId = artist._id;
				log.userId =  req.body.userId;
				log.date = new Date();
				log.operation = 'post';
				log.save();
			}
		});
	}
});

artistRoute.options(function(req, res) {
	res.writeHead(200);
	res.end();
});


var artistIdRoute = router.route('/artists/:id');

artistIdRoute.get(function(req, res) {
	Artist.findById(req.params.id, function(err, artist) {
		if (err || !artist) {
			res.statusCode = 404;
			res.json({ message: 'Artist not found', data: [] });
		}
		else
			res.json({ message: 'ok', data: artist });
	});
});

artistIdRoute.put(function(req, res) {
	Artist.findById(req.params.id, function(err, artist) {
		if (err) {
			res.statusCode = 404;
			res.json({ message: 'Artist not found', data: [] });
		}
		else {
			artist.name = req.body.name;
			artist.bio = req.body.bio;
			artist.image = req.body.image;
			artist.isBand = req.body.isBand;
			artist.members = req.body.members;
			artist.memberOf = req.body.memberOf;
			artist.lastfm = req.body.lastfm;
			artist.twitter = req.body.twitter;
			artist.facebook = req.body.facebook;
			artist.favCount = req.body.favCount;
			
			if (!(artist.name && artist.isBand)) {
				res.statusCode = 500;
				res.json({ message: 'Name and isBand are required fields', data: [] });
			}
			else {
				artist.save(function (err) {
					if (err) {
						res.statusCode = 500;
						res.json({ message: 'Server error. Please try again later', data: [] });
					}
					else {
						res.json({ message: 'Artist updated', data: artist });
						var log = new Changelog();
						log.model = 'artist';
						log.modelId = artist._id;
						log.userId =  req.body.userId;
						log.date = new Date();
						log.operation = 'put';
						log.save();
					}
				});
			}	
		}
	});
});

artistIdRoute.delete(function(req, res) {
	Artist.remove({
		_id: req.params.id
	}, function(err, artist) {
		if (err) {
			res.writeHead(404);
			res.end();
		}
		else if (artist === 1) {
			res.json({ message: 'Artist deleted', data: [] });
		}
		else {
			res.statusCode = 404;
			res.json({ message: 'Artist not found', data: [] });	
		}
	});
});


//Album route 
var albumRoute = router.route('/albums');

albumRoute.get(function(req, res) {
	var name = req.query.name === undefined ? {} : {"name" : "\"" + req.query.name + "\""};
	var artist = req.query.name === undefined ? {} : {"artistId" : "\"" + req.query.artist + "\""};
	var sort = req.query.sort === undefined ? {} : JSON.parse(req.query.sort);
	var limit = req.query.limit === undefined ? 0 : req.query.limit;
	var where = artist === {} ? name : artist;
	
	Artist.find(where).sort(sort).limit(limit).exec(function (err, albums) {
		if (err) {
			res.statusCode = 500;
			res.json({ message: 'Error. Please check your query or try again later', data: [] });
		}
		else {
			res.json({ message: 'ok', data: albums });
		}
	});
});

albumRoute.post(function(req, res) {
	var album = new Album();
	album.name = req.body.name;
	album.artistId = req.body.artistId;
	album.image = req.body.image;
	album.releaseDate = req.body.releaseDate;
	album.tracks = req.body.tracks;
	
	if (!(album.name && album.artistId)) {
		res.statusCode = 500;
		res.json({ message: 'Name and artistId are required fields', data: [] });
	}
	else {
		album.save(function(err) {
			if (err) {
				res.statusCode = 500;
				res.json({ message: 'Server error. Please try again later', data: [] });
			}
			else {
				res.statusCode = 201;
				res.json({ message: 'Album added', data: album });
				var log = new Changelog();
				log.model = 'album';
				log.modelId = album._id;
				log.userId =  req.body.userId;
				log.date = new Date();
				log.operation = 'post';
				log.save();
			}
		});
	}
});

albumRoute.options(function(req, res) {
	res.writeHead(200);
	res.end();
});


var albumIdRoute = router.route('/albums/:id');

albumIdRoute.get(function(req, res) {
	Album.findById(req.params.id, function(err, album) {
		if (err || !album) {
			res.statusCode = 404;
			res.json({ message: 'Album not found', data: [] });
		}
		else
			res.json({ message: 'ok', data: album });
	});
});

albumIdRoute.put(function(req, res) {
	Album.findById(req.params.id, function(err, album) {
		if (err) {
			res.statusCode = 404;
			res.json({ message: 'Album not found', data: [] });
		}
		else {
			album.name = req.body.name;
			album.image = req.body.image;
			album.releaseDate = req.body.releaseDate;
			album.tracks = req.body.tracks;
			
			if (!(album.name)) {
				res.statusCode = 500;
				res.json({ message: 'Name is a required fields', data: [] });
			}
			else {
				album.save(function (err) {
					if (err) {
						res.statusCode = 500;
						res.json({ message: 'Server error. Please try again later', data: [] });
					}
					else {
						res.json({ message: 'Album updated', data: album });
						var log = new Changelog();
						log.model = 'album';
						log.modelId = album._id;
						log.userId =  req.body.userId;
						log.date = new Date();
						log.operation = 'put';
						log.save();
					}
				});
			}	
		}
	});
});

albumIdRoute.delete(function(req, res) {
	Album.remove({
		_id: req.params.id
	}, function(err, album) {
		if (err) {
			res.writeHead(404);
			res.end();
		}
		else if (album === 1) {
			res.json({ message: 'Album deleted', data: [] });
		}
		else {
			res.statusCode = 404;
			res.json({ message: 'Album not found', data: [] });	
		}
	});
});


//Changelog route 
var changelogRoute = router.route('/changelogs');

changelogRoute.get(function(req, res) {
	var user = req.query.user === undefined ? {} : {"userId" : "\"" + req.query.user + "\""};
	var sort = req.query.sort === undefined ? {} : JSON.parse(req.query.sort);
	var limit = req.query.limit === undefined ? 0 : req.query.limit;
	
	Artist.find(user).sort(sort).limit(limit).exec(function (err, logs) {
		if (err) {
			res.statusCode = 500;
			res.json({ message: 'Server error. Please try again later', data: [] });
		}
		else {
			res.json({ message: 'ok', data: logs });
		}
	});
});

// Start the server
app.listen(port);
console.log('Awesome! See everything working on port ' + port); 