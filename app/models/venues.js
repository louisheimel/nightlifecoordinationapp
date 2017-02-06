'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Venue = new Schema({
    id: {type: String, required: true},
    count: {type: Number, default: 0},
});

module.exports = mongoose.model('Venue', Venue);
