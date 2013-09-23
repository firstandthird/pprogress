#pprogress

jQuery plugin for a pie style progress inidcator.  Heavily inspired by iOS7 and [nprogress](http://ricostacruz.com/nprogress/).

*Screenshot goes here*

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

####Set

```javascript
$(selector).pprogress('set', 0.5)
```

####Increment

```javascript
$(selector).pprogress('inc')
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
