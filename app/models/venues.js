'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./users.js');
var _ = require('underscore');

var Venue = new Schema({
    id: {type: String, required: true},
    guests: [{type: Schema.Types.ObjectId, ref: 'User'}],
});

Venue.methods.toggleUser = function toggleUser(usr) {
    // console.log('here\'s the guest list: ' + this.guests)
    // console.log('this is the length of the guest list: ' + this.guests.length)
    // console.log('here is the passed in user: ' + usr)
    var guestIsHere = function(guest) { return guest.equals(usr); };
    // console.log(this.guests.some(guestIsHere) ? 'guest is here!' : 'guest is not here...');
    if (this.guests.some(guestIsHere)) {
        // remove guest
        this.guests = this.guests.filter((e) => { return !e.equals(usr); });
    } else {
        // add guest
        this.guests.push(usr);
    }
}

Venue.methods.howManyGoing = function howManyGoing() {
    return this.guests.length;
}

Venue.methods.isUserGoing = function isUserGoing(usr) {
    return this.guests.some(function(guest) { return guest.equals(usr); });
}

module.exports = mongoose.model('Venue', Venue);
