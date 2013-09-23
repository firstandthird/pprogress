(function($){
  var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  $.declare('pprogress', {
    defaults: {
      width: 100,
      fillColor: "rgba(0,0,0,0.25)",

      // From here: http://www.gizma.com/easing/
      ease: function (t, b, c, d) {
        return c*t/d + b;
      }
    },

    init: function() {
      var self = this;

      this.lineWidthPercent = 10 / this.width;
      this.lineWidth = this.width * this.lineWidthPercent;

      this.started = false;
      this.currentPercent = 0;
      this.percentComplete = 0;

      this.canvas = $('<canvas></canvas>');
      this.canvas.attr('height', this.width);
      this.canvas.attr('width', this.width);
      this.canvas.css({
       height: this.width,
       width: this.width
      });

      this.el.html(this.canvas);

      this.context = this.canvas[0].getContext('2d');

      requestAnimationFrame($.proxy(this.updateProgress, this));
    },

    start: function() {
      var self = this;
      var timer = setInterval(function(){
        self.tick(1 / 250);
      }, 100);

      this.on('complete', function(){
        console.log('complete');
        clearInterval(timer);
      });
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
      if(this.currentPercent >= 1) {
        this.emit('complete');
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
      this.drawArc(this.width/2, this.width/2, (this.width-this.lineWidth*2)/2, this.lineWidth, 1);

      this.currentPercent = this.ease(time.getMilliseconds(), this.currentPercent, this.percentComplete - this.currentPercent, 1000);

      // Progress Ring
      this.drawArc(this.width/2, this.width/2, (this.width-this.lineWidth*2)/2, 0, this.currentPercent, true);

      this.started = true;

      requestAnimationFrame($.proxy(this.updateProgress, this));
    },

    set: function(percent) {
      this.percentComplete = percent;
    },

    tick: function(percent) {
      this.percentComplete += percent;
    }
  });
})(jQuery);