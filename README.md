# fast-throttler

Throttle the amount of times your function runs by adding a limit.

## Installation

` npm install fast-throller --save `

## Simple Usage
```javascript 
const Throttler = require('fast-throttler'); 
var throttler = new Throttler({rate: 2}); //will throttle 2 requests per second 
```

For example, you can throttle a GET request per _product id_ in Express.js like this 

```javascript 
router.get('/product/:id', function(req, res){
  throttler(req.params.id)
    .then(function(){
       //...
       res.render('template', productData);
    })
    .catch(function(error){
       //...
       res.status(429); //Too many requests
    });
});
```

## Options

|Parameter|Type|Default Value|
|:---------:|:----:|:-------------:|
|Rate|Number|1024|
|Period|Number|1|
|Cost|Function|()=>1|
|Key|Function|(key)=>key|

## Events

|Name|Description|
|---------:|:----|
|onAllowed|Executes when throttler is operating within limits|
|onThrottled|Executes when throttler rate is overreached |





