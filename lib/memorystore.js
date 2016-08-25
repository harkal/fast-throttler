/**
 * Created by harkal on 24/08/16.
 */

var Bluebird = require('bluebird');
var LRU = require('lru-cache');

function MemoryStore(size) {
    this.cache = new LRU(size);
}

MemoryStore.prototype.set = function (key, value) {
    this.cache.set(key, value);
    return Bluebird.resolve(value);
};

MemoryStore.prototype.get = function (key) {
    return Bluebird.resolve(this.cache.get(key));
};

module.exports = MemoryStore;