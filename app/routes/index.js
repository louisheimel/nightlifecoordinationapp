'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var Yelp = require('yelp');
var _ = require('underscore');
var bodyParser = require('body-parser');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/auth/twitter/callback');
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
			res.render('../views/search');
		});
		
	// Twitter routes
	
	app.route('/auth/twitter', passport.authenticate('twitter'));
	
	app.get('/auth/twitter/callback',
		passport.authenticate(
							'twitter',{
								successRedirect: 'profile',
								failureRedirect: '/',
							}))
	
	app.route('/searchvenues')
		.get(function(req, res, next) {
			// hit yelp api to get locations
			var yelp = new Yelp({
				consumer_key: "w8ZpdjFUPH-94SPbI7tjCQ",
				consumer_secret: "0A9_-Ll4y3mVa6blZxz-IdyBlhg",
				token: "Rw_9B4UOyWJOGQKmvDiWXq7uyQIyDS5Z",
				token_secret: "ksAG3VgXM2bPSMPkUD3kkkuvWEc",
			});
			// console.log(req.body);
			// res.end(req.query.search);
			
			yelp.search({location: req.query.search})
				.then(function(data) {
					var first_twenty_businesses = _.first(data.businesses, 20)
													.map((e) => { return _.pick(e, 'name', 'snippet_text', 'id', 'image_url')})
													;
					// res.json(first_twenty_businesses);
					res.render('../views/venues', {businesses: first_twenty_businesses});
				});
		});
		
	app.route('/api/:restaurant_id/goingcount')
		.get()

	// app.route('/login')
	// 	.get(function (req, res) {
	// 		res.sendFile(path + '/public/login.html');
	// 	});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
};
