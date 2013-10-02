/*!
 * pprogress - Pie style progress inidcator
 * v0.1.0
 * https://github.com/firstandthird/pprogress
 * copyright First + Third 2013
 * MIT License
*/
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