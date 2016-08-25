/**
 * Created by harkal on 18/08/16.
 */

"use strict";

var Bluebird = require("bluebird");
var MemoryStore = require('./memorystore')

function parseOptions(opts) {
    if (typeof(opts) != "object") {
        throw new Error("options needs to be an object.");
    } else {
        opts = Object.assign({}, opts)
    }

    opts.store_size = opts.store_size || 1024 * 16;
    opts.store = opts.store || new MemoryStore(opts.store_size);
    opts.rate = opts.rate || 1024.0;
    opts.period = opts.period || 1.0;
    opts.cost = opts.cost || ( ()=>1 );
    opts.key = opts.key || ( (key)=>key );
    opts.onAllowed = opts.onAllowed || ( () => true  ) ;
    opts.onThrottled = opts.onThrottled || ( () => Bluebird.reject(false)  ) ;

    // Upgrade period to milliseconds
    opts.period = opts.period * 1000.0;

    if (typeof(opts.store_size) != "number") {
        throw new Error("'store_size' needs to be a number.");
    }

    if (typeof(opts.rate) != "number") {
        throw new Error("'rate' needs to be a number.");
    }

    if (typeof(opts.period) != "number") {
        throw new Error("'period' needs to be a number.");
    }

    if (typeof(opts.cost) != "function") {
        throw new Error("'cost' needs to be a function.");
    }

    if (typeof(opts.key) != "function") {
        throw new Error("'key' needs to be a function.");
    }

    opts.createBucket = function(time) {
        return {
            tokens: opts.rate,
            mtime: time
        };
    };

    var rate = opts.rate / opts.period;

    opts.refillBucket = function(t, bucket) {
        return rate * (t - bucket.mtime);
    };

    return opts;
}

function Throttler(opts) {
    opts = parseOptions(opts);

    return function (data) {
        var key = opts.key(data);
        var cost = opts.cost(data);

        return opts.store.get(key).then(function (bucket) {
            var t = Date.now();

            bucket = bucket || opts.createBucket(t);
            var tokens = opts.refillBucket(t, bucket);
            bucket.tokens = Math.min(bucket.tokens + tokens, opts.rate);

            var throttle;

            if (bucket.tokens >= cost) {
                bucket.tokens -= cost;
                throttle = false;
            } else {
                throttle = true;
            }

            bucket.mtime = t;

            return opts.store.set(key, bucket).then(function () {
                if (throttle) {
                    return opts.onThrottled();
                } else {
                    return opts.onAllowed();
                }
            });
        });
    }
}

module.exports = Throttler;