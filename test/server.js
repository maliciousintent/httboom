/*jshint node:true, eqnull:true, laxcomma:true, indent:2, trailing:true */

'use strict';

var httboom = require('../')
  , expressSucks = require('expresssucks').expressSucks
  , connect = require('connect')
  ;

var that = 'foo';

module.exports = function () {

  var app = connect()
    .use(connect.logger('dev'))
    .use(expressSucks())
    .use(function (req, res, next) {
      next(new httboom.AppError(
        500,
        'E_SERVER_ERROR',
        'Sorry, your request cannot be handled',
        'The database has returned an error.'));
    })
    .use(httboom.middleware(console, function (req) {
      console.error('I will log', that);
    }))
    .listen(process.env.PORT || 3000);

};
