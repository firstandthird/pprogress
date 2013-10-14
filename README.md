#pprogress

jQuery plugin for a pie style progress inidcator.  Heavily inspired by iOS7 and [nprogress](http://ricostacruz.com/nprogress/).

![screenshot](https://raw.github.com/firstandthird/pprogress/master/screenshot.png)

##Installation

###Bower

`bower install pprogress`

###Manual Download

- [Development]()
- [Production]()

##Usage

###Basic

```javascript
//element that the pie indicator will get appended to
var el = $(selector);

//init
el.pprogress()

//start progress
el.pprogress('start')

//work gets done

//work complete
el.pprogress('done')
```

###Advanced

####Options (defaults shown)

```javascript
$(selector).pprogress({
	width: 100, //size of pie indicator
	fillColor: "rgba(0,0,0,0.25)", //color of pie chart
  speed: 500, //speed for fake loader
  rate: 0.02, //modifier for inc() and start(). Will by multiplied by Math.random()
  cap: 0.90, //max percent complete start() will go
  ease: function(t, b, c, d){} //easing function to use. See: http://www.gizma.com/easing/ for available functions
})
```

####Start
Starts a fake loader that calls inc() at configured rate.You will need to call done() when you're ready for it to finish. Will max out at 90% or configured cap. If you pass in true the random loader will be disabled.

```javascript
$(selector).pprogress('start');
```

```javascript
$(selector).pprogress('start', true);
```

####Set
Sets the current percent complete.

```javascript
$(selector).pprogress('set', 0.5)
```

####Increment
Increments by random amounts. 

```javascript
$(selector).pprogress('inc')
```

####Tick
Incremements by a set amount. Adds passed value to existing percent complete.

```javascript
$(selector).pprogress('tick', 0.02);
````

####Done
Sets completion to 100%

```javascript
$(selector).pprogress('done');
```

##Development

###Requirements

- node and npm
- bower `npm install -g bower`
- grunt `npm install -g grunt-cli`

###Setup

- `npm install`
- `bower install`

###Run

`grunt dev`

###Tests

`grunt mocha`
