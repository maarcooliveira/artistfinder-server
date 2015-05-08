module.exports = function(app, passport) {

	app.post('/api/signup', passport.authenticate('local-signup'), function(req, res) {
		res.json({
			user: req.user
		});
	});

	app.post('/api/signin', passport.authenticate('local-login'), function(req, res) {
		req.session.user = req.user;
		res.json({
			user: req.user
		});
	});

	app.get('/api/profile', isLoggedIn, function(req, res) {
		res.json({
			user: req.user
		});
	});

	app.get('/api/logout', function(req, res) {
		req.logout();
	});

	function isLoggedIn(req, res, next) {
		if(req.isAuthenticated())
			return next();

		res.json({
			error: "User not logged in"
		});
	}

};