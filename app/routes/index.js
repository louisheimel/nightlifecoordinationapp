'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var Yelp = require('yelp');
var _ = require('underscore');
var bodyParser = require('body-parser');
var Venue = require('../models/venues.js');
var User = require('../models/users.js');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/auth/twitter/callback');
		}
	}
	
	function checkIfLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			req.loggedIn = true;
			return next();
		} else {
			req.loggedIn = false;
			return next();
		}
	}

	var clickHandler = new ClickHandler();

	app.route('/')
		.get(function (req, res) {
			res.render('../views/search');
		});
		
	// Twitter routes
	
	app.route('/api/:id/click')
		.get(isLoggedIn, function(req, res, next) {
			Venue.findOne({'id': req.params.id}, function(err, venue) {
				var new_venue;
				if (err) throw err;
				if (!venue) {
					User.findOne({_id: req._passport.session.user}, function(err, user) {
						if (err) throw err;
						new_venue = new Venue({
							id: req.params.id,
						});
						new_venue.guests.push(user._id);
						new_venue.save();
						res.json(new_venue.guests.length);
					});
				} else {
					User.findOne({_id: req._passport.session.user}, function(err, user) {
						if (err) throw err;
						// check if user is included in guests -> if so, remove from guests, if not, push to guests
						venue.toggleUser(user._id);
						venue.save();
						res.json(venue.guests.length);
					})
				}
			});
		})
		
	app.route('/api/:id/count')
		.get(function(req, res, next) {
			Venue.findOne({id: req.params.id}, function(err, venue) {
				if (err) throw err;
				if (venue) {
					res.json(venue.guests.length);
				} else {
					res.json(0);
				}
			})

		})
	
	app.route('/auth/twitter', passport.authenticate('twitter'));
	
	app.get('/auth/twitter/callback',
		passport.authenticate(
							'twitter',{
								failureRedirect: '/',
							}), function(req, res, next) {
								res.redirect(req.session.redirectUrl);
							});
	
	
	app.route('/searchvenues')
		.get(checkIfLoggedIn, function(req, res, next) {
			req.session.redirectUrl = '/searchvenues?search=' + req.query.search;
			req.location = req.query.search;
			// hit yelp api to get locations
			var yelp = new Yelp({
				consumer_key: "w8ZpdjFUPH-94SPbI7tjCQ",
				consumer_secret: "0A9_-Ll4y3mVa6blZxz-IdyBlhg",
				token: "Rw_9B4UOyWJOGQKmvDiWXq7uyQIyDS5Z",
				token_secret: "ksAG3VgXM2bPSMPkUD3kkkuvWEc",
			});
			
			yelp.search({location: req.location})
				.then(function(data) {
					var first_twenty_businesses = _.first(data.businesses, 20)
													.map((e) => { return _.pick(e, 'name', 'snippet_text', 'id', 'image_url')});
													;
					res.render('../views/venues', {businesses: first_twenty_businesses, loggedIn: req.loggedIn});
				});
		});
		

	app.route('/login')
		.get(function (req, res) {
			res.redirect('/auth/twitter/callback');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect(req.session.redirectUrl ? req.session.redirectUrl : '/');
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
