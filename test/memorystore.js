/**
 * Created by harkal on 25/08/16.
 */

var assert = require('chai').assert;
var Bluebird = require('bluebird');
var MemoryStore = require('../lib/memorystore');

describe('MemoryStore', function () {
    var storageSpace = 128;

    describe('#set', function () {
        it('should return stored value on set', function () {
            var ms = new MemoryStore(storageSpace);
            return ms.set('the_key', 100).then(function (value) {
                assert.equal(value, 100, 'value return is equal to one set')
            });
        });
    });

    describe('#get', function () {
        it('should return undefined when key not inserted', function () {
            var ms = new MemoryStore(storageSpace);
            return ms.get('unknownkey').then(function (value) {
                assert.equal(value, undefined, 'return undefined for unknown key');
            });
        });

        it('should return stored value', function () {
            var ms = new MemoryStore(storageSpace);
            var testKey = 'testkey';
            var testValue = 'testvalue';

            return ms.set(testKey, testValue).then(function () {
                return ms.get(testKey);
            }).then(function (value) {
                assert.equal(value, testValue, 'Value set equals value gotten');
            });
        });
    });

    it('should drop last inserted key on overflow', function () {
        var ms = new MemoryStore(storageSpace);
        var promises = [];

        function* iter(n) {
            for (var i = 0; i < n; i++ ) yield i;
        }

        return Bluebird.mapSeries(iter(storageSpace + 1), function (i) {
            ms.set('key' + i, i)
        }).then(function () {
            return Bluebird.all([
                ms.get('key0').then(function (value) {
                    assert.equal(value, undefined, 'value should be undefined')
                }),
                ms.get('key1').then(function (value) {
                    assert.equal(value, 1, 'value should be defined')
                })
            ]);
        });
    });
});
