/**
 * Created by harkal on 25/08/16.
 */

var assert = require('chai').assert;
var Bluebird = require('bluebird');
var Throttler = require('../lib/throttler');

describe('Throttler', function () {
    var throttler = new Throttler({rate: 2});

    describe('Proper handle 2 requests per second', function () {
        this.timeout(2000);

        it('first message should pass', function () {
            return throttler('test').catch(function () {
                assert(false, 'call should have passed');
            });
        });

        it('second call should pass', function (done) {
            setTimeout(function () {
                throttler('test').then(function () {
                    done()
                }).catch(function () {
                    assert(false, 'call should have passed');
                });
            }, 100);
        });

        it('third call should get throttled', function (done) {
            setTimeout(function () {
                throttler('test').then(function () {
                    assert(false, 'call should have been throttled');
                }).catch(function () {
                    done();
                });
            }, 200);
        });

        it('forth call should pass', function (done) {
            setTimeout(function () {
                throttler('test').then(function () {
                    done()
                }).catch(function () {
                    assert(false, 'call should have passed');
                });
            }, 1000);
        });
    });

});