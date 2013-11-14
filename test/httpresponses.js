/*jshint node:true, eqnull:true, laxcomma:true, indent:2, trailing:true */
/*global describe, it, before, beforeEach */

'use strict';

var request = require('superagent')
  , assert = require('assert')
  ;


describe('httboom.middleware()', function () {
  var app
    ;
  
  describe('JSON response', function () {
    var res;
    
    before(function (done) {
      request.get('http://localhost:3000/')
      .set('Accept', 'application/json')
      .end(function (res_) {
        res = res_;
        done();
      });
    });
      
    it('should have the expected status code', function () {
      assert.equal(res.statusCode, 500);
    });
    
    it('should have the correct content-type header', function () {
      assert.equal(res.headers['content-type'], 'application/json');
    });
    
    it('should contain valid json', function () {
      assert.equal(typeof res.body, 'object');
    });
    
    it('should contain the expected error message', function () {
      assert.equal(res.body.message, 'Sorry, your request cannot be handled');
    });
      
  });
  
  
  describe('HTML response', function () {
    var res;
    
    before(function (done) {
      request.get('http://localhost:3000/')
      .set('Accept', 'text/html')
      .end(function (res_) {
        res = res_;
        done();
      });
    });
      
    it('should have the expected status code', function () {
      assert.equal(res.statusCode, 500);
    });
    
    it('should have the correct content-type header', function () {
      assert.equal(res.headers['content-type'], 'text/html');
    });
    
    it('should contain some text', function () {
      assert.equal(typeof res.text, 'string');
      assert.ok(res.text);
    });
    
    it('should match the expected response', function () {
      assert(res.text.match(/<html lang="en"><head><meta charset="utf-8"><\/head><body><p>Application Error: Sorry, your request cannot be handled\.<br \/>Error ID: ([a-z0-9\-]{36})<\/p><\/body><\/html>/));
    });
    
      
  });  
  
  
  
  describe('Plain-text response', function () {
    var res;
    
    before(function (done) {
      request.get('http://localhost:3000/')
      .set('Accept', 'application/x-foo')
      .end(function (res_) {
        res = res_;
        done();
      });
    });
      
    it('should have the expected status code', function () {
      assert.equal(res.statusCode, 500);
    });
    
    it('should have the correct content-type header', function () {
      assert.equal(res.headers['content-type'], 'text/plain');
    });
    
    it('should contain some text', function () {
      assert.equal(typeof res.text, 'string');
      assert.ok(res.text);
    });
    
    it('should contain the expected error message', function () {
      assert(res.text.indexOf('Sorry, your request cannot be handled') > -1);
    });
    
    it('should not contain the debug error message', function () {
      assert.equal(res.text.indexOf('The database has returned an error.'), -1);
    });
      
  });
  
  
});
