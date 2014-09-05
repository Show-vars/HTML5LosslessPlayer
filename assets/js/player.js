var pad = function(n) { n = n + ''; return n.length >= 2 ? n : new Array(2 - n.length + 1).join('0') + n; }

Playlist = function() {
	this.list = [];
	this.current = 0;
	this.repeatmode = 0;
};

Playlist.prototype.add = function(track) {
	this.list.push(track);
};

Playlist.prototype.get = function(number) {
	return this.list[number];
};

Playlist.prototype.getCurrent = function() {
	return this.list[this.current];
};

Playlist.prototype.next = function() {
	if(this.current >= this.list.length - 1) {
		if(this.repeatmode == 0) {
			return -1;
		} else if(this.repeatmode == 1) {
			return (this.current = 0);
		}
	}
	if(this.repeatmode == 2) {
		return this.current;
	}
	return ++this.current;
};

Playlist.prototype.prev = function() {
	if(this.current == 0) return this.current;
	return --this.current;
};

Playlist.prototype.shuffle = function(){
    for(var j, x, i = this.list.length; i; j = Math.floor(Math.random() * i), x = this.list[--i], this.list[i] = this.list[j], this.list[j] = x);
};

Playlist.prototype.setRepeatMode = function(mode){
    if(mode < 0 || mode > 2) return;
	this.repeatmode = mode;
};

Musica = function(params) {
	
	this.ui = {
		artist: params.artist,
		title: params.title,
		seekbar: params.seekbar,
		bufferbar: params.bufferbar,
		progressbar: params.progressbar,
		timer: params.timer,
		playbtn: params.playbtn,
		backwardbtn: params.backwardbtn,
		forwardbtn: params.forwardbtn,
		volumebar: params.volumebar,
		volume: params.volume
	};
	this.pstate = 0;
	this.seekstate = 0;
	this.timetype = 0;
	this.aurora;
	this.volume = 100;
	this.playlist = new Playlist();
	
	this.ui.timer.click((function (_this) {
		return function(e) {
			_this.timetype = _this.timetype == 0 ? 1 : 0;
			_this._setTimer(_this.aurora.currentTime);
		};
	})(this));
	this.ui.playbtn.click((function (_this) {
		return function(e) {
			if(_this.pstate == 0) _this.play(); else _this.pause();
		};
	})(this));
	this.ui.backwardbtn.click((function (_this) {
		return function(e) {
			_this.prev();
		};
	})(this));
	this.ui.forwardbtn.click((function (_this) {
		return function(e) {
			_this.next();
		};
	})(this));
};

Musica.prototype.open = function() {
	if(this.aurora) this.aurora.stop();
	this.aurora = AV.Player.fromURL('http://as.iostd.ru/' + this.playlist.getCurrent().audio + '.flac');
	this.aurora.volume = this.volume;
	this.ui.volume.css('width', ((this.volume * 100 ) / this.ui.volumebar.width())+'%');
	this.pstate = 0;
	this.ui.playbtn.removeClass("fa-play fa-pause").addClass("fa-play");
	this.ui.artist.html(this.playlist.getCurrent().artist);
	this.ui.title.html(this.playlist.getCurrent().title);
	this.ui.bufferbar.css('width', '0%');
	this.ui.progressbar.css('width', '0%');
	
	this.aurora.on('buffer', (function (_this) {
		return function(percent) {
			_this.ui.bufferbar.css('width', percent+'%');
		};
	})(this));

	this.aurora.on('progress', (function (_this) {
		return function(time) {
			if(_this.seekstate == 0) _this.ui.progressbar.css('width', ((time * 100 ) / _this.aurora.duration)+'%');
			_this._setTimer(time);
		};
	})(this));
	this.aurora.on('end', (function (_this) {
		return function() {
			_this.next();
		};
	})(this));
	
	this.ui.seekbar.off();
	this.ui.seekbar.mousedown((function (_this) {
		return function(e) {
			var offsetx = e.offsetX;
			var origin = $(this);
			_this.seekstate = 1;
			_this.ui.progressbar.css('width', ((offsetx * 100 ) / $(this).width())+'%');
			$(document).mousemove(function(e) {
				offsetx = e.pageX - origin.offset().left;
				
				offsetx = offsetx < 0 ? 0 : (offsetx > origin.width() ? origin.width() : offsetx);
				_this.ui.progressbar.css('width', ((offsetx * 100 ) / origin.width())+'%');
			});
			$(document).mouseup(function(e) {
				$(document).off("mousemove");
				$(document).off("mouseup");
				_this.aurora.seek(Math.floor((offsetx * _this.aurora.duration) / origin.width()));
				_this.seekstate = 0;
			});
			
		};
	})(this));
	this.ui.volumebar.off();
	this.ui.volumebar.mousedown((function (_this) {
		return function(e) {
			var offsetx = e.offsetX;
			var origin = $(this);
			_this.ui.volume.css('width', ((offsetx * 100 ) / origin.width())+'%');
			_this.volume = Math.floor((offsetx * 100) / origin.width());
			_this.aurora.volume = _this.volume;
			$(document).mousemove(function(e) {
				offsetx = e.pageX - origin.offset().left;
				
				offsetx = offsetx < 0 ? 0 : (offsetx > origin.width() ? origin.width() : offsetx);
				_this.ui.volume.css('width', ((offsetx * 100 ) / origin.width())+'%');
				_this.volume = Math.floor((offsetx * 100) / origin.width());
				_this.aurora.volume = _this.volume
			});
			$(document).mouseup(function(e) {
				$(document).off("mousemove");
				$(document).off("mouseup");
				_this.volume = Math.floor((offsetx * 100) / origin.width());
				_this.aurora.volume = _this.volume;
			});
			
		};
	})(this));
	
	this.aurora.preload();
};
Musica.prototype._setTimer = function(time) {
	if(this.timetype == 0) {
		this.ui.timer.html(pad(Math.floor((time % 36e5) / 6e4)) + ":" + pad(Math.floor((time % 6e4) / 1000)));
	} else {
		var ntime = this.aurora.duration - time;
		this.ui.timer.html("-" + pad(Math.floor((ntime % 36e5) / 6e4)) + ":" + pad(Math.floor((ntime % 6e4) / 1000)));
	}
}; 
Musica.prototype.play = function() {
	this.aurora.play();
	this.pstate = 1;
	this.ui.playbtn.removeClass("fa-play fa-pause").addClass("fa-pause");
};

Musica.prototype.pause = function() {
	this.aurora.pause();
	this.pstate = 0;
	this.ui.playbtn.removeClass("fa-play fa-pause").addClass("fa-play");
};

Musica.prototype.next = function() {
	if(this.playlist.next() !== -1) {
		var pss = this.pstate;
		this.pause();
		this.open();
		if(pss == 1) {
			this.play();
		}
	}
};

Musica.prototype.prev = function() {
	if(this.playlist.prev() !== -1) {
		var pss = this.pstate;
		this.pause();
		this.open();
		if(pss == 1) {
			this.play();
		}
	}
};

Musica.prototype.debug = function(to) {
	this.aurora.on('ready', (function (_this) {
		return function() {
			to("Format: " + _this.aurora.format.formatID + "\n" + 
			   "Sample rate: " + _this.aurora.format.sampleRate + "\n" + 
			   "Channels: " + _this.aurora.format.channelsPerFrame + "\n" + 
			   "Bit depth: " + _this.aurora.format.bitsPerChannel);
		};
	})(this));
};
