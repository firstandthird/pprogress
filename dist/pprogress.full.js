/*!
 * pprogress - Pie style progress inidcator
 * v0.1.1
 * https://github.com/firstandthird/pprogress
 * copyright First + Third 2013
 * MIT License
*/
/*!
 * fidel - a ui view controller
 * v2.2.3
 * https://github.com/jgallen23/fidel
 * copyright Greg Allen 2013
 * MIT License
*/
(function(w, $) {
  var _id = 0;
  var Fidel = function(obj) {
    this.obj = obj;
  };

  Fidel.prototype.__init = function(options) {
    $.extend(this, this.obj);
    this.id = _id++;
    this.obj.defaults = this.obj.defaults || {};
    $.extend(this, this.obj.defaults, options);
    $('body').trigger('FidelPreInit', this);
    this.setElement(this.el || $('<div/>'));
    if (this.init) {
      this.init();
    }
    $('body').trigger('FidelPostInit', this);
  };
  Fidel.prototype.eventSplitter = /^(\w+)\s*(.*)$/;

  Fidel.prototype.setElement = function(el) {
    this.el = el;
    this.getElements();
    this.delegateEvents();
    this.dataElements();
    this.delegateActions();
  };

  Fidel.prototype.find = function(selector) {
    return this.el.find(selector);
  };

  Fidel.prototype.proxy = function(func) {
    return $.proxy(func, this);
  };

  Fidel.prototype.getElements = function() {
    if (!this.elements)
      return;

    for (var selector in this.elements) {
      var elemName = this.elements[selector];
      this[elemName] = this.find(selector);
    }
  };

  Fidel.prototype.dataElements = function() {
    var self = this;
    this.find('[data-element]').each(function(index, item) {
      var el = $(item);
      var name = el.data('element');
      self[name] = el;
    });
  };

  Fidel.prototype.delegateEvents = function() {
    var self = this;
    if (!this.events)
      return;
    for (var key in this.events) {
      var methodName = this.events[key];
      var match = key.match(this.eventSplitter);
      var eventName = match[1], selector = match[2];

      var method = this.proxy(this[methodName]);

      if (selector === '') {
        this.el.on(eventName, method);
      } else {
        if (this[selector] && typeof this[selector] != 'function') {
          this[selector].on(eventName, method);
        } else {
          this.el.on(eventName, selector, method);
        }
      }
    }
  };

  Fidel.prototype.delegateActions = function() {
    var self = this;
    self.el.on('click', '[data-action]', function(e) {
      var el = $(this);
      var action = el.attr('data-action');
      if (self[action]) {
        self[action](e, el);
      }
    });
  };

  Fidel.prototype.on = function(eventName, cb) {
    this.el.on(eventName+'.fidel'+this.id, cb);
  };

  Fidel.prototype.one = function(eventName, cb) {
    this.el.one(eventName+'.fidel'+this.id, cb);
  };

  Fidel.prototype.emit = function(eventName, data, namespaced) {
    var ns = (namespaced) ? '.fidel'+this.id : '';
    this.el.trigger(eventName+ns, data);
  };

  Fidel.prototype.hide = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].hide();
      }
    }
    this.el.hide();
  };
  Fidel.prototype.show = function() {
    if (this.views) {
      for (var key in this.views) {
        this.views[key].show();
      }
    }
    this.el.show();
  };

  Fidel.prototype.destroy = function() {
    this.el.empty();
    this.emit('destroy');
    this.el.unbind('.fidel'+this.id);
  };

  Fidel.declare = function(obj) {
    var FidelModule = function(el, options) {
      this.__init(el, options);
    };
    FidelModule.prototype = new Fidel(obj);
    return FidelModule;
  };

  //for plugins
  Fidel.onPreInit = function(fn) {
    $('body').on('FidelPreInit', function(e, obj) {
      fn.call(obj);
    });
  };
  Fidel.onPostInit = function(fn) {
    $('body').on('FidelPostInit', function(e, obj) {
      fn.call(obj);
    });
  };
  w.Fidel = Fidel;
})(window, window.jQuery || window.Zepto);

(function($) {
  $.declare = function(name, obj) {

    $.fn[name] = function() {
      var args = Array.prototype.slice.call(arguments);
      var options = args.shift();
      var methodValue;
      var els;

      els = this.each(function() {
        var $this = $(this);

        var data = $this.data(name);

        if (!data) {
          var View = Fidel.declare(obj);
          var opts = $.extend({}, options, { el: $this });
          data = new View(opts);
          $this.data(name, data); 
        }
        if (typeof options === 'string') {
          methodValue = data[options].apply(data, args);
        }
      });

      return (typeof methodValue !== 'undefined') ? methodValue : els;
    };

    $.fn[name].defaults = obj.defaults || {};

  };

  $.Fidel = window.Fidel;

})(jQuery);

(function($){
  var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  $.declare('pprogress', {
    defaults: {
      width: 100,
      fillColor: "rgba(0,0,0,0.25)",

      // These control the fake loading rate
      speed: 500,
      rate: 0.02,
      cap: 0.90,

      // From here: http://www.gizma.com/easing/
      ease: function (t, b, c, d) {
        return c*t/d + b;
      }
    },

    init: function() {
      var self = this;

      this.lineWidth = this.width * 0.05;
      this.lineWidthOut = this.lineWidth;

      this.started = false;
      this.currentPercent = 0;
      this.percentComplete = 0;
      this.outerRingWidth = 0;

      this.canvas = $('<canvas></canvas>');
      this.canvas.attr('height', this.width);
      this.canvas.attr('width', this.width);
      this.canvas.css({
       height: this.width,
       width: this.width
      });

      this.el.html(this.canvas);

      this.context = this.canvas[0].getContext('2d');

      this.context.fillStyle = this.fillColor;
      this.context.fillRect(0, 0, this.width, this.width);
    },

    start: function(disableFake) {
      var self = this;

      requestAnimationFrame(this.proxy(this.updateProgress));

      if(!disableFake) {
        var timer = setInterval(function(){
          if(self.currentPercent >= self.cap) {
            clearInterval(timer);
          }

          self.inc();
        }, this.speed);
      }
    },

    drawArc: function(x, y, rad, width, percent, fill) {
      if(percent !== 1 && percent !== 0) {
        percent = 1 - percent;
      }

      this.context.beginPath();
      if(fill) this.context.moveTo(this.width/2, this.width/2);
      this.context.arc(x, y, rad, 1.5*Math.PI - (360 * percent) * (Math.PI/180), (3 * Math.PI) / 2, true);
      
      if(fill) {
        this.context.fillStyle = "rgba(0,0,0,1)";
        this.context.fill();
      } else {
        this.context.lineWidth = width;
        this.context.stroke();
      }

    },

    updateProgress: function() {
      if(this.currentPercent >= 0.99) {
        this.animateOut();
        return;
      } else if(!this.started) {
        this.emit('start');
      }

      var time = new Date();

      this.context.clearRect(0, 0, this.width, this.width);

      this.context.globalCompositeOperation = 'source-over';

      this.context.fillStyle = this.fillColor;
      this.context.fillRect(0, 0, this.width, this.width);

      this.context.globalCompositeOperation = 'destination-out';

      // Outer Ring
      this.outerRingWidth = this.ease(time.getMilliseconds(), this.outerRingWidth, (this.width-this.lineWidth*2)/2 - this.outerRingWidth, 2000);
      this.drawArc(this.width/2, this.width/2, this.outerRingWidth, this.lineWidth, 1);

      this.currentPercent = this.ease(time.getMilliseconds(), this.currentPercent, this.percentComplete - this.currentPercent, 1000);

      // Progress Ring
      this.drawArc(this.width/2, this.width/2, this.outerRingWidth, 0, this.currentPercent, true);

      this.started = true;

      requestAnimationFrame(this.proxy(this.updateProgress));
    },

    animateOut: function() {
      this.context.clearRect(0, 0, this.width, this.width);

      if(Math.ceil(this.lineWidthOut) >= this.width/2) {
        this.emit('complete');
        return;
      }

      var time = new Date();

      this.context.globalCompositeOperation = 'source-over';

      this.context.fillStyle = this.fillColor;
      this.context.fillRect(0, 0, this.width, this.width);

      this.context.globalCompositeOperation = 'destination-out';

      // Outer Ring
      this.lineWidthOut = this.ease(time.getMilliseconds(), this.lineWidthOut, this.width/2 - this.lineWidthOut, 2000);
      this.drawArc(this.width/2, this.width/2, this.outerRingWidth, this.lineWidthOut, 1);
      
      this.context.beginPath();
      this.context.arc(this.width/2, this.width/2, this.outerRingWidth, Math.PI * 2, 0, true);
      this.context.closePath();
      this.context.fillStyle = "rgba(0,0,0,1)";
      this.context.fill();

      requestAnimationFrame(this.proxy(this.animateOut));
    },

    set: function(percent) {
      this.percentComplete = percent;
      if(this.percentComplete > 1) this.percentComplete = 1;
      if(this.percentComplete < 0) this.percentComplete = 0;
    },

    tick: function(percent) {
      this.percentComplete += percent;
      if(this.percentComplete > 1) this.percentComplete = 1;
      if(this.percentComplete < 0) this.percentComplete = 0;
    },

    inc: function() {
      this.tick(Math.random() * this.rate);
    },

    done: function() {
      this.set(1);
    }
  });
})(jQuery);