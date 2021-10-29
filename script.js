!function() {
	"use strict";

	var acc   = 1.01;
	var speed = 0.025;
	var angle = 15;
	var pong1, pong2, pong3;
	var timeP = new Date();

	if (window.Audio) {
		pong1 = new Audio('./pong1.mp3');
		pong2 = new Audio('./pong2.mp3');
		pong3 = new Audio('./pong3.mp3');
	}

	var screen = {
		elem:   document.getElementById('screen'),
		left:   0,
		width:  0,
		height: 0,
		scaleX: 0,
		scaleY: 0
	}

	screen.elem.append = function (tag, att, css) {
		var object = document.createElement(tag);
		for (var i in att) object[i] = att[i];
		for (var i in css) object.style[i] = css[i];
		this.appendChild(object);
		object.append = screen.elem.append;
		return object;
	}

	screen.resize = function () {
		var o = screen.elem;
		for (screen.left = 0; o != null; o = o.offsetParent) screen.left += o.offsetLeft;
		screen.width = screen.elem.offsetWidth;
		screen.height = screen.elem.offsetHeight;
		screen.scaleX = screen.width  * 0.03;
		screen.scaleY = screen.height * 0.25;
		ball.style.width = ball.style.height      = Math.round(screen.scaleX) + 'px';
		pad[0].style.width = pad[1].style.width   = Math.round(screen.scaleX) + 'px';
		pad[0].style.height = pad[1].style.height = Math.round(screen.scaleY) + 'px';
		pad[0].style.left = Math.round(screen.scaleX) + "px";
		pad[1].style.left = Math.round(screen.width - screen.scaleX * 2) + "px";

		for (var i = 0; i < 4; i++) {
			var o = score[i].elem.style;
			o.width = o.height = Math.round(3 * screen.scaleX) + 'px';
			o.left = Math.round(score[i].d > 0 ? screen.width * 0.5 + 2 * screen.scaleX : screen.width * 0.4 - 2 * screen.scaleX) + 'px';
			o.top  = Math.round(i < 2 ? screen.scaleX : screen.height - 4 * screen.scaleX) + 'px';
		}

		sp.style.width = Math.round(screen.scaleX) + 'px';
		sp.style.left = Math.round(screen.width * 0.5 - screen.scaleX * 0.5) + 'px';
		sp.innerHTML = "";
		for (var i = 0; i < screen.height; i += screen.scaleX * 2) {
			sp.append('span', false, {
				'top':    Math.round(i) + 'px', 
				'width':  Math.round(screen.scaleX) + 'px', 
				'height': Math.round(screen.scaleX) + 'px'
			});
		}
	}

	screen.move = function (e, touch) {
		e.preventDefault();
		var pointer = touch ? e.touches[0] : e;
		var y = screen.height - screen.scaleY;
		var x = (pointer.clientX - screen.left) / screen.width;
		pad[0].y = Math.min(screen.height - screen.scaleY, Math.max(0, x * y * 2 - y * 0.5));
		pad[1].y = Math.min(screen.height - screen.scaleY, Math.max(0, (1 - x) * y * 2 - y * 0.5));
	}

	screen.down = function (e, touch) {
		e.preventDefault();
		if (player >= 0) {
			pong1 && pong1.play();
			ball.vx = screen.scaleX * speed;
			ball.vy = (Math.random() - 0.5) * screen.height * 0.01;
			if (player === 1) ball.vx = -ball.vx;
			player = -1;
		}
	}

	var score = [
		{s:0, d:-1}, 
		{s:0, d: 1}, 
		{s:0, d:-1}, 
		{s:0, d: 1}
	];

	score.chrono = function (score) {
		var dir = score.d;
		var txt = score.s + "";
		score.elem.innerHTML = "";
		var a = [119,36,93,109,46,107,123,37,127,111];
		var s = {
			1: [0,0,99,20],
			2: [0,0,33,45],
			4: [67,0,33,45],
			8: [0,40,100,20],
			16:[0,40,33,60],
			32:[67,40,33,60],
			64:[0,80,99,20]
		};
		for (var i = 0, n = txt.length; i < n; i++) {
			var c = txt.charAt(dir > 0 ? i : n - i - 1);
			var p = a[c];
			if (p) {
				var d = score.elem.append('div', false, {
					'height': '100%',
					'width': '100%',
					'left': (120 * i * dir) + '%'
				});
				for (var j in s) {
					var k = s[j];
					if (p & j) d.append('span', false, {
						'left':   k[0] + '%',
						'top':    k[1] + '%',
						'width':  k[2] + '%',
						'height': k[3] + '%'
					});
				}
			}
		}
	}

	score.forEach(function (s) {
		s.elem = screen.elem.append('div');
		score.chrono(s);
	});

	var pad = [];

	pad.ping = function () {
		if (ball.y + screen.scaleX > this.y && ball.y < this.y + screen.scaleY) {
			pong1 && pong1.play();
			score[2].s++;
			score.chrono(score[2]);
			if(score[2].s > score[3].s) {
				score[3].s = score[2].s;
				score.chrono(score[3]);
			}
			ball.vx = -ball.vx * acc;
			ball.x = this.x;
			if (ball.y < this.y) {
				ball.vy = ball.vx * -this.s * angle + Math.random() * 0.1; 
			} else if (ball.y > this.y + screen.scaleY - screen.scaleX) {
				ball.vy = ball.vx * this.s * angle  + Math.random() * 0.1;
			} else {
				ball.vy = (Math.random() - 0.5) * ball.vx * angle;
			}
		}
	}
	pad.push({
		y: 0,
		s: 1,
		ping: pad.ping,
		get x () {
			return screen.scaleX * 2;
		}
	});
	pad.push({
		y: 0, 
		s:-1, 
		ping: pad.ping, 
		get x () {
			return screen.width - screen.scaleX * 3;
		}
	});

	pad[0].style = screen.elem.append('span').style;
	pad[1].style = screen.elem.append('span').style;

	var ball = {
		vx: 0,
		vy: 0, 
		x:  0, 
		y:  0, 
		w:  0
	}

	ball.style = screen.elem.append('span').style;

	var sp = screen.elem.append('div', false, {
		'height': '100%'
	});
	var player = 0;

	if ('ontouchstart' in window) {
		screen.elem.ontouchstart = function(e) { screen.down(e, true); };
		screen.elem.ontouchmove  = function(e) { screen.move(e, true); };
	}
	window.addEventListener("mousemove",  function(e) { screen.move(e, false); }, false );
	screen.elem.addEventListener("click", function(e) { screen.down(e, false); }, false);
	window.addEventListener("resize",  screen.resize, false );
	screen.resize();

	function win (p) {
		pong3 && pong3.play();
		score[1 - p].s++;
		score.chrono(score[1 - p]);
		score[2].s = 0;
		score.chrono(score[2]);
		player = p;
	}

	function run () {
		requestAnimationFrame(run);
		var time = new Date();
		var vx = ball.vx * (time - timeP);
		if (player < 0) {
			ball.x += vx;
			ball.y += ball.vy;
		} else {
			ball.x = pad[player].x;
			ball.y = pad[player].y + screen.scaleY * 0.5 - screen.scaleX * 0.5;
		}
		timeP = time;
		if (ball.vx > 0) {
			if (ball.x > screen.width + screen.scaleX) win(1);
			else if (ball.x > screen.width - screen.scaleX * 3) pad[1].ping();
		} else {
			if (ball.x < -screen.scaleX) win(0);
			else if (ball.x < screen.scaleX * 2) pad[0].ping();
		}
		if (ball.y > screen.height - screen.scaleX || ball.y < 0) {
			pong2 && pong2.play();
			ball.vy = -ball.vy;
		}
		pad[0].style.top  = Math.round(pad[0].y) + 'px';
		pad[1].style.top  = Math.round(pad[1].y) + 'px';
		ball.style.left   = Math.round(ball.x) + 'px';
		ball.style.top    = Math.round(ball.y) + 'px';
	}
	run();
}();